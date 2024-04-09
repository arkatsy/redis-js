import net from "node:net";
import Resp from "./resp.js";
import styleText from "./style-text.js";
import RedisCache from "./cache.js";
import processArgs from "./cli.js";

const opts = processArgs();
const logger = (msg) => {
  console.log(styleText("blueBright", `[server] ${msg}`));
};

let cache;
function initRedisCache() {
  cache = new RedisCache({ debugCache: opts.debugCache });
}

const server = net.createServer((socket) => {
  socket.on("data", (buffer) => {
    const parsedCmd = Resp.parse(buffer);
    const command = Resp.read(parsedCmd);

    const [cmd, ...args] = command;
    logger(`command: ${cmd.toLowerCase()} \targs: ${args.join(" ")}`);

    switch (cmd.toLowerCase()) {
      case "echo": {
        socket.write(`+${[...args].join(" ")}\r\n`);
        break;
      }
      case "ping": {
        socket.write("+PONG\r\n");
        break;
      }
      case "set": {
        const [key, value, ...restCmds] = args;
        let px = null;
        if (restCmds[0] && ["px"].includes(restCmds[0].toLowerCase())) {
          px = restCmds[1];
          logger(`set with px & time ${px}ms`);
        }
        cache.set(key, value, px);
        socket.write("+OK\r\n");
        break;
      }
      case "get": {
        logger(`get command`);
        const key = args[0];
        const value = cache.get(key);
        logger(`get value: ${value}`);
        if (value) {
          socket.write(`$${value.length}\r\n${value}\r\n`);
        } else {
          socket.write("$-1\r\n");
        }
        break;
      }
    }
  });
});

server.listen(opts.port, opts.host, () => {
  logger(`server is running on port ${opts.port}`);
  initRedisCache();
  Resp.setDebugOpts(opts.debugParser, opts.debugReader);
});
