// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
var tempChart, humidChart, windChart;
var temperatures = [];
var humidities = [];
var winds = [];
var timestampArray = [];
var initial = 630000;
var count = initial;
var counter;
var initialMillis;

loadWindData();
loadTempHumid();
//setTimeout(removeDataFromCharts, initial);

// Removes all data from charts and after 5 seconds import new data
function removeDataFromCharts() {
    for (var i = 0; i < temperatures.length; i++) {
        removeData(tempChart); 
        removeData(humidChart);
    };
    for (var i = 0; i < winds.length; i++) {
        removeData(windChart);
    };
    setTimeout(getAll, 1000);    
}

// Retrieves new data and updates charts 
function getAll() {
    loadTempHumid();
    loadWindData();
    tempChart.update();
    windChart.update();
    humidChart.update();
}
function timer() {
    if (count <= 0) {
        count = initial;
        startTimer();
        removeDataFromCharts();
        return;
    }
    var current = Date.now();
    count = count - (current - initialMillis);
    initialMillis = current;
    displayCount(count);
}
// Displays countdown counter
function displayCount(count) {
    var minutes = Math.trunc((count / 1000) / 60);
    var seconds = count / 1000;
    if (count > 60000)
        document.getElementById("timer-minutes").innerHTML = minutes + " minuter";
    else
        document.getElementById("timer-minutes").innerHTML = "< " + 1  + " minut"; 
    // TODO: add seconds 
    //document.getElementById("timer-seconds").innerHTML = seconds;
}

$(window).on("load", startTimer);
function startTimer() {
    clearInterval(counter);
    initialMillis = Date.now();
    counter = setInterval(timer, 1);
}

displayCount(initial);

// Loads wind speed data from database
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
        }
    });
};

$('#timeScale input').on('change', function () {
    alert($('input[name=inlineRadioOptions]:checked', '#timeScale').val());
});


// Loads temperature and humidity data from database
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
}

function convertDate(date){
    var newDate = Date.parse(date).toString('ddd d MMM, HH:mm');
    return newDate;
}

// loops through resultset and creates new temperature and humiditiy object 
// for each resultset iteration and adds each object to the graph
function setTempHumid(result) {
    temperatures = [];
    humidities = [];
    timestampArray = []; 
    for (var i = 0; i < result.length; i++) {
        let timestamp = result[i].date;
        var date = new Date(timestamp+"Z");
        timestampArray.push(convertDate(date));
        var temp = {
            id: result[i].id,
            temperature: result[i].temperature,
            date: timestampArray[i]
        }
        var humid = {
            id: result[i].id,
            humidity: result[i].humidity,
            date: timestampArray[i]
        }        
        temperatures.push(temp);
        humidities.push(humid);
        AddData(tempChart, temperatures[i].date, temperatures[i].temperature);
        AddData(humidChart, humidities[i].date, humidities[i].humidity);
    }
}

// loops through resultset and creates new wind object 
// for each resultset iteration and adds each object to the graph
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

// Adds data to specific chart
function AddData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data)
    });
    chart.update();
}

// Removes data from specific chart
function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
}


