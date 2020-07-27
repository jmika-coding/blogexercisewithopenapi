import {IncomingMessage} from 'http'
import {FastifyRequest, DefaultQuery, DefaultParams, DefaultHeaders, DefaultBody} from 'fastify'
import * as t from 'io-ts'
import { fold } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { isLeft, isRight } from 'fp-ts/lib/Either'

import {RequestBodyValuesTypePost, requestBody, RequestBodyValuesTypePut, RequestBodyPost} from "../models/Post"
import {PostRepository} from "persistances/PostRepository"

import {Handlers} from '../generated/contracts/registerFastify'
import {ResponseGetPost} from '../generated/types/ResponseGetPost'
import {Response} from '../generated/types/Response'
import * as ErrorType from '../generated/types/Error'

// Routes
export function PostRoutes (post: PostRepository): Handlers {

  return {
    getPosts: {
      listAllPosts: async ({}, response) => {
        const allPosts: ResponseGetPost[] = await post.getAll()
        return response.code(200).header('Content-Type', 'application/json; charset=utf-8').send<ResponseGetPost[]>(allPosts)
      },
      createOnePost: async (request:FastifyRequest<IncomingMessage, DefaultQuery, DefaultParams, DefaultHeaders, DefaultBody>, response) => {
        try {
          const requestBody: RequestBodyPost = {post: request.body.post || "", likes: request.body.likes || 0, comment: request.body.comment || ""};
          if(isRight(RequestBodyValuesTypePost.decode(request.body)) && await post.createOne(requestBody)) {
            return response.code(201).header('Content-Type', 'application/json; charset=utf-8').send<Response>({response :"Post created"})
          } else { return response.code(400).header('Content-Type', 'application/json; charset=utf-8').send<ErrorType.Error>({error: "Invalid type or parameter send in body"}) }
        } catch(error) {
          if(error) { throw new Error(error); }
        }
      }
    },
    updatePost: {
      updateOnePost: async (request, response) => {
        try {
          // failure handler
          const onLeft = (errors: t.Errors): string => `${errors.length} error(s) found`
          // success handler
          const onRight = (s: string) => s

          await Promise.all(Object.keys(request.body).map(async key => {
            const keyDecoded = pipe(requestBody.decode(key), fold(onLeft,  onRight))
            if(isLeft(requestBody.decode(key)) || isLeft(RequestBodyValuesTypePut.decode(request.body)) || !await post.updateOne(Number(request.params.id), request.body, keyDecoded)){
              throw new Error("Invalid type or parameter send in body")
            }
          }))
          return response.code(200).header('Content-Type', 'application/json; charset=utf-8').send<Response>({response: "Post " + request.params.id + " updated"})
        } catch(error) {
          if(error) {
            if(error.message === "Invalid type or parameter send in body") { return response.code(400).header('Content-Type', 'application/json; charset=utf-8').send<ErrorType.Error>({error: error.message}); }
            else { throw new Error(error); }
          }
        }
      },
      deleteOnePost: async (request, response) => {
        try{
          if(await post.delete(Number(request.params.id))) {
            return response.code(200).header('Content-Type', 'application/json; charset=utf-8').send<Response>({response: "Post " + request.params.id + " deleted"})
          } else { return response.code(400).header('Content-Type', 'application/json; charset=utf-8').send<ErrorType.Error>({error: "Nothing to delete"}) }
        } catch(error) {
          if(error) { throw new Error(error); }
        }
      }
    }
  }
};
