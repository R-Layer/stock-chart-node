let stockToRender = [];
let stockData = [];
let quandlKey = "";

fetch("api-key")
  .then(res => res.json())
  .then(res => (quandlKey = res.key));

async function collectAndRender() {
  stockData = [];
  await asyncForEach(stockToRender, async stock => {
    await fetchStock(stock).then(result => {
      for (let stockEl of stockData) {
        if (stockEl && stockEl.text === stock.name) {
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
  let dataContainer = {
    type: "line",
    plot: {
      marker: {
        visible: false
      }
    },
    plotarea: {
      margin: "10%"
    },
    noData: {
      text: "No stock tracked",
      backgroundColor: "#ccc",
      fontSize: 18,
      textAlpha: 0.9,
      alpha: 0.6,
      bold: true
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
      text: "Stock chart - closing values tracked since 01/01/2016"
    },
    legend: {
      layout: "horizontal",
      align: "center",
      "vertical-align": "bottom"
    },
    series: stockData
  };

  if (stockData.length === 0) {
    dataContainer.series = [{ values: [] }];
    delete dataContainer.legend;
  }

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
  let finalArr = [];
  console.log(quandlKey);

  let url = `https://www.quandl.com/api/v3/datasets/WIKI/${
    stock.symbol
  }/data.json?api_key=${quandlKey}`;

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      for (let el of data.dataset_data.data) {
        let timestamp = new Date(el[0]).getTime();
        finalArr.push([timestamp, parseFloat(el[3])]);
      }
      return { values: finalArr, text: stock.name };
    })
    .catch(err => console.log("error while fetching", err));
}
