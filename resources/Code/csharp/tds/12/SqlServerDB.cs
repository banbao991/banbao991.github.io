using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.Data.SqlClient;
namespace KYL.DAL {
public class SqlServerDB {
    //连接串,
    //项目中添加引用 System.Configuration
    //在配置文件中的 <configuration>下面的 <appSettings>中加上以下的配置
    //   <add key="DB.ConnectionString" value="data source=.;initial catalog=pubs;persist security info=True;user id=sa;password=;packet size=4096" />
    //private static string _DBConnString = System.Configuration.ConfigurationManager.AppSettings["DB.ConnectionString"];
    private static string _DBConnString = System.Configuration.ConfigurationManager.ConnectionStrings["DBConnectionString"].ConnectionString;
    public static string DBConnString {
        get {
            return _DBConnString;
        }
    }
    public static DataSet GetDataSet(string sql) {
        if (DBConnString == null || DBConnString == "") return null;
        SqlDataAdapter daAdapter = new SqlDataAdapter(sql, DBConnString);
        //SqlCommandBuilder cmdbld = new SqlCommandBuilder( daAdapter );
        DataSet dsMyData = new DataSet();
        daAdapter.Fill(dsMyData);
        return dsMyData;
    }
    public static int ExecuteNonQuery(string sql) {
        if (DBConnString == null || DBConnString == "") return 0;
        SqlConnection con = new SqlConnection(DBConnString);
        SqlCommand cmd = new SqlCommand(sql, con);
        con.Open();
        int n = cmd.ExecuteNonQuery();
        con.Close();
        return n;
    }
    public static string ExecuteScalar(string sql) {
        if (DBConnString == null || DBConnString == "") return null;
        SqlConnection myConn = new SqlConnection(DBConnString);
        SqlCommand myCommand = new SqlCommand(sql, myConn);
        myConn.Open();
        object ret = myCommand.ExecuteScalar();
        myConn.Close();
        if (ret == null) return null;
        return ret.ToString();
    }
}
}