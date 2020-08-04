import * as fastify from "fastify";
import * as pino from "pino";

import * as Knex from "knex";

import { loadConfigAsync } from "./config/configKnex";

import { GetPosts } from "./controllers/PostRoutesController";
import { GetComments } from "./controllers/CommentRoutesController";
import { PostRepository } from "./persistances/PostRepository";
import { CommentRepository } from "./persistances/CommentRepository";

import { registerFastify } from "./generated/contracts/registerFastify";

import { args } from "./config/ArgsValue";
import { corsOptions } from "./config/CorsOptions";
import { logErrorAndExit } from "./utils/LogErrorAndExit";

import * as dotenv from "dotenv";

const server = fastify({
  logger: {
    level: "info",
    file: args.logToText ? "logs.txt" : undefined, // Will use pino.destination(), name of log will be logs.txt if not empty, else output console
    timestamp: pino.stdTimeFunctions.isoTime, // ISO 8601-formatted time in UTC
    // Caution: attempting to format time in-process will significantly impact logging performance.
    // I don't know if this is the case when specify date format
    prettyPrint: true,
  },
});

const logger: fastify.Logger = server.log;

// MAIN
async function main(): Promise<{}> {
  // CONFIG KNEX AND PORT SERVER
  dotenv.config(); // use in loadConfigAsync, for load .env in process.env
  const config = await loadConfigAsync();
  const knex = Knex({
    client: String(config.client.client),
    connection: config.clientParameters,
    migrations: { directory: "./dist/src/migrations" },
    seeds: { directory: "./test/seeds" },
  });

  // MIGRATIONS
  logger.info("Applying migrations and/or seeds");
  await knex.migrate
    .latest()
    .catch((error) => logErrorAndExit(logger, "Unable to migrate DB", error));
  // FILL TABLE IF RUN APP WITH OPTION SEEDS
  if (args.seeds) {
    await knex.seed.run().catch((error) => logErrorAndExit(logger, "Unable to migrate DB", error));
  }
  logger.info("Applied migrations and/or seeds");

  // START SERVER
  server.log.info("Starting server");
  const postRepository = new PostRepository(knex);
  const commentRepository = new CommentRepository(knex);

  registerFastify(server, {
    posts: GetPosts(postRepository),
    comments: GetComments(commentRepository),
  });

  server.register(require("fastify-cors"), { origin: corsOptions });

  // HERE WE START THE SERVER, WHEN WE CALL MAIN
  return await server.listen(Number(config.http.port), "0.0.0.0");
}

// CALL MAIN TO START SERVER
main().catch((error) => logErrorAndExit(logger, "Fatal error in fastify server", error));
