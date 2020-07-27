import * as fastify from 'fastify'
import * as pino from 'pino'
const server = fastify({
  logger: {
    level: 'info',
    file: 'logs.txt', // Will use pino.destination(), name of log will be logs.txt
    timestamp: pino.stdTimeFunctions.isoTime // ISO 8601-formatted time in UTC
    // Caution: attempting to format time in-process will significantly impact logging performance.
    // I don't know if this is the case when specify date format
  }
});

import * as Knex from 'knex'

import {loadConfigAsync} from './config/configKnex'

import {PostRoutes} from './controllers/PostRoutesController'
import {PostRepository} from './persistances/PostRepository'

import {registerFastify} from './generated/contracts/registerFastify'

import * as dotenv from 'dotenv'

async function main(): Promise<{}>{

  dotenv.config() // use in loadConfigAsync, for load .env in process.env
  const config = await loadConfigAsync()
  const knex = Knex({
    client: String(config.client.client),
    connection: config.clientParameters
  })

  server.log.info("Starting server")
  const postRepository = new PostRepository(knex);

  registerFastify(server, PostRoutes(postRepository));

  server.register(require('fastify-cors'), {
    origin: (origin:any, cb:any) => {
    if(/localhost/.test(origin)){
      //  Request from localhost will pass
      cb(null, true)
      return
    }
    cb(new Error("Not allowed"), false)
  }
})

  return await server.listen(Number(config.http.port))
}

main().catch((err) => {
  server.log.error("Fatal error in fastify server")
  server.log.error(err)
  process.exit(1)
})
