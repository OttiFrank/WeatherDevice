﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Devices.Enumeration;
using Windows.Devices.Gpio;
using Windows.Devices.I2c; 
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace WeatherDevice
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        I2cDevice si7021Sensor;
        DispatcherTimer timer;

        public MainPage()
        {
            this.InitializeComponent();

            //InitGPIO();
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            StopScenario();
        }
        async Task StartScenarioAsync()
        {
            string i2cDeviceSelector = I2cDevice.GetDeviceSelector();
            IReadOnlyList<DeviceInformation> devices = await DeviceInformation.FindAllAsync(i2cDeviceSelector);

            var SI7021_settings = new I2cConnectionSettings(0x40);
            si7021Sensor = await I2cDevice.FromIdAsync(devices[0].Id, SI7021_settings);

            timer = new DispatcherTimer() { Interval = TimeSpan.FromMilliseconds(500) };
            timer.Tick += Timer_Tick;
            timer.Start();
        }

        private void StopScenario()
        {
            if(timer != null)
            {
                timer.Tick -= Timer_Tick;
                timer.Stop();
                timer = null; 

            }

            if(si7021Sensor != null)
            {
                si7021Sensor.Dispose();
                si7021Sensor = null; 
            }
        }

        async void StartStopScenario()
        {
            if(timer != null)
            {
                StopScenario();
                StartStopButton.Content = "Start";
                ScenarioControls.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
            } else
            {
                StartStopButton.IsEnabled = false;
                await StartScenarioAsync();
                StartStopButton.IsEnabled = true;
                StartStopButton.Content = "Stop";
                ScenarioControls.Visibility = Windows.UI.Xaml.Visibility.Visible;
            }
        }


        void Timer_Tick(object sender, object e)
        {
            var command = new byte[1];
            var humidityData = new byte[2];
            var temperatureData = new byte[2];

            // Read humidity
            command[0] = 0xE5;

            si7021Sensor.WriteRead(command, humidityData);

            // Read temperature
            command[0] = 0xE3;
            si7021Sensor.WriteRead(command, temperatureData);

            // Calculate and report the humidity
            var rawHumidityReading = humidityData[0] << 8 | humidityData[1];
            var humidityRatio = rawHumidityReading / (float) 65536;
            double humidity = -6 + (125 * humidityRatio);
            CurrentHumidity.Text = humidity.ToString();

            // Calculate and report the temperature
            var rawTempReading = temperatureData[0] << 8 | temperatureData[1];
            var tempRatio = rawTempReading / (float) 65536;
            double temperature = (-46.85 + (175.72 * tempRatio));
            CurrentTemp.Text = temperature.ToString();
        }
    }
}
