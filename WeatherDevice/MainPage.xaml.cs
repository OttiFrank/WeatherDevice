using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
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
        DispatcherTimer P1733Timer, si7021Timer;
        Si7021 si7021 = new Si7021();
        MCP3008 _mcp3008 = new MCP3008();
        DBConnection db = new DBConnection();

        List<double> windSpeedArray = new List<double>();

        double meanWind = 0;
        double temperature, humidity; 
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

            si7021Timer = new DispatcherTimer() { Interval = TimeSpan.FromSeconds(15) }; 
            P1733Timer = new DispatcherTimer() { Interval = TimeSpan.FromMilliseconds(500) };
            P1733Timer.Tick += P1733Timer_Tick;
            si7021Timer.Tick += si7021Timer_Tick;
            P1733Timer.Start();
            si7021Timer.Start();

        }

        private void StopScenario()
        {
            if (P1733Timer != null)
            {
                P1733Timer.Tick -= P1733Timer_Tick;
                P1733Timer.Stop();
                P1733Timer = null;

            }

            if (si7021 != null)
            {
                si7021.Dispose();
                si7021 = null;
            }
        }

        void si7021Timer_Tick(object sender, object e)
        {
            db.AddTempAndHumid(temperature, humidity);  
        }

        void P1733Timer_Tick(object sender, object e)
        {
            si7021.SetTemperatureAndHumidity();
            setWindSpeedArray();
            PrintToScreen();
        }

        private void PrintToScreen()
        {
            temperature = si7021.GetTemperature;
            humidity = si7021.GetHumidity; 
            CurrentHumidity.Text = humidity.ToString() + "%";
            CurrentTemp.Text = temperature.ToString() + "°C";
            CurrentWindSpeed.Text = Math.Round(_mcp3008.ReturnResult(), 2).ToString() + "m/s";
            CurrentMeanWind.Text = meanWind.ToString() + "m/s";
        }

        private void setWindSpeedArray()
        {
            
            var windSpeed = _mcp3008.ReturnResult();
            if (windSpeedArray.Count < 30)
            {
                windSpeedArray.Add(windSpeed);
                count++;
                

            }
            else if(windSpeedArray.Count == 30)
            {
                CalculateWindSpeedMean();
                windSpeedArray.Clear();
                count = 0;
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
            db.AddWind(meanWind);
        }
    }
}
