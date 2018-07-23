const btn_addStock = document.getElementById("add-stock-button");
const stockToAdd = document.getElementById("add-stock-input");
const stockPanel = document.getElementById("stock-panel");
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
  stockToRender = [...data];
  createStockList();
  collectAndRender();
}

function createStockList() {
  while (stockPanel.childElementCount > 2) {
    stockPanel.removeChild(stockPanel.lastChild);
  }

  stockToRender.forEach(el => {
    let newStockItem = document.createElement("div");
    let btnItem = document.createElement("button");
    let labelItem = document.createElement("label");
    let textItem = document.createTextNode(el.name);
    let textButton = document.createTextNode("remove stock");

    btnItem.onclick = function() {
      removeItem(this);
      stockToAdd.value = "";
    };

    newStockItem.setAttribute("class", "stock-element");
    labelItem.setAttribute("class", "stock-label");
    btnItem.setAttribute("class", "remove-button");
    btnItem.setAttribute("id", el.symbol);

    labelItem.appendChild(textItem);
    btnItem.appendChild(textButton);
    newStockItem.appendChild(labelItem);
    newStockItem.appendChild(btnItem);
    stockPanel.appendChild(newStockItem);
  });
}

function removeItem(e) {
  socket.emit("Stock removed", e.id);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
