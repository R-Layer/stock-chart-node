const express = require("express");
const io = require("socket.io");
const http = require("http");

const configVars = require("./config/keys");

const app = express();
const server = http.createServer(app);

server.listen(configVars.PORT, () =>
  console.log(`Server running on port ${configVars.PORT}`)
);
