import { FastifyRequest } from "fastify";

import { PostRepository } from "persistances/PostRepository";

import postsContract, {
  listAllPosts,
  createOnePost,
  updateOnePost,
  deleteOnePost,
} from "../generated/contracts/postsContract";
import { ResponseGetPost } from "../generated/types/ResponseGetPost";

// Routes
export function GetPosts(postRepository: PostRepository): postsContract {
  return {
    listAllPosts: listAllPosts(postRepository),
    createOnePost: createOnePost(postRepository),
    updateOnePost: updateOnePost(postRepository),
    deleteOnePost: deleteOnePost(postRepository),
  };
}

function listAllPosts(postRepository: PostRepository): listAllPosts {
  return async (_: any, response) => {
    const allPosts: ResponseGetPost[] = await postRepository.getAll();
    return response.code(200).send<ResponseGetPost[]>(allPosts);
  };
}

function createOnePost(postRepository: PostRepository): createOnePost {
  return async (request: FastifyRequest, response) => {
    if (await postRepository.createOne(request.body)) {
      return response.code(201).send();
    } else {
      request.log.error("Error while creating a post");
      return response.code(400).send();
    }
  };
}

function updateOnePost(postRepository: PostRepository): updateOnePost {
  return async (request, response) => {
    if (await postRepository.updateOne(Number(request.params.id), request.body)) {
      return response.code(204).send();
    } else {
      request.log.error("Error while updating a post");
      return response.code(400).send();
    }
  };
}

function deleteOnePost(postRepository: PostRepository): deleteOnePost {
  return async (request, response) => {
    if (await postRepository.delete(Number(request.params.id))) {
      return response.code(204).send();
    } else {
      request.log.error("Nothing to delete");
      return response.code(404).send();
    }
  };
}
