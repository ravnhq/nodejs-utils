import { validateCredentials, validateLoggerName } from "../utils"
import stackdriver from "pino-stackdriver"

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
    const logName = validateLoggerName(logger_name)

    pinoHttp = {
      pinoHttp: [
        {
          level: "info",
          customSuccessMessage: (res: {
            req: { method: string; url: string }
          }) => `${res.req.method} ${res.req.url}`,
        },
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
          autoLogging: false,
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
