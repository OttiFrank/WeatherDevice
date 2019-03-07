using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeatherDevice
{
    class DBConnection
    {
        public void AddTempAndHumid(double temp, double humid)
        {
            try
            {
                SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder
                {
                    DataSource = "tcp:case-weatherstation.database.windows.net,1433",
                    UserID = "h15marle",
                    Password = "Leijon950802",
                    InitialCatalog = "Case_WeatherStation"
                };

                using (SqlConnection connection = new SqlConnection(builder.ConnectionString))
                {
                    connection.Open();
                    StringBuilder sb = new StringBuilder();
                    sb.Append("INSERT INTO case_TempHumid(temp, humid) VALUES ('" + temp + "', '" + humid + "');");
                    sb.Append("SELECT * FROM case_TempHumid;");
                    String sql = sb.ToString();

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                System.Diagnostics.Debug.WriteLine("Temp: " + reader[1] + ", Humid: " + reader[2] + ", Date: " + reader[3]);
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e.ToString());
            }
        }
        public void AddWind(double wind)
        {
            try
            {
                SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder
                {
                    DataSource = "tcp:case-weatherstation.database.windows.net,1433",
                    UserID = "h15marle",
                    Password = "Leijon950802",
                    InitialCatalog = "Case_WeatherStation"
                };

                using (SqlConnection connection = new SqlConnection(builder.ConnectionString))
                {
                    connection.Open();
                    StringBuilder sb = new StringBuilder();
                    sb.Append("INSERT INTO case_WindSpeed(wind) VALUES ('" + wind + "');");
                    sb.Append("SELECT * FROM case_WindSpeed;");
                    String sql = sb.ToString();

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                System.Diagnostics.Debug.WriteLine("Vind: " + reader[1] + ", Datum: " + reader[2]);
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e.ToString());
            }
        }
    }
}
