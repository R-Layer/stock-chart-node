(function() {
  const socket = io.connect();

  const btn = document.getElementById("add-stock-button");
  const stockInput = document.getElementById("add-stock-input");

  btn.onclick = () => {
    socket.emit("Stocks update", stockInput.value);
  };

  socket.on("Stocks updated", data => {
    console.log("Stocks updated io", data);
  });
})();
