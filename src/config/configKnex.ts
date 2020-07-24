export type Config = {
  http: {
    port: number
  };
  client: {
    client: string
  };
  clientParameters: {
    host: string
    port: number
    user: string
    password: string
    database: string
  }
}

export async function loadConfigAsync(): Promise<Config> {
  return {
    http: {
      port: Number(process.env.HTTP_PORT)
    },
    client: {
      client: String(process.env.CLIENT_CLIENT)
    },
    clientParameters: {
      host: String(process.env.CLIENT_HOST),
      port: Number(process.env.CLIENT_PORT),
      user: String(process.env.CLIENT_USER),
      password: String(process.env.CLIENT_PASSWORD),
      database: String(process.env.CLIENT_DATABASE)
    }
  }
}
