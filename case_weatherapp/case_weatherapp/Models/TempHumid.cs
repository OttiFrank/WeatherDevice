using System;
namespace case_weatherapp.Models
{
    public class TempHumid
    {
        public int Id { get; set; }
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public DateTime Date { get; set; }
    }
}
