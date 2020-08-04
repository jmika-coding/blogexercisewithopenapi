type Args = {
  logToText: boolean;
  seeds: boolean;
};

export const args: Args =
  process.argv.length === 3
    ? {
        logToText: process.argv[2] === "logs",
        seeds: process.argv[3] === "seed",
      }
    : { logToText: false, seeds: false };
