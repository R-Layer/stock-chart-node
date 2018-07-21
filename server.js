const handlebars = require("express-handlebars");
const socketIO = require("socket.io");
const express = require("express");
const http = require("http");

const configVars = require("./config/keys");

const app = express();
const server = http.createServer(app);

const io = socketIO(server);

const stocks = [
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "TWTR", name: "Twitter" }
];
const connections = [];

server.listen(configVars.PORT, () =>
  console.log(`Server running on port ${configVars.PORT}`)
);

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(
  "/chart",
  express.static(`${__dirname}/node_modules/zingchart/client/zingchart.min.js`)
);

app.use("/js", express.static(`${__dirname}/scripts`));
app.use("/data", express.static(`${__dirname}/dummyData`));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", socket => {
  connections.push(socket);
  console.log("Connected: %s sockets connected", connections.length);

  socket.on("InitRequest", () => {
    socket.emit("Stock list", stocks);
  });

  socket.on("Stock added", data => {
    stocks.push(data);
    io.emit("Stock list", stocks);
  });

  socket.on("Stock removed", data => {
    stocks.splice(stocks.indexOf(data), 1);
    io.emit("Stock list", stocks);
  });

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
    console.log("Disconnected: %s sockets connected", connections.length);
  });
});
