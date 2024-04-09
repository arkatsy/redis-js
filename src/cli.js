import styleText from "./style-text.js";

class CLIError extends Error {
  constructor(message) {
    super(styleText("redBright", `[CLI]: ${message}`));
    this.name = "";
  }
}

const opts = {
  debugParser: false,
  debugReader: false,
  debugCache: false,
  host: "127.0.0.1",
  port: 6379,
};

const isBooleanArg = (arg) => ["--debug-parser", "--debug-reader", "--debug-cache", "--debug", "-d"].includes(arg);

const CLI_COMMANDS = {
  "--debug-parser": () => {
    opts.debugParser = true;
  },
  "--debug-reader": () => {
    opts.debugReader = true;
  },
  "--debug-cache": () => {
    opts.debugCache = true;
  },
  "--debug": () => {
    opts.debugParser = true;
    opts.debugReader = true;
    opts.debugCache = true;
  },
  "-d": () => {
    opts.debugParser = true;
    opts.debugReader = true;
    opts.debugCache = true;
  },
  "--host": (host) => {
    opts.host = host;
  },
  "-h": (host) => {
    opts.host = host;
  },
  "--port": (port) => {
    opts.port = port;
  },
  "-p": (port) => {
    opts.port = port;
  },
};

export default function parseCLIArgs() {
  const args = process.argv.slice(2);
  let i = 0;
  while (i < args.length) {
    if (args[i] in CLI_COMMANDS) {
      CLI_COMMANDS[args[i]](args[i + 1]);
      if (isBooleanArg(args[i])) {
        i++;
      } else {
        i += 2;
      }
    } else {
      throw new CLIError(`Unknown option: ${JSON.stringify(args[i])}`);
    }
  }

  return opts;
}
