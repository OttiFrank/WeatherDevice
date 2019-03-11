var tempChart, humidChart, windChart;
var temperatures = [];
var humidities = [];
var winds = [];
var timeLabels = [];
var timestamps = [];
var initial = 630000;
var count = initial;
var counter;
var initialMillis;

loadWindData();
loadTempHumid();
$(window).on("load", startTimer);
displayCount(initial);

$('#timeScale input').on('change', function () {
    var selectedTimeScale = $('input[name=inlineRadioOptions]:checked', '#timeScale').val();
    var selectedDate;
    switch (selectedTimeScale) {
        case "day":
            selectedDate = new Date().last().day().setTimeToNow();
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
        removeAllDataFromCharts();
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
            console.log(result);
            setWindSpeed(result);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        };
    });
};
function loadTempHumid() {
    $.ajax({
        url: '/Home/TempHumidList',
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            console.log(result);
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
    temperatures = [];
    humidities = [];
    timeLabels = [];
    timestamps = [];
    for (var i = 0; i < result.length; i++) {
        let timestamp = result[i].date;
        var date = new Date(timestamp + "Z");
        timeLabels.push(convertDateToString(date));
        var temp = {
            id: result[i].id,
            temperature: result[i].temperature,
            date: timeLabels[i]
        }
        var humid = {
            id: result[i].id,
            humidity: result[i].humidity,
            date: timeLabels[i]
        }
        temperatures.push(temp);
        humidities.push(humid);
        timestamps.push(date);

        AddData(tempChart, temperatures[i].date, temperatures[i].temperature);
        AddData(humidChart, humidities[i].date, humidities[i].humidity);
    }

    //addDataToGraph("tempHumid");
    console.log(timestamps);
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
        AddData(windChart, winds[i].date, winds[i].windspeed);
    }
}

// Helper functions for CRUD-operations on specific charts
function AddData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data)
    });
    chart.update();
};
function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
};
function addDataToGraph(type) {
    switch (type) {
        case "tempHumid":
            for (var i = 0; i < temperatures.length; i++) {
                AddData(tempChart, tempTimestamps[i].date, array[i].temperature);
                AddData(humidChart, tempHumid[i].date, array[i].temperature);
            }
            break;
        case "wind":
            for (var i = 0; i < winds.length; i++) {
                AddData(graph, array[i].date, array[i].temperature);
            }
            break;
    };
};
function filterGraphs(date) {
    var today = Date.today().setTimeToNow();
    for (let i = 0; i <= timestamps.length; i++) {
        if (Date.today().between(date, today)) {
            // TODO: stuff
        }
    };
};
function removeAllDataFromCharts() {
    for (var i = 0; i < temperatures.length; i++) {
        removeData(tempChart);
        removeData(humidChart);
    };
    for (var i = 0; i < winds.length; i++) {
        removeData(windChart);
    };
    setTimeout(getAll, 1000);
}


function convertDateToString(date) {
    var newDate = Date.parse(date).toString('ddd d MMM, HH:mm');
    return newDate;
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


