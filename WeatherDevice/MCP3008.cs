using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Devices.Enumeration;
using Windows.Devices.Spi;

namespace WeatherDevice
{
    class MCP3008
    {
        SpiDevice _device;
        P1733 _P1733 = new P1733();
        string _CHOICECHANNEL;

        const double _MAXVALUE = 1023.0;
        const int _MINVALUE = 0;
        const int _RESOLUTIONBITS = 10;
        const int _SHIFTBYTE = 0;

        byte[] _CH0 = new byte[] { 1, 0x80, 0 };
        byte[] _CH1 = new byte[] { 1, 0x90, 0 };
        byte[] _CH2 = new byte[] { 1, 0xA0, 0 };
        byte[] _CH3 = new byte[] { 1, 0xB0, 0 };
        byte[] _CH4 = new byte[] { 1, 0xC0, 0 };
        byte[] _CH5 = new byte[] { 1, 0xD0, 0 };
        byte[] _CH6 = new byte[] { 1, 0xE0, 0 };
        byte[] _CH7 = new byte[] { 1, 0xF0, 0 };
        byte[] _DATARECEIVED = new byte[] { 0, 0, 0 }; 

        public async void InitializeMCP3008(SerialCommunication serialcomunication, Channel channel, SpiCommunication spiComunication, SpiMode mode)
        {
            var spiConnectionSettings = new SpiConnectionSettings((int) spiComunication);
            //spiConnectionSettings.ClockFrequency = _P1733.CLOCK_SIGNAL;
            spiConnectionSettings.Mode = mode;

            string spiDevice = SpiDevice.GetDeviceSelector(spiComunication.ToString());
            var deviceInformation = await DeviceInformation.FindAllAsync(spiDevice);

            if(deviceInformation != null && deviceInformation.Count > 0)
            {
                _device = await SpiDevice.FromIdAsync(deviceInformation[0].Id, spiConnectionSettings);
                _CHOICECHANNEL = channel.ToString(); 
            } else
            {
                System.Diagnostics.Debug.WriteLine("Device could not be found");
                return;
            }
        }

        public double ReturnResult()
        {
            switch(_CHOICECHANNEL)
            {
                case "CH0":
                    _device.TransferFullDuplex(_CH0, _DATARECEIVED);
                    break;
                case "CH1":
                    _device.TransferFullDuplex(_CH1, _DATARECEIVED);
                    break;
                case "CH2":
                    _device.TransferFullDuplex(_CH2, _DATARECEIVED);
                    break;
                case "CH3":
                    _device.TransferFullDuplex(_CH3, _DATARECEIVED);
                    break;
                case "CH4":
                    _device.TransferFullDuplex(_CH4, _DATARECEIVED);
                    break;
                case "CH5":
                    _device.TransferFullDuplex(_CH5, _DATARECEIVED);
                    break;
                case "CH6":
                    _device.TransferFullDuplex(_CH6, _DATARECEIVED);
                    break;
                case "CH7":
                    _device.TransferFullDuplex(_CH7, _DATARECEIVED);
                    break;
            }
            byte[] writeBuffer = new byte[3] { 0x00, 0x00, 0x00 };
            byte[] readBuffer = new Byte[3];




            //var result = ((_DATARECEIVED[2] & 0x03) << _SHIFTBYTE);
            var result = _DATARECEIVED[2];
            var mVolt = result * (_P1733.VOLTAGE / _MAXVALUE);
            var windSpeed = mVolt / _RESOLUTIONBITS;
            var DV = result;
            var RV = 5;
            //((mVolt - 0.4) / 1.6 * 32.4) / 1000; 
            float nr = (DV * RV) / 1024f; 
            return (float) nr; 
        }
        public enum SerialCommunication
        {
            SINGLE_ENDED,
            DIFFERENTIAL
        }

        public enum Channel
        {
            CH0, CH1, CH2, CH3, CH4, CH5, CH6, CH7
        }

        public enum SpiCommunication
        {
            SPI0,
            SPI1
        }

    }
}
