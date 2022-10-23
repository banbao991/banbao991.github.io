using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.Data.OleDb;
namespace KYL.DAL {
public class AccessDB {
    //数据库,
    //项目中添加引用 System.Configuration
    //在配置文件中的 <configuration>下面的 <appSettings>中加上以下的配置
    //   <add key="AccessDB" value="Demo.accdb"/>
    private static string _AccessDB = System.Configuration.ConfigurationManager.AppSettings["AccessDB"];
    //private static string _DBConnString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + Environment.CurrentDirectory + "\\" + _AccessDB; //这是早期的Access数据库
    private static string _DBConnString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + Environment.CurrentDirectory + "\\" + _AccessDB; //这是2007以后的Access数据库
    public static string DBConnString {
        get {
            return _DBConnString;
        }
    }
    public static DataSet GetDataSet(string sql) {
        if (DBConnString == null || DBConnString == "") return null;
        OleDbDataAdapter daAdapter = new OleDbDataAdapter(sql, DBConnString);
        //OleDbCommandBuilder cmdbld = new OleDbCommandBuilder( daAdapter );
        DataSet dsMyData = new DataSet();
        daAdapter.Fill(dsMyData);
        return dsMyData;
    }
    public static int ExecuteNonQuery(string sql) {
        if (DBConnString == null || DBConnString == "") return 0;
        OleDbConnection con = new OleDbConnection(DBConnString);
        OleDbCommand cmd = new OleDbCommand(sql, con);
        con.Open();
        int n = cmd.ExecuteNonQuery();
        con.Close();
        return n;
    }
    public static string ExecuteScalar(string sql) {
        if (DBConnString == null || DBConnString == "") return null;
        OleDbConnection myConn = new OleDbConnection(DBConnString);
        OleDbCommand myCommand = new OleDbCommand(sql, myConn);
        myConn.Open();
        object ret = myCommand.ExecuteScalar();
        myConn.Close();
        if (ret == null) return null;
        return ret.ToString();
    }
}
}