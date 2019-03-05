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
        public void AddWind()
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
                    sb.Append("INSERT INTO case_WindSpeed(wind) VALUES ('16.543');");
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
