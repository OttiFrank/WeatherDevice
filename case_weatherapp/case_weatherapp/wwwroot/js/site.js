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
          fill: false,
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
                    unit: 'hour',
                dispayFormat: {
                    'hour': 'h', 
                },
              },
            ticks: {
                source: 'data',
                maxTicksLimit: 20,
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


