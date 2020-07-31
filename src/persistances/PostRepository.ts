import * as knex from "knex";
import { RequestBodyPost, RequestBodyDefault } from "models/Post";

import { ResponseGetPost } from "../generated/types/ResponseGetPost";

export class PostRepository {
  constructor(private knex: knex) {}

  getAll = (): Promise<Array<ResponseGetPost>> => this.knex.select().from("blog");

  delete = (postIdToDelete: number) => this.knex("blog").where("id", postIdToDelete).del();

  createOne = (requestBody: RequestBodyPost) =>
    this.knex("blog").insert({
      id: requestBody.id,
      title: requestBody.title,
      post: requestBody.post,
      likes: requestBody.likes,
    });

  updateOne = (requestParamsId: number, requestBody: RequestBodyDefault, keyDecoded: string) =>
    this.knex("blog")
      .where("id", requestParamsId)
      .update({ [keyDecoded]: requestBody[keyDecoded] });
}
