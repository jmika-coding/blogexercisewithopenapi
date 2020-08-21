import * as t from "io-ts";

// Interfaces for request of post and put and delete routes

export interface RequestBodyComment {
  id?: t.TypeOf<typeof t.number>;
  comment: t.TypeOf<typeof t.string>;
}
