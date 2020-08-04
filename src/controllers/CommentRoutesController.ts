import { FastifyRequest } from "fastify";

import { CommentRepository } from "persistances/CommentRepository";

import commentsContract, {
  listAllCommentsForAPost,
  createOneComment,
  updateOneComment,
  deleteOneComment,
} from "generated/contracts/commentsContract";
import { ResponseGetComment } from "generated/types/ResponseGetComment";

import { RequestBodyComment } from "models/Comment";

// Routes
export function GetComments(commentRepository: CommentRepository): commentsContract {
  return {
    listAllCommentsForAPost: listAllCommentsForAPost(commentRepository),
    createOneComment: createOneComment(commentRepository),
    updateOneComment: updateOneComment(commentRepository),
    deleteOneComment: deleteOneComment(commentRepository),
  };
}

function listAllCommentsForAPost(commentRepository: CommentRepository): listAllCommentsForAPost {
  return async (request: FastifyRequest, response) => {
    const allPosts: ResponseGetComment[] = await commentRepository.getAll(request.query.postId);
    return response.code(200).send<ResponseGetComment[]>(allPosts);
  };
}

function createOneComment(commentRepository: CommentRepository): createOneComment {
  return async (request: FastifyRequest, response) => {
    const requestBody: RequestBodyComment = {
      id: request.body.id,
      comment: request.body.comment,
    };
    if (await commentRepository.createOne(requestBody, request.query.postId)) {
      return response.code(201).send();
    } else {
      request.log.error("Error while creating a comment");
      return response.code(400).send();
    }
  };
}

function updateOneComment(commentRepository: CommentRepository): updateOneComment {
  return async (request: FastifyRequest, response) => {
    if (await commentRepository.updateOne(Number(request.params.id), request.body)) {
      return response.code(204).send();
    } else {
      request.log.error("Error while updating a comment");
      return response.code(400).send();
    }
  };
}

function deleteOneComment(commentRepository: CommentRepository): deleteOneComment {
  return async (request, response) => {
    if (await commentRepository.delete(Number(request.params.id))) {
      return response.code(204).send();
    } else {
      request.log.error("Nothing to delete");
      return response.code(404).send();
    }
  };
}
