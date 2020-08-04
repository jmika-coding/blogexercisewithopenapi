import * as t from "io-ts";

// Interfaces for request of post and put and delete routes

export interface RequestBodyPost {
  id?: t.TypeOf<typeof t.number>;
  title: t.TypeOf<typeof t.string>;
  post: t.TypeOf<typeof t.string>;
  likes: t.TypeOf<typeof t.number>;
}

export interface RequestBodyPatch {
  title?: t.TypeOf<typeof t.string>;
  post?: t.TypeOf<typeof t.string>;
  likes?: t.TypeOf<typeof t.number>;
}
