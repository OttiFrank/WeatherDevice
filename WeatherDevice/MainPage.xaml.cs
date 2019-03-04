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
using static WeatherDevice.Si7021; 

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace WeatherDevice
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        DispatcherTimer timer;
        Si7021 si7021 = new Si7021();
        MCP3008 _mcp3008 = new MCP3008();

        List<double> windSpeedArray = new List<double>();

        double meanWind = 0;

        int count = 0;

        public MainPage()
        {
            this.InitializeComponent();
            StartScenarioAsync(); 
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            StopScenario();
        }


        async Task StartScenarioAsync()
        {
            
            _mcp3008.InitializeMCP3008(SerialCommunication.SINGLE_ENDED, Channel.CH0, SpiCommunication.SPI0, SpiMode.Mode0);
            si7021.InitializeSi7021(); 

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

            if (si7021 != null)
            {
                si7021.Dispose();
                si7021 = null;
            }
        }

        void Timer_Tick(object sender, object e)
        {
            si7021.SetTemperatureAndHumidity();
            setWindSpeedArray();
            PrintToScreen();
        }

        private void PrintToScreen()
        {
            CurrentHumidity.Text = si7021.GetHumidityAsString + "%";
            CurrentTemp.Text = si7021.GetTemperatureAsString + "°C";
            CurrentWindSpeed.Text = Math.Round(_mcp3008.ReturnResult(), 2).ToString() + "m/s";
            CurrentMeanWind.Text = meanWind.ToString() + "m/s";
        }

        private void setWindSpeedArray()
        {
            
            var windSpeed = _mcp3008.ReturnResult();
            if (windSpeedArray.Count < 30)
            {
                windSpeedArray.Add(windSpeed);
                System.Diagnostics.Debug.WriteLine(count + ". " + windSpeedArray[count]);
                count++;
                

            }
            else if(windSpeedArray.Count == 30)
            {
                CalculateWindSpeedMean();
                windSpeedArray.Clear();
                count = 0;
                System.Diagnostics.Debug.WriteLine(windSpeedArray.Count);
            }
            
                
        }

        private void CalculateWindSpeedMean()
        {
            double mean = 0;
            foreach (double item in windSpeedArray)
            {
                mean += item;
            }
            meanWind = Math.Round((mean / windSpeedArray.Count), 2);
            System.Diagnostics.Debug.WriteLine("Medelhastighet: " + meanWind + "m/s");   
        }
    }
}
