import { GOOGLE_CREDENTIALS } from "./types"
import stackdriver from "pino-stackdriver"

export function validateCredentials(
  google_credentials_env: string = "GOOGLE_APPLICATION_CREDENTIALS",
) {
  const env = process.env[google_credentials_env]

  if (!env) {
    throw new Error("Unable to find Google Credentials")
  }

  const credentials: GOOGLE_CREDENTIALS = JSON.parse(env)

  if (
    !credentials.type ||
    !credentials.project_id ||
    !credentials.private_key_id ||
    !credentials.private_key ||
    !credentials.client_email ||
    !credentials.client_id ||
    !credentials.auth_uri ||
    !credentials.token_uri ||
    !credentials.auth_provider_x509_cert_url ||
    !credentials.client_x509_cert_url
  ) {
    throw new Error("Unable to find Google Credentials")
  }

  return credentials
}

export function NestJsLogger(
  google_credentials_env: string = "GOOGLE_APPLICATION_CREDENTIALS",
  logger_name: string = "LOGGER_NAME",
): {
  pinoHttp:
    | [{ level: string }, NodeJS.WritableStream]
    | [
        {
          transport: {
            target: string
            options: {
              colorize: boolean
              translateTime: boolean
              levelFirst: boolean
            }
          }
        },
      ]
} {
  let pinoHttp
  if (process.env.NODE_ENV === "production") {
    const credentials = validateCredentials(google_credentials_env)
    const logName = process.env[logger_name]

    pinoHttp = {
      pinoHttp: [
        { level: "info" },
        stackdriver.createWriteStream({
          projectId: credentials.project_id,
          credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          },
          logName,
        }),
      ],
    }
  } else {
    pinoHttp = {
      pinoHttp: [
        {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: true,
              levelFirst: true,
            },
          },
        },
      ],
    }
  }

  return pinoHttp
}

export function ExpressLogger(
  google_credentials_env: string = "GOOGLE_APPLICATION_CREDENTIALS",
  logger_name: string = "LOGGER_NAME",
):
  | {
      options: {
        level: string
        transport?: undefined
      }
      stream: NodeJS.WritableStream
    }
  | {
      options: {
        level: string
        transport: {
          target: string
          options: {
            colorize: boolean
            translateTime: boolean
            levelFirst: boolean
          }
        }
      }
      stream: null
    } {
  if (process.env.NODE_ENV === "production") {
    const credentials = validateCredentials(google_credentials_env)
    const logName = process.env[logger_name]

    return {
      options: {
        level: "info",
      },
      stream: stackdriver.createWriteStream({
        projectId: credentials.project_id,
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
        logName,
      }),
    }
  } else {
    return {
      options: {
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: true,
            levelFirst: true,
          },
        },
      },
      stream: null,
    }
  }
}
