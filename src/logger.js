import { LOG_LEVEL } from "./config.js";

const NO_OP = (message, ...optionalArgs) => {};

class ConsoleLogger {
  COLOR = {
    CYAN: "\x1b[36m%s\x1b[0m",
  };

  /**
   * @param {Object} [options] - Configuration options.
   * @param {'log'|'warn'|'error'} [options.level] - The level of logging.
   */
  constructor(options) {
    const { level } = options || {};

    this.chat = console.log.bind(console, this.COLOR.CYAN);
    this.error = console.error.bind(console);

    if (level === "error") {
      this.warn = NO_OP;
      this.log = NO_OP;

      return;
    }

    this.warn = console.warn.bind(console);

    if (level === "warn") {
      this.log = NO_OP;

      return;
    }

    this.log = console.log.bind(console);
  }
}

export const logger = new ConsoleLogger({ level: LOG_LEVEL });
