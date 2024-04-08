import net from "node:net";
// import { parseRESP } from "./resp.js";
const port = 6379;
const host = "127.0.0.1";

const server = net.createServer((socket) => {
  socket.on("data", (buffer) => {
    // const commands = parseRESP(buffer);

    socket.write("+PONG\r\n");
  });
});

server.listen(port, host, () => {
  console.log(`[LOG] Server is running on port ${port}`);
});
