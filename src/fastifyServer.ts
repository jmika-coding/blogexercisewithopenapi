import * as fastify from "fastify";
import * as pino from "pino";

import * as Knex from "knex";

import { loadConfigAsync } from "./config/configKnex";

import { GetPosts } from "./controllers/PostRoutesController";
import { GetComments } from "./controllers/CommentRoutesController";
import { PostRepository } from "./persistances/PostRepository";
import { CommentRepository } from "./persistances/CommentRepository";

import { registerFastify } from "./generated/contracts/registerFastify";

import * as dotenv from "dotenv";

// TODO move args extraction and CORS setup to other functions/clases
const args: Args = process.argv.length === 3 ? {
    logToText: process.argv[2] === "logs",
    seeds: process.argv[3] === "seed"
  } : { logToText: false, seeds: false}

type Args = {
  logToText: boolean
  seeds: boolean
}
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
  server.log.info("Applying migrations and/or seeds");
  try {
    // MIGRATIONS
    await knex.migrate.latest();
    // FILL TABLE IF RUN APP WITH OPTION SEEDS
    if (args.seeds) {
      await knex.seed.run(); // Remove catch and extract
    }
  } catch (error) {
    server.log.error("Unable to migrate DB");
    server.log.error(error);
    process.exit(1);
  }
  server.log.info("Applied migrations and/or seeds");

  // START SERVER
  server.log.info("Starting server");
  const postRepository = new PostRepository(knex);
  const commentRepository = new CommentRepository(knex);

  registerFastify(server, {
    posts: GetPosts(postRepository),
    comments: GetComments(commentRepository),
  });

  server.register(require("fastify-cors"), {
    origin: (origin: any, cb: any) => {
      if (/localhost/.test(origin)) {
        //  Request from localhost will pass
        cb(null, true);
        return;
      }
      cb(new Error("Not allowed"), false);
    },
  });
  // HERE WE START THE SERVER, WHEN WE CALL MAIN
  return await server.listen(Number(config.http.port), "0.0.0.0");
}

// CALL MAIN TO START SERVER
main().catch((err) => {
  server.log.error("Fatal error in fastify server");
  server.log.error(err);
  process.exit(1);
});
