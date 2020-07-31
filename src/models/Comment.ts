import * as t from "io-ts";

// Interfaces for request of post and put and delete routes

// With t.type all fields are required, we use it for POST
export const RequestBodyValuesTypeComment = t.type({
  comment: t.string,
});
export type RequestBodyValuesTypeComment = t.TypeOf<typeof RequestBodyValuesTypeComment>;

export interface RequestBodyComment {
  id?: t.TypeOf<typeof t.number>;
  comment: t.TypeOf<typeof t.string>;
}
