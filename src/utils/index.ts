import { GOOGLE_CREDENTIALS } from "../types/index"

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

export function validateLoggerName(logger_name: string = "LOGGER_NAME") {
  const env = process.env[logger_name]

  if (!env) {
    throw new Error(
      "Unable to find the Logger Name, you must need to have the env var called logger_name",
    )
  }
  return env
}
