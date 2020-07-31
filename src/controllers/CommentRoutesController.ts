import { FastifyRequest } from "fastify";
import { isLeft, isRight } from "fp-ts/lib/Either";

import { CommentRepository } from "persistances/CommentRepository";

import commentsContract from "../generated/contracts/commentsContract";
import { ResponseGetComment } from "../generated/types/ResponseGetComment";
import { Response } from "../generated/types/Response";
import * as ErrorType from "../generated/types/Error";

import { RequestBodyValuesTypeComment, RequestBodyComment } from "../models/Comment";

// Routes
export function GetComments(comment: CommentRepository): commentsContract {
  return {
    listAllCommentsForAPost: async (request: FastifyRequest, response) => {
      const allPosts: ResponseGetComment[] = await comment.getAll(request.query.postId);
      return response
        .code(200)
        .header("Content-Type", "application/json; charset=utf-8")
        .send<ResponseGetComment[]>(allPosts);
    },
    createOneComment: async (request: FastifyRequest, response) => {
      try {
        const requestBody: RequestBodyComment = {
          id: request.body.id,
          comment: request.body.comment || "",
        };
        if (
          isRight(RequestBodyValuesTypeComment.decode(request.body)) &&
          (await comment.createOne(requestBody, request.query.postId))
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
    updateOneComment: async (request: FastifyRequest, response) => {
      try {
        if (
          isLeft(RequestBodyValuesTypeComment.decode(request.body)) ||
          !(await comment.updateOne(Number(request.params.id), request.body))
        ) {
          throw new TypeError("Invalid type or parameter send in body");
        }
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
    deleteOneComment: async (request, response) => {
      try {
        if (await comment.delete(Number(request.params.id))) {
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
