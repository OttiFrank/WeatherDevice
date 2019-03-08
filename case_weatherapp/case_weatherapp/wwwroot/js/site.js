// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
var myChart;
var temperatures = [];
var humidities = [];
var timestampArray = [];
var dateArray = [];
var timeArray = [];
loadWindData();
loadTempHumid();

function loadWindData()
{
    $.ajax({
        url: '/Home/WindList',
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function(result){
            console.log(result);
        },
        error: function(error) {
            console.log(JSON.stringify(error));
        }
    });
}
function loadTempHumid() 
{
    $.ajax({
        url: '/Home/TempHumidList',
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function(result){
            for(var i = 0; i < result.length; i++) {
                
                let timestamp = result[i].date; 
                var date = timestamp.split("T"); 
                dateArray.push(date[0]);
                timeArray.push(date[1]);
                timestampArray.push(date[0] + " " + date[1]); 

                var temp = {
                    temperature:result[i].temperature,
                    date: timestampArray[i]
                }
                var humid = {
                    humidity: result[i].humidity,
                    date: result[i].date
                }
                temperatures.push(temp); 
                humidities.push(humid);

                AddData(myChart, temperatures[i].date, temperatures[i].temperature);
            }
            console.log(temperatures[2]);
            console.log(dateArray);
            console.log(timeArray);
            console.log(timestampArray);
        },
        error: function(error) {
            console.log(JSON.stringify(error));
        }
    });
}

var ctx = document.getElementById("myChart").getContext('2d');
myChart = new Chart(ctx, {
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
                            console.log(ex.message);
                        }
                            console.log(data[i]);
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
            ticks: {
              beginAtZero:true
            }
          }]
        }
      }
    });
    
function AddData(chart, label, data) 
{
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data)
    });
    chart.update();
}


