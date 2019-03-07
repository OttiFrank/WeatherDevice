using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Devices.Enumeration;
using Windows.Devices.I2c;
using Windows.Devices.Spi;

namespace WeatherDevice
{
    class Si7021
    {
        I2cDevice si7021Sensor;        

        double humidity;
        double temperature;

        public I2cDevice GetSi7021Sensor()
        {
            return si7021Sensor; 
        }

        public async void InitializeSi7021()
        {
            string i2cDeviceSelector = I2cDevice.GetDeviceSelector();
            IReadOnlyList<DeviceInformation> devices = await DeviceInformation.FindAllAsync(i2cDeviceSelector);
            var deviceInformation = await DeviceInformation.FindAllAsync(i2cDeviceSelector);
            var SI7021_settings = new I2cConnectionSettings(0x40);
            si7021Sensor = await I2cDevice.FromIdAsync(deviceInformation[0].Id, SI7021_settings);
        }

        public void Dispose()
        {
            si7021Sensor.Dispose(); 
        }

        public void SetTemperatureAndHumidity()
        {
            var command = new byte[1];
            var temperatureData = new byte[2];
            var humidityData = new byte[2];

            //read humidity
            command[0] = 0xE5;
            si7021Sensor.WriteRead(command, humidityData);

            // Read temperature
            command[0] = 0xE3; 
            si7021Sensor.WriteRead(command, temperatureData);

            // Calculate and report the humidity
            var rawHumidityReading = humidityData[0] << 8 | humidityData[1];
            humidity = Math.Round((((rawHumidityReading * 125) / (float)65536) - 6),2);

            // Calculate and report the temperature
            var rawTempReading = temperatureData[0] << 8 | temperatureData[1];
            var tempRatio = rawTempReading / (float)65536;
            temperature = Math.Round((-46.85 + (175.72 * tempRatio)), 2);
        }
        public double GetTemperature
        {
            get
            {
                return temperature;
            }
        }
        public double GetHumidity
        {
            get
            {
                return humidity;
            }
        }
    }
}
