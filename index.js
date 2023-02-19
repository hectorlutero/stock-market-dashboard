const companyButtons = document.querySelectorAll('.company-button');

companyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const symbol = button.getAttribute('data-symbol');
        fetchData(symbol);

        companyButtons.forEach(otherButton => {
            if (otherButton !== button) {
                otherButton.classList.remove('active');
            }
        });

        button.classList.add('active');
    });
});

fetchData('AAPL');


function fetchData(symbol) {
    const apiKey = 'KM2OAQVULHHTSQHB';
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${apiKey}`;

    // Get a reference to the loading div
    const loadingDiv = document.getElementById('loading');

    // Show the loading div
    loadingDiv.style.display = 'flex';


    // Set a timeout to hide the loading div after 3 seconds (3000 milliseconds)
    setTimeout(() => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const timeSeriesData = data['Time Series (Daily)'];
                const stockData = [];

                for (let date in timeSeriesData) {
                    const dataForDate = timeSeriesData[date];
                    const stockDataForDate = {
                        date: date,
                        open: dataForDate['1. open'],
                        high: dataForDate['2. high'],
                        low: dataForDate['3. low'],
                        close: dataForDate['4. close'],
                        volume: dataForDate['6. volume']
                    };
                    stockData.push(stockDataForDate);
                }

                // Extract the "close" data as an array
                const closeData = stockData.map(data => data.close);

                // Calculate the information entropy of the "close" data
                const closeEntropy = informationEntropy(closeData);
                document.querySelector('.uncertainty-value').innerHTML = closeEntropy;
                console.log(`Information entropy of close data: ${closeEntropy}`);

                const tbody = document.querySelector('#stock-table tbody');
                tbody.innerHTML = '';

                for (let i = 0; i < stockData.length; i++) {
                    const row = document.createElement('tr');
                    const dateCell = document.createElement('td');
                    const openCell = document.createElement('td');
                    const highCell = document.createElement('td');
                    const lowCell = document.createElement('td');
                    const closeCell = document.createElement('td');
                    const volumeCell = document.createElement('td');

                    dateCell.textContent = stockData[i].date;
                    openCell.textContent = stockData[i].open;
                    highCell.textContent = stockData[i].high;
                    lowCell.textContent = stockData[i].low;
                    closeCell.textContent = stockData[i].close;
                    volumeCell.textContent = stockData[i].volume;

                    row.appendChild(dateCell);
                    row.appendChild(openCell);
                    row.appendChild(highCell);
                    row.appendChild(lowCell);
                    row.appendChild(closeCell);
                    row.appendChild(volumeCell);

                    tbody.appendChild(row);
                }
            })
            .catch(error => console.log(error));
        loadingDiv.style.display = 'none';
    }, 3000);

}


function informationEntropy(data) {
    const counts = {};
    const n = data.length;

    // Count the frequency of each unique value in the data
    for (let i = 0; i < n; i++) {
        const value = data[i];
        if (value in counts) {
            counts[value]++;
        } else {
            counts[value] = 1;
        }
    }

    // Calculate the probability of each value
    const probabilities = Object.values(counts).map(count => count / n);

    // Calculate the entropy using the probabilities
    let entropy = 0;
    for (let i = 0; i < probabilities.length; i++) {
        const p = probabilities[i];
        entropy -= p * Math.log2(p);
    }

    return entropy;
}


// CHART JS

var barCount = 60;
var initialDateStr = '01 Apr 2017 00:00 Z';

var ctx = document.getElementById('chart').getContext('2d');
ctx.canvas.width = 1000;
ctx.canvas.height = 250;

var barData = getRandomData(initialDateStr, barCount);
function lineData() { return barData.map(d => { return { x: d.x, y: d.c } }) };

var chart = new Chart(ctx, {
    type: 'candlestick',
    data: {
        datasets: [{
            label: 'CHRT - Chart.js Corporation',
            data: barData
        }]
    }
});

var getRandomInt = function (max) {
    return Math.floor(Math.random() * Math.floor(max));
};

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function randomBar(date, lastClose) {
    var open = +randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
    var close = +randomNumber(open * 0.95, open * 1.05).toFixed(2);
    var high = +randomNumber(Math.max(open, close), Math.max(open, close) * 1.1).toFixed(2);
    var low = +randomNumber(Math.min(open, close) * 0.9, Math.min(open, close)).toFixed(2);
    return {
        x: date.valueOf(),
        o: open,
        h: high,
        l: low,
        c: close
    };

}

function getRandomData(dateStr, count) {
    var date = luxon.DateTime.fromRFC2822(dateStr);
    var data = [randomBar(date, 30)];
    while (data.length < count) {
        date = date.plus({ days: 1 });
        if (date.weekday <= 5) {
            data.push(randomBar(date, data[data.length - 1].c));
        }
    }
    return data;
}

var update = function () {
    var dataset = chart.config.data.datasets[0];

    // candlestick vs ohlc
    var type = document.getElementById('type').value;
    dataset.type = type;

    // linear vs log
    var scaleType = document.getElementById('scale-type').value;
    chart.config.options.scales.y.type = scaleType;

    // color
    var colorScheme = document.getElementById('color-scheme').value;
    if (colorScheme === 'neon') {
        dataset.color = {
            up: '#01ff01',
            down: '#fe0000',
            unchanged: '#999',
        };
    } else {
        delete dataset.color;
    }

    // border
    var border = document.getElementById('border').value;
    var defaultOpts = Chart.defaults.elements[type];
    if (border === 'true') {
        dataset.borderColor = defaultOpts.borderColor;
    } else {
        dataset.borderColor = {
            up: defaultOpts.color.up,
            down: defaultOpts.color.down,
            unchanged: defaultOpts.color.up
        };
    }

    // mixed charts
    var mixed = document.getElementById('mixed').value;
    if (mixed === 'true') {
        chart.config.data.datasets = [
            {
                label: 'CHRT - Chart.js Corporation',
                data: barData
            },
            {
                label: 'Close price',
                type: 'line',
                data: lineData()
            }
        ]
    }
    else {
        chart.config.data.datasets = [
            {
                label: 'CHRT - Chart.js Corporation',
                data: barData
            }
        ]
    }

    chart.update();
};

document.getElementById('update').addEventListener('click', update);

document.getElementById('randomizeData').addEventListener('click', function () {
    barData = getRandomData(initialDateStr, barCount);
    update();
});