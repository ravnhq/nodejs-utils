import pino from "pino"
import stackdriver from "pino-stackdriver"
import { validateCredentials, validateLoggerName } from "../utils"

export function ExpressLogger(
  google_credentials_env: string = "GOOGLE_APPLICATION_CREDENTIALS",
  logger_name: string = "LOGGER_NAME",
): pino.Logger {
  if (process.env.NODE_ENV === "production") {
    const credentials = validateCredentials(google_credentials_env)
    const logName = validateLoggerName(logger_name)

    return pino(
      {
        level: "info",
      },
      stackdriver.createWriteStream({
        projectId: credentials.project_id,
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
        logName,
      }),
    )
  } else {
    return pino({
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: true,
          levelFirst: true,
        },
      },
    })
  }
}
