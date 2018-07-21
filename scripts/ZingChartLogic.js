let stockToRender = [];
let stockData = [];

let dataContainer = {
  type: "line",
  plot: {
    marker: {
      visible: false
    }
  },
  plotarea: {
    "margin-left": "10%",
    "margin-top": "5%"
  },
  "scale-x": {
    "min-value": 1451606400000,
    transform: {
      type: "date",
      all: "%d/%m/%y<br/> %h:%i %A"
    }
  },
  "scale-y": {
    format: "$ %v",
    guide: {
      "line-style": "dotted"
    }
  },
  "crosshair-x": {},
  title: {
    text: "Chart Data Object"
  },
  legend: {
    layout: "horizontal",
    align: "center",
    "vertical-align": "bottom"
  },
  series: stockData
};

/*******************************************************************/
/************** FUNCTIONS AND METHODS ******************************/
/*******************************************************************/

async function collectAndRender() {
  await asyncForEach(stockToRender, async stock => {
    await fetchStock(stock).then(result => {
      for (let stockEl of stockData) {
        if (stockEl.text === stock.name) {
          return Promise.resolve();
        }
      }
      stockData.push(result);
    });
  })
    .then(() => {
      renderGraph();
    })
    .catch(err => console.log("err", err));
}

function renderGraph() {
  zingchart.render({
    id: "stock-chart",
    output: "svg",
    height: 400,
    width: "100%",
    data: dataContainer
  });
}

// -------------------------------------------------- //
// ------ Credits to SEBASTIEN CHOPIN [MEDIUM ] ----- //
// -------------------------------------------------- //

async function asyncForEach(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    await callback(arr[i], i, arr);
  }
}

function fetchStock(stock) {
  /*   fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${sym}&interval=1min&apikey=9IWXU43OOL5LR4E6`
  ) */
  /*   fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${sym}&apikey=9IWXU43OOL5LR4E6`
  ) */

  let finalArr = [];
  let url = "";
  if (stock.symbol === "MSFT") {
    url = "/data/msftALPHA.json";
  } else {
    url = "/data/twtr.json";
  }
  /*   let url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${
    stock.symbol
  }&apikey=9IWXU43OOL5LR4E6`; */

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      for (let el in data["Monthly Time Series"]) {
        let timestamp = new Date(el).getTime();
        finalArr.push([
          timestamp,
          parseFloat(data["Monthly Time Series"][el]["4. close"])
        ]);
      }
      return { values: finalArr, text: stock.name };
    })
    .catch(err => console.log("error while fetching", err));
}
