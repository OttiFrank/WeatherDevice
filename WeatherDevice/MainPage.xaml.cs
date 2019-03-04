using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Devices.Enumeration;
using Windows.Devices.Gpio;
using Windows.Devices.I2c;
using Windows.Devices.Spi;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;
using static WeatherDevice.MCP3008;

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

        MCP3008 _mcp3008 = new MCP3008();

        public MainPage()
        {
            this.InitializeComponent();
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            StopScenario();
        }


        async Task StartScenarioAsync()
        {
            string i2cDeviceSelector = I2cDevice.GetDeviceSelector();
            IReadOnlyList<DeviceInformation> devices = await DeviceInformation.FindAllAsync(i2cDeviceSelector);
            _mcp3008.InitializeMCP3008(SerialCommunication.SINGLE_ENDED, Channel.CH0, SpiCommunication.SPI0, SpiMode.Mode0);

            var SI7021_settings = new I2cConnectionSettings(0x40);
            si7021Sensor = await I2cDevice.FromIdAsync(devices[0].Id, SI7021_settings);

            timer = new DispatcherTimer() { Interval = TimeSpan.FromMilliseconds(500) };
            timer.Tick += Timer_Tick;
            timer.Start();

        }

        private void StopScenario()
        {
            if (timer != null)
            {
                timer.Tick -= Timer_Tick;
                timer.Stop();
                timer = null;

            }

            if (si7021Sensor != null)
            {
                si7021Sensor.Dispose();
                si7021Sensor = null;
            }
        }

        async void StartStopScenario()
        {
            if (timer != null)
            {
                StopScenario();
                StartStopButton.Content = "Start";
                ScenarioControls.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
            }
            else
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
            GetTempAndHumidity();
            System.Diagnostics.Debug.WriteLine(_mcp3008.ReturnResult().ToString());
        }



        private void GetTempAndHumidity()
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
            double humidity = ((rawHumidityReading * 125) / (float)65536) - 6;
            CurrentHumidity.Text = humidity.ToString();

            // Calculate and report the temperature
            var rawTempReading = temperatureData[0] << 8 | temperatureData[1];
            System.Diagnostics.Debug.WriteLine(rawTempReading);
            var tempRatio = rawTempReading / (float)65536;
            double temperature = (-46.85 + (175.72 * tempRatio));
            CurrentTemp.Text = temperature.ToString();
        }
    }
}
