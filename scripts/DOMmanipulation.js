const btn_addStock = document.getElementById("add-stock-button");
const stockToAdd = document.getElementById("add-stock-input");
const actualStockList = document.getElementById("stock-list");
const graph = document.getElementById("stock-chart");
const socket = io.connect();

let stockCatalog = [];

fetch("https://api.iextrading.com/1.0/ref-data/symbols")
  .then(res => res.json())
  .then(resp => {
    stockCatalog = [...resp];
    btn_addStock.disabled = false;
  });

btn_addStock.onclick = checkVal;

socket.emit("InitRequest");

function checkVal() {
  let stock = stockToAdd.value.toUpperCase();

  for (let stockInfo of stockCatalog) {
    if (stockInfo.symbol === stock) {
      for (let stockEl of stockToRender) {
        if (stockEl.symbol === stock) {
          return alert("Company already tracked!");
        }
      }
      stockToRender.push(stockInfo);
      socket.emit("Stock added", stockInfo);
      return collectAndRender();
    }
  }
  return alert("Symbol not recognized");
}

socket.on("Init list", data => refreshWindow(data));
socket.on("Stock list", data => refreshWindow(data));

function refreshWindow(data) {
  console.log("refreshing", data);
  stockToRender = [...data];
  createStockList();
  collectAndRender();
}

function createStockList() {
  /* ------------------------------------------------------------ */
  /* ------- Credits to  GABRIEL MCADAMS [STACK OVERFLOW]-------- */
  /* ------------------------------------------------------------ */
  while (actualStockList.lastChild) {
    actualStockList.removeChild(actualStockList.lastChild);
  }
  /* ------------------------------------------------------------ */
  stockToRender.forEach(el => {
    let newListItem = document.createElement("li");
    let btnItem = document.createElement("button");
    let textItem = document.createTextNode(el.name);
    let textButton = document.createTextNode("remove stock");

    btnItem.onclick = function() {
      removeItem(el);
    };

    btnItem.appendChild(textButton);
    newListItem.appendChild(textItem);
    newListItem.appendChild(btnItem);
    actualStockList.appendChild(newListItem);
  });
}

function removeItem(stockToRemove) {
  console.log(stockToRemove);
  socket.emit("Stock removed", stockToRemove);
}
