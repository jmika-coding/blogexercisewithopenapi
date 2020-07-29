import got from "got";

const client = got.extend({
  prefixUrl: "http://localhost:3000/",
  responseType: "json",
  headers: { origin: "http://localhost/" },
});

test("Should add a post", async () => {
  const response = await client.post("posts", {
    json: { id: 1000, post: "A post", likes: 10, comment: "A comment" },
    responseType: "json",
  });
  expect(response.statusCode).toBe(201);
});

test("Should update a post", async () => {
  const response = await client.put("posts/1000", {
    json: { post: "An updated post" },
    responseType: "json",
  });
  expect(response.statusCode).toBe(200);
});

test("Should get posts", async () => {
  const response = await client.get("posts", { throwHttpErrors: false });
  expect(response.statusCode).toBe(200);
});

test("Should delete a post", async () => {
  const response = await client.delete("posts/1000", { throwHttpErrors: false });
  expect(response.statusCode).toBe(200);
});
