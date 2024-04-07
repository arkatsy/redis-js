const net = require("node:net");
const port = 6379;
const host = "127.0.0.1";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    socket.write("+PONG\r\n");
  });
});

server.listen(port, host, () => {
  console.log(`[LOG] Server is running on port ${port}`);
});
