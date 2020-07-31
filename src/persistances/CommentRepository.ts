import * as knex from "knex";
import { RequestBodyDefault } from "models/Post";
import { RequestBodyComment, RequestBodyValuesTypeComment } from "models/Comment";

import { ResponseGetComment } from "generated/types/ResponseGetComment";

export class CommentRepository {
  constructor(private knex: knex) {}

  getAll = (requestParamsId: number): Promise<Array<ResponseGetComment>> =>
    this.knex.select().from("comment").where("postId", requestParamsId);

  delete = (commentIdToDelete: number) => this.knex("comment").where("id", commentIdToDelete).del();

  createOne = (requestBody: RequestBodyComment, postId: number) =>
    this.knex("comment").insert({
      id: requestBody.id,
      postId: postId,
      comment: requestBody.comment,
    });

  updateOne = (requestParamsId: number, requestBody: RequestBodyComment) =>
    this.knex("comment").where("id", requestParamsId).update({ comment: requestBody.comment });
}
