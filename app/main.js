import net from "node:net";
import Resp from "./resp.js";
import styleText from "./style-text.js";

const port = 6379;
const host = "127.0.0.1";

const logger = (msg) => {
  console.log(styleText("blueBright", `[server] ${msg}`));
};

const server = net.createServer((socket) => {
  socket.on("data", (buffer) => {
    logger(`received: ${JSON.stringify(buffer.toString())}`);
    const parsedCmd = Resp.parse(buffer);
    logger(`parser result: ${JSON.stringify(parsedCmd)}`);

    const command = Resp.read(parsedCmd);
    logger(`reader result: ${JSON.stringify(command)}`);

    const [cmd, ...args] = command;
    logger(`command: ${cmd}, args: ${JSON.stringify(args)}`);

    switch (cmd.toLowerCase()) {
      case "echo": {
        logger(`echoing back: ${args.join(" ")}`);
        socket.write(`+${[...args].join(" ")}\r\n`);
        break;
      }
      case "ping": {
        logger("pinging back");
        socket.write("+PONG\r\n");
        break;
      }
    }
  });
});

server.listen(port, host, () => {
  logger(`server is running on port ${port}`);
});
