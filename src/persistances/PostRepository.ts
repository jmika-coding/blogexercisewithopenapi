import * as knex from "knex";
import { RequestBodyPost, RequestBodyDefault } from "models/Post";

import { ResponseGetPost } from "../generated/types/ResponseGetPost";

interface PostRow {
  readonly id: number, title: string, post: string, likes: number
}

const postTableName = "blog"

const columns = {
  id: "id",
  title: "title",
  post: "post",
  likes: "likes"
}

export class PostRepository {
  constructor(private knex: knex) {}

  // TODO from PostRow to Post
  getAll = (): Promise<Array<ResponseGetPost>> => this.knex.select<PostRow>().from(postTableName);

  delete = (postIdToDelete: number) => this.knex("blog").where("id", postIdToDelete).del();

  createOne = (requestBody: RequestBodyPost) =>
    this.knex(postTableName).insert({
      id: requestBody.id,
      title: requestBody.title,
      post: requestBody.post,
      likes: requestBody.likes,
    }).then(r => r.length > 1 ? r[0] === 1 : false);

  // Try to make PATCH
  updateOne = (requestParamsId: number, requestBody: RequestBodyDefault, keyDecoded: string) =>
    this.knex(postTableName)
      .where(columns.id, requestParamsId)
      .update({title: requestBod});
}
