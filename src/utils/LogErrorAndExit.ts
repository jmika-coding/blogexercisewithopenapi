import * as fastify from "fastify";

export function logErrorAndExit(logger: fastify.Logger, message: string, error: Error): void {
  logger.error(message);
  logger.error(error);
  process.exit(1);
}
