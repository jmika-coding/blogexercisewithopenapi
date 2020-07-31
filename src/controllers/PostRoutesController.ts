import { FastifyRequest } from "fastify";
import * as t from "io-ts";
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { isLeft, isRight } from "fp-ts/lib/Either";

import { PostRepository } from "persistances/PostRepository";

import postsContract from "../generated/contracts/postsContract";
import { ResponseGetPost } from "../generated/types/ResponseGetPost";
import { Response } from "../generated/types/Response";
import * as ErrorType from "../generated/types/Error";

// prettier-ignore
import { RequestBodyValuesTypePost, requestBody, RequestBodyValuesTypePut,
  RequestBodyPost } from "../models/Post";

// Routes
export function GetPosts(post: PostRepository): postsContract {
  return {
    listAllPosts: async (_, response) => {
      const allPosts: ResponseGetPost[] = await post.getAll();
      return response
        .code(200)
        .header("Content-Type", "application/json; charset=utf-8")
        .send<ResponseGetPost[]>(allPosts);
    },
    createOnePost: async (request: FastifyRequest, response) => {
      try {
        const requestBody: RequestBodyPost = {
          id: request.body.id,
          title: request.body.title || "",
          post: request.body.post || "",
          likes: request.body.likes || 0,
        };
        if (
          isRight(RequestBodyValuesTypePost.decode(request.body)) &&
          (await post.createOne(requestBody))
        ) {
          return response
            .code(201)
            .header("Content-Type", "application/json; charset=utf-8")
            .send<Response>({ response: "Post created" });
        } else {
          throw new TypeError("Invalid type or parameter send in body");
        }
      } catch (error) {
        if (error instanceof TypeError) {
          request.log.error(error);
          return response
            .code(400)
            .header("Content-Type", "application/json; charset=utf-8")
            .send<ErrorType.Error>({ error: error.message });
        } else {
          throw new Error(error);
        }
      }
    },
    updateOnePost: async (request, response) => {
      try {
        // failure handler
        const onLeft = (errors: t.Errors): string => `${errors.length} error(s) found`;
        // success handler
        const onRight = (s: string) => s;

        await Promise.all(
          Object.keys(request.body).map(async (key) => {
            const keyDecoded = pipe(requestBody.decode(key), fold(onLeft, onRight));
            if (
              isLeft(requestBody.decode(key)) ||
              isLeft(RequestBodyValuesTypePut.decode(request.body)) ||
              !(await post.updateOne(Number(request.params.id), request.body, keyDecoded))
            ) {
              throw new TypeError("Invalid type or parameter send in body");
            }
          })
        );
        return response
          .code(200)
          .header("Content-Type", "application/json; charset=utf-8")
          .send<Response>({
            response: "Post " + request.params.id + " updated",
          });
      } catch (error) {
        if (error) {
          if (error instanceof TypeError) {
            request.log.error(error);
            return response
              .code(400)
              .header("Content-Type", "application/json; charset=utf-8")
              .send<ErrorType.Error>({ error: error.message });
          } else {
            throw new Error(error);
          }
        }
      }
    },
    deleteOnePost: async (request, response) => {
      try {
        if (await post.delete(Number(request.params.id))) {
          return response
            .code(200)
            .header("Content-Type", "application/json; charset=utf-8")
            .send<Response>({
              response: "Post " + request.params.id + " deleted",
            });
        } else {
          throw new ErrorEvent("Nothing to delete");
        }
      } catch (error) {
        if (error instanceof ErrorEvent) {
          request.log.error(error);
          return response
            .code(400)
            .header("Content-Type", "application/json; charset=utf-8")
            .send<ErrorType.Error>({ error: error.message });
        } else {
          throw new Error(error);
        }
      }
    },
  };
}
