import "dotenv/config";

const CONFIG = {
  OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
};

/**
 * ===================
 * The App environment
 * ===================
 * Unless explicitly specified APP_ENV, APP_ENV defaults to development
 * When pushing to production, run: APP_ENV='production' <command>
 **/
export const APP_ENV = process.env.APP_ENV === "production" ? "production" : "development";

export const LOG_LEVEL = APP_ENV === "production" ? "warn" : "log";

export default CONFIG;
