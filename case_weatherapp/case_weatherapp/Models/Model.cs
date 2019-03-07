using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;

namespace case_weatherapp.Models
{
    public class Model
    {

        public Model()
        {

        }

        SqlConnectionStringBuilder ConnectToDb()
        {
            try
            {
                SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder
                {
                    DataSource = "tcp:case-weatherstation.database.windows.net, 1433",
                    UserID = "h15marle",
                    Password = "Leijon950802",
                    InitialCatalog = "Case_WeatherStation"
                };
                System.Diagnostics.Debug.WriteLine("Connected to DB");
                return builder;
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e.ToString());
            }
            return null;
        }

        // Get windspeed from database
        public List<Wind> GetWinds()
        {
            List<Wind> windList = new List<Wind>();
            var builder = this.ConnectToDb();
            using (SqlConnection connection = new SqlConnection(builder.ConnectionString))
            {
                connection.Open();
                StringBuilder sb = new StringBuilder();
                sb.Append("SELECT * FROM case_WindSpeed;");
                String sql = sb.ToString();

                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            windList.Add(new Wind
                            {
                                Id = Int32.Parse(reader[0].ToString()),
                                Windspeed = Double.Parse(reader[1].ToString()),
                                Date = DateTime.Parse(reader[2].ToString())
                            });
                        }
                        return windList;
                    }
                }
            }
        }

        // Get temperature and humidity from database
        public List<TempHumid> GetTempHumid()
        {
            List<TempHumid> tempHumidList = new List<TempHumid>();
            var builder = this.ConnectToDb();
            using (SqlConnection connection = new SqlConnection(builder.ConnectionString))
            {
                connection.Open();
                StringBuilder sb = new StringBuilder();
                sb.Append("SELECT * FROM case_TempHumid;");
                String sql = sb.ToString();

                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            tempHumidList.Add(new TempHumid
                            {
                                Id = Int32.Parse(reader[0].ToString()),
                                Temperature = Double.Parse(reader[1].ToString()),
                                Humidity = Double.Parse(reader[2].ToString()),
                                Date = DateTime.Parse(reader[3].ToString())
                            });
                        }
                        return tempHumidList;
                    }
                }
            }
        }
    }
}
