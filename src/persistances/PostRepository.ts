import * as knex from "knex";
import { RequestBodyPost, RequestBodyPatch } from "models/Post";

interface PostRow {
  readonly id: number;
  readonly title: string;
  readonly post: string;
  readonly likes: number;
}

const postTableName = "post";

const columns = {
  id: "id",
  title: "title",
  post: "post",
  likes: "likes",
};

export class PostRepository {
  constructor(private knex: knex) {}

  getAll = (): Promise<Array<RequestBodyPost>> =>
    this.knex
      .select<PostRow[]>(columns)
      .from(postTableName)
      .then((results): RequestBodyPost[] =>
        results.map((r) => ({
          id: r.id,
          title: r.title,
          post: r.post,
          likes: r.likes,
        }))
      );

  delete = (postIdToDelete: number): Promise<boolean> =>
    this.knex(postTableName)
      .where("id", postIdToDelete)
      .del()
      .then((r) => (r > 0 ? true : false));

  createOne = (requestBody: RequestBodyPost): Promise<boolean> =>
    this.knex(postTableName)
      .insert({
        id: requestBody.id,
        title: requestBody.title,
        post: requestBody.post,
        likes: requestBody.likes,
      })
      .then((r) => (r.length > 0 ? true : false));

  // PATCH query
  // If value undefined, knex don't update it (don't consider it)
  updateOne = (requestParamsId: number, requestBody: RequestBodyPatch): Promise<boolean> =>
    this.knex(postTableName)
      .where(columns.id, requestParamsId)
      .update({ title: requestBody.title, post: requestBody.post, likes: requestBody.likes })
      .then((r) => (r > 0 ? true : false));
}
