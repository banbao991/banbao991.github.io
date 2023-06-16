using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Win32;
class RegistryUtil {
    /*
     *
    HKEY_LOCAL_MACHINE\System\CurrentControlSet\GPS Intermediate Driver
    Drivers
    "CurrentDriver" = "Acme GPS Hardware"
    HKEY_LOCAL_MACHINE\System\CurrentControlSet\GPS Intermediate Driver
    Drivers
    Acme GPS Hardware
    "InterfaceType" = "COMM"
    "FriendlyName" = "ACME GPS Card, version 1.23"
    "CommPort" = "COM4:"
    HKEY_LOCAL_MACHINE\System\CurrentControlSet\GPS Intermediate Driver
    Multiplexer
    "DriverInterface" = "GPD1:"
     */
    public static string GetRegGpsCommPort() {
        string multi = GetRegValue("System\\CurrentControlSet\\GPS Intermediate Driver\\Multiplexer", "DriverInterface").Trim();
        if( multi != "" ) return multi;
        string driver= GetRegValue("System\\CurrentControlSet\\GPS Intermediate Driver\\Drivers", "CurrentDriver").Trim();
        if (driver != "") {
            string comm = GetRegValue("System\\CurrentControlSet\\GPS Intermediate Driver\\Drivers\\" + driver, "CommPort").Trim();
            return comm;
        }
        return "";
    }
    public static void SetRegValue(string sub, string name, string value) {
        SetRegValue(null, sub, name, value);
    }
    public static void SetRegValue(RegistryKey Key, string sub, string name, string value) {
        if( Key==null ) Key = Registry.LocalMachine;
        RegistryKey myreg = Key.OpenSubKey(sub, true); //该项必须已存在
        myreg.SetValue(name, value);
        Key.Close();
    }
    public static string GetRegValue(string sub, string name) {
        return GetRegValue(null, sub, name);
    }
    public static string GetRegValue( RegistryKey Key, string sub, string name ) {
        string info = "";
        try {
            if (Key == null) Key = Registry.LocalMachine;
            RegistryKey myreg = Key.OpenSubKey(sub);
            info = myreg.GetValue(name).ToString();
            myreg.Close();
        } catch(Exception ex) {
            string s = ex.Message;
        }
        return info;
    }
    public static void DeleteKey(RegistryKey Key, string sub, string name) {
        if (Key == null) Key = Registry.LocalMachine;
        RegistryKey delKey = Key.OpenSubKey(sub, true);
        delKey.DeleteValue(name);
        delKey.Close();
    }
    #region 几个示例
    private static bool IsRegItemExist() {
        string[] subkeyNames;
        RegistryKey hkml = Registry.LocalMachine;
        RegistryKey software = hkml.OpenSubKey("SOFTWARE");
        //RegistryKey software = hkml.OpenSubKey("SOFTWARE", true);
        subkeyNames = software.GetSubKeyNames();
        //取得该项下所有子项的名称的序列，并传递给预定的数组中
        foreach (string keyName in subkeyNames) { //遍历整个数组
            if (keyName == "test") { //判断子项的名称
                hkml.Close();
                return true;
            }
        }
        hkml.Close();
        return false;
    }
    private static bool IsRegKeyExit() {
        string[] subkeyNames;
        RegistryKey hkml = Registry.LocalMachine;
        RegistryKey software = hkml.OpenSubKey("SOFTWARE\\test");
        //RegistryKey software = hkml.OpenSubKey("SOFTWARE\\test", true);
        subkeyNames = software.GetValueNames();
        //取得该项下所有键值的名称的序列，并传递给预定的数组中
        foreach (string keyName in subkeyNames) {
            if (keyName == "test") { //判断键值的名称
                hkml.Close();
                return true;
            }
        }
        hkml.Close();
        return false;
    }
    #endregion
}