using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
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
        const int CL_PIN = 3;
        const int DA_PIN = 5;
        const int PW_PIN = 1;
        const int GND_PIN = 6;

        GpioPin cl_pin, da_pin;
        GpioPinValue pinValue;
        DispatcherTimer timer;

        float temp;
        float humidity;


        public MainPage()
        {
            InitializeComponent();


            InitTimer();           
            InitGPIO();
            if (da_pin != null)
            {
                timer.Start();
            }

        }

        private void InitTimer()
        {
            timer = new DispatcherTimer();
            timer.Interval = TimeSpan.FromMilliseconds(1001);
            timer.Tick += ReadSensor;
        }

        private void InitGPIO()
        {
            var gpio = GpioController.GetDefault();

            if (gpio == null)
            {
                cl_pin = null;
                da_pin = null;
                GpioStatus.Text = "There is no GPIO controller on this device.";
                return;
            }
            pinValue = GpioPinValue.High;

            cl_pin = gpio.OpenPin(CL_PIN);
            cl_pin.Write(pinValue);
            cl_pin.SetDriveMode(GpioPinDriveMode.Output);
            GpioStatus.Text = "CL PIN: " + cl_pin.Read();

            da_pin = gpio.OpenPin(DA_PIN);
            da_pin.SetDriveMode(GpioPinDriveMode.Input);
            //GpioStatus.Text = "DA PIN: " + da_pin.Read().ToString();
        }
        void ReadSensor(object sender, object e)
        {
            SensorOuputValue.Text = da_pin.Read().ToString();
        }

    }
}
