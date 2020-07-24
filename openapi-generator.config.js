module.exports = function () {
  return {
    input: "specs/openapi.yaml",
    stages: {
      fastify: {
        output: "src/generated",
        router: {
          includeSchemas: true,
        },
      },
    },
  }
}
