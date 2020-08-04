import got from "got";

const client = got.extend({
  prefixUrl: "http://localhost:3000/",
  responseType: "json",
  headers: { origin: "http://localhost/" },
});

test("Should add a comment for a post", async () => {
  // Add a post for test with comment
  await client.post("posts", {
    json: { id: 1001, title: "A title", post: "A post", likes: 10 },
    responseType: "json",
  });

  const response = await client.post("comments?postId=1001", {
    json: { id: 1002, comment: "A comment" },
    responseType: "json",
  });
  expect(response.statusCode).toBe(201);
});

test("Should update a comment for a post", async () => {
  const response = await client.patch("comments/1002", {
    json: { comment: "An updated comment" },
    responseType: "json",
  });
  expect(response.statusCode).toBe(204);
});

test("Should get comments for a post", async () => {
  const response = await client.get("comments?postId=1001", { throwHttpErrors: false });
  expect(response.statusCode).toBe(200);
});

test("Should delete a comment for a post", async () => {
  const response = await client.delete("comments/1002", { throwHttpErrors: false });

  // Delete the post created for test
  await client.delete("posts/1001", { throwHttpErrors: false });

  expect(response.statusCode).toBe(204);
});
