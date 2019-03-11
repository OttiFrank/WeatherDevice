var tempChart, humidChart, windChart;
let tempHumidResult = [];
var winds = [];
var timeLabels = [];
let tempArray = [];
let tempWind = [];
var initial = 315000;
var count = initial;
var counter;
var initialMillis;
let isFirstIteration = true;


$(window).on("load", function () {
    loadWindData();
    loadTempHumid();
    startTimer();
})
displayCount(initial);

$('#timeScale input').on('change', function () {
    var selectedTimeScale = $('input[name=inlineRadioOptions]:checked', '#timeScale').val();
    var selectedDate;
    switch (selectedTimeScale) {
        case "day":
            // TODO: change back to day
            selectedDate = new Date().last().saturday().setTimeToNow();
            filterGraphs(selectedDate);
            break;
        case "week":
            selectedDate = new Date().last().week().setTimeToNow();
            filterGraphs(selectedDate);
            break;
        case "month":
            selectedDate = new Date().last().month().setTimeToNow();
            filterGraphs(selectedDate);
            break;
    };
});

// Helper functions for Countdown timer 
function timer() {
    if (count <= 0) {
        count = initial;
        startTimer();
        updateCharts();
        return;
    }
    var current = Date.now();
    count = count - (current - initialMillis);
    initialMillis = current;
    displayCount(count);
};
function startTimer() {
    clearInterval(counter);
    initialMillis = Date.now();
    counter = setInterval(timer, 1);
};
function displayCount(count) {
    var minutes = Math.trunc((count / 1000) / 60);
    var seconds = count / 1000;
    if (count > 60000)
        document.getElementById("timer-minutes").innerHTML = minutes + " minuter";
    else
        document.getElementById("timer-minutes").innerHTML = "< 1 minut";
};

// Loads wind speed data and temperatures from database
function getAll() {
    loadTempHumid();
    loadWindData();
    tempChart.update();
    windChart.update();
    humidChart.update();
};
function loadWindData() {
    $.ajax({
        url: '/Home/WindList',
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (isFirstIteration)
                tempWind = result;

            setWindSpeed(result);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
};
function loadTempHumid() {
    $.ajax({
        url: '/Home/TempHumidList',
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (isFirstIteration)
                tempArray = result;
            isFirstIteration = false;
            setTempHumid(result);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
};

// loops through resultset and creates new temperature, humiditiy and wind object 
// for each resultset iteration and adds each object to the graph
function setTempHumid(result) {
    tempHumidResult = result;
    addDataToGraph();
}
function setWindSpeed(result) {
    winds = [];
    let windTimeArray = [];
    for (var i = 0; i < result.length; i++) {
        let timestamp = result[i].date;
        var date = timestamp.split("T");
        windTimeArray.push(date[0] + " " + date[1]);

        var wind = {
            windspeed: result[i].windspeed,
            date: windTimeArray[i]
        }
        winds.push(wind);
        addData(windChart, winds[i].date, winds[i].windspeed);
    }
}

// Helper functions for CRUD-operations on specific charts
function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data)
    });
    chart.update();
};
function updateCharts() {
    removeAllDataFromCharts();
    setTimeout(getAll, 1000);
}
function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
};
function addDataToGraph(type) {
    removeAllDataFromCharts();
    var labels;
    switch (type) {
        case "tempHumid":
            labels = convertDateToString(tempArray);
            for (var i = 0; i < tempArray.length; i++) {
                addData(tempChart, labels[i], tempArray[i].temperature);
                addData(humidChart, labels[i], tempArray[i].humidity);
            }
            break;
        case "wind":
            labels = convertDateToString(tempWind); 
            for (var i = 0; i < tempWind.length; i++) {
                addData(windChart, labels[i], tempWind[i].windspeed);
            }
            break;
        default:
            labels = convertDateToString(tempArray);
            for (var i = 0; i < tempArray.length; i++) {
                addData(tempChart, labels[i], tempArray[i].temperature);
                addData(humidChart, labels[i], tempArray[i].humidity);
            }
            labels = convertDateToString(tempWind);
            for (var i = 0; i < tempWind.length; i++) {
                addData(windChart, labels[i], tempWind[i].windspeed);
            }
            break; 
    };
};
function filterGraphs(fromDate) {
    var today = Date.today().setTimeToNow();
    tempArray = [];
    tempWind = [];
    for (let i = 0; i < tempHumidResult.length; i++) {
        if (Date.parse(tempHumidResult[i].date).between(fromDate, today)) {
            tempArray.push(tempHumidResult[i]);
        }
    };
    for (let i = 0; i < winds.length; i++) {
        if (Date.parse(winds[i].date).between(fromDate, today)) {
            tempWind.push(winds[i]);
        }
    };
    removeAllDataFromCharts();
    addDataToGraph();
};
function removeAllDataFromCharts() {
    for (var i = 0; i < tempHumidResult.length; i++) {
        removeData(tempChart);
        removeData(humidChart);
    };
    for (var i = 0; i < winds.length; i++) {
        removeData(windChart);
    };
}

function convertDateToString(array) {
    timeLabels = [];
    for (let i = 0; i < array.length; i++) {
        var newDate = Date.parse(array[i].date).toString('ddd d MMM, HH:mm');
        timeLabels.push(newDate);
    }
    return timeLabels;
};

// Temperature chart
var ctx = document.getElementById("myTempChart").getContext('2d');
tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperature in celsius',
            data: [],
            fill: true,
            pointRadius: 0,
            //borderColor: [
            //'rgba(255,99,132,1)',
            //'rgba(54, 162, 235, 1)',
            //'rgba(255, 206, 86, 1)',
            //'rgba(75, 192, 192, 1)',
            //'rgba(153, 102, 255, 1)',
            //'rgba(255, 159, 64, 1)'
            //],
            borderWidth: 1
        }]
    },
    plugins: [{
        beforeRender: function (x, options) {
            var c = x.chart
            var dataset = x.data.datasets[0];
            var yScale = x.scales['y-axis-0'];
            var yPos = yScale.getPixelForValue(0);

            var gradientFill = c.ctx.createLinearGradient(0, 0, 0, c.height);
            gradientFill.addColorStop(0, 'rgba(211, 33, 45, 1)');
            gradientFill.addColorStop(yPos / c.height - 0.01, 'rgba(211, 33, 45, 0.2)');
            gradientFill.addColorStop(yPos / c.height + 0.01, 'rgba(0, 70, 180, 0.2');
            gradientFill.addColorStop(1, 'rgba(0, 70, 180, 1');

            var model = x.data.datasets[0]._meta[Object.keys(dataset._meta)[0]].dataset._model;
            model.backgroundColor = gradientFill;
        },
        beforeDraw: function (c) {
            var data = c.data.datasets[0].data;
            for (var i in data) {
                try {
                    var bar = c.data.datasets[0]._meta[0].data[i]._model;
                    if (data[i] > 0) {
                        bar.borderColor = '#E82020';
                    } else
                        bar.borderColor = '#07C';
                }
                catch (ex) {
                }
            }
        }
    }],
    options: {
        title: {
            display: true,
            text: 'Temperatur',
            fontSize: 24,
            fontStyle: 'bold'
        },
        legend: {
            display: false
        },
        responsive: true,
        hover: {
            mode: 'nearest',
            intersect: false
        },
        tooltips: {
            mode: 'nearest',
            intersect: false
        },
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20
                },
                distribution: 'auto'
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Grader i celsius"
                },
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index, values) {
                        return value + '°';
                    }
                }
            }]
        }
    }
});
// Humidity chart
var ctx2 = document.getElementById("myHumidChart").getContext('2d');
humidChart = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Humidity in percentage',
            data: [],
            fill: true,
            pointRadius: 0,
            //borderColor: [
            //'rgba(255,99,132,1)',
            //'rgba(54, 162, 235, 1)',
            //'rgba(255, 206, 86, 1)',
            //'rgba(75, 192, 192, 1)',
            //'rgba(153, 102, 255, 1)',
            //'rgba(255, 159, 64, 1)'
            //],
            borderWidth: 1
        }]
    },
    plugins: [{
        beforeRender: function (x, options) {
            var c = x.chart
            var dataset = x.data.datasets[0];
            var yScale = x.scales['y-axis-0'];
            var yPos = yScale.getPixelForValue(0);

            var gradientFill = c.ctx.createLinearGradient(0, 0, 0, c.height);
            gradientFill.addColorStop(0, 'rgba(0, 70, 180, 1');
            gradientFill.addColorStop(yPos / c.height - 0.01, 'rgba(0, 70, 180, 0.2)');

            var model = x.data.datasets[0]._meta[Object.keys(dataset._meta)[0]].dataset._model;
            model.backgroundColor = gradientFill;
        },
        beforeDraw: function (c) {
            var data = c.data.datasets[0].data;
            for (var i in data) {
                try {
                    var bar = c.data.datasets[0]._meta[0].data[i]._model;
                    if (data[i] > 0) {
                        bar.borderColor = '#E82020';
                    } else
                        bar.borderColor = '#07C';
                }
                catch (ex) {
                }
            }
        }
    }],
    options: {
        title: {
            display: true,
            text: 'Luftfuktighet',
            fontSize: 24,
            fontStyle: 'bold'
        },
        legend: {
            display: false
        },
        responsive: true,
        hover: {
            mode: 'nearest',
            intersect: false
        },
        tooltips: {
            mode: 'nearest',
            intersect: false
        },
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20
                },
                distribution: 'auto'
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Humidity in percentage'
                },
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index, values) {
                        return value + '%';
                    }
                }
            }]
        }
    }
});
// Wind chart
var ctx3 = document.getElementById("myWindSpeedChart").getContext('2d');
windChart = new Chart(ctx3, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Wind speed in m/s',
            data: [],
            fill: true,
            pointRadius: 0,
            //borderColor: [
            //'rgba(255,99,132,1)',
            //'rgba(54, 162, 235, 1)',
            //'rgba(255, 206, 86, 1)',
            //'rgba(75, 192, 192, 1)',
            //'rgba(153, 102, 255, 1)',
            //'rgba(255, 159, 64, 1)'
            //],
            borderWidth: 1
        }]
    },
    plugins: [{
        beforeRender: function (x, options) {
            var c = x.chart
            var dataset = x.data.datasets[0];
            var yScale = x.scales['y-axis-0'];
            var yPos = yScale.getPixelForValue(0);

            var gradientFill = c.ctx.createLinearGradient(0, 0, 0, c.height);
            gradientFill.addColorStop(0, 'rgba(0, 70, 180, 1)');
            gradientFill.addColorStop(yPos / c.height - 0.01, 'rgba(0, 70, 180, 0.2)');

            var model = x.data.datasets[0]._meta[Object.keys(dataset._meta)[0]].dataset._model;
            model.backgroundColor = gradientFill;
        },
        beforeDraw: function (c) {
            var data = c.data.datasets[0].data;
            for (var i in data) {
                try {
                    var bar = c.data.datasets[0]._meta[0].data[i]._model;
                    if (data[i] > 0) {
                        bar.borderColor = '#E82020';
                    } else
                        bar.borderColor = '#07C';
                }
                catch (ex) {
                }
            }
        }
    }],
    options: {
        title: {
            display: true,
            text: 'Vindhastighet',
            fontSize: 24,
            fontStyle: 'bold'
        },
        legend: {
            display: false
        },
        responsive: true,
        hover: {
            mode: 'nearest',
            intersect: false
        },
        tooltips: {
            mode: 'nearest',
            intersect: false
        },
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20
                },
                distribution: 'auto'
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Vindhastighet i meter per sekund"
                },
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index, values) {
                        return value + 'm/s';
                    }
                }
            }]
        }
    }
});


