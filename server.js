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

server.listen(configVars.PORT, () =>
  console.log(`Server running on port ${configVars.PORT}`)
);

app.use(
  "/chart",
  express.static(`${__dirname}/node_modules/zingchart/client/zingchart.min.js`)
);

app.use("/", express.static(`${__dirname}/public`));

// TODO: Protect route
app.get("/api-key", (req, res) =>
  res.status(200).json({ key: configVars.QUANDL_KEY })
);

io.on("connection", socket => {
  socket.on("InitRequest", () => {
    socket.emit("Stock list", stocks);
  });

  socket.on("Stock added", data => {
    stocks.push(data);
    io.emit("Stock list", stocks);
  });

  socket.on("Stock removed", data => {
    stocks.forEach(el => {
      if (el.symbol === data) {
        stocks.splice(stocks.indexOf(el), 1);
      }
    });

    io.emit("Stock list", stocks);
  });
});
