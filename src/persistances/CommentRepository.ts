import * as knex from "knex";

import { RequestBodyComment } from "models/Comment";

import { ResponseGetComment } from "generated/types/ResponseGetComment";

interface CommentRow {
  readonly id: number;
  readonly post_id: number;
  readonly comment: string;
}

const commentTableName = "comment";

const columns = {
  id: "id",
  post_id: "post_id",
  comment: "comment",
};

export class CommentRepository {
  constructor(private knex: knex) {}

  getAll = (requestParamsId: number): Promise<Array<ResponseGetComment>> =>
    this.knex
      .select<CommentRow[]>(columns)
      .from(commentTableName)
      .where("post_id", requestParamsId)
      .then((results): ResponseGetComment[] =>
        results.map((r) => ({
          id: r.id,
          postId: r.post_id,
          comment: r.comment,
        }))
      );

  delete = (commentIdToDelete: number): Promise<boolean> =>
    this.knex(commentTableName)
      .where("id", commentIdToDelete)
      .del()
      .then((r) => (r > 0 ? true : false));

  createOne = (requestBody: RequestBodyComment, postId: number): Promise<boolean> =>
    this.knex(commentTableName)
      .insert({
        id: requestBody.id,
        post_id: postId,
        comment: requestBody.comment,
      })
      .then((r) => (r.length > 0 ? true : false));

  updateOne = (requestParamsId: number, requestBody: RequestBodyComment): Promise<boolean> =>
    this.knex(commentTableName)
      .where("id", requestParamsId)
      .update({ comment: requestBody.comment })
      .then((r) => (r > 0 ? true : false));
}
