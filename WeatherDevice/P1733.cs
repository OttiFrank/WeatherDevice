using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeatherDevice
{
    class P1733
    {
        //Original value was 16500000
        const int _CLOCKSIGNAL = 10000000;
        const double _VOLTAGE = 2000; 

        public int CLOCK_SIGNAL
        {
            get
            {
                return _CLOCKSIGNAL; 
            }
        }
        public double VOLTAGE
        {
            get
            {
                return _VOLTAGE; 
            }
        }
    }
}
