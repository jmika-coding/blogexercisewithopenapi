import got from "got";

const client = got.extend({
  prefixUrl: "http://localhost:3000/",
  responseType: "json",
  headers: { origin: "http://localhost/" },
});

test("Should work only if request comes from localhost", async () => {
  const response = await client.get("posts", { throwHttpErrors: false });
  expect(response.statusCode).toBe(200);
});

const clientWithoutOrigin = got.extend({
  prefixUrl: "http://localhost:3000/",
  responseType: "json",
});

test("Should work only if request comes from localhost", async () => {
  const response = await clientWithoutOrigin.get("posts", { throwHttpErrors: false, retry: 0 });
  expect(response.statusCode).toBe(500);
});
