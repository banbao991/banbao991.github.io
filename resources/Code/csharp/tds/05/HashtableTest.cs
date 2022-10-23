using System;
using System.Collections;

public class HashtableTest {

    public static void Main() {
        Hashtable myHT = new Hashtable();
        myHT.Add("Ton V. Bergyk", "023-010-66756");
        myHT.Add("Tom Sony", "086-010-27654");
        myHT.Add("Mr. John", "071-222-33445");
        myHT["Mr. John"] = "071-222-33445"; // 加入或修改
        PrintKeysAndValues(myHT);
        PrintByKeys(myHT);
    }

    public static void PrintKeysAndValues(Hashtable myList) {
        // (k,v) 对遍历
        IDictionaryEnumerator myEnumerator = myList.GetEnumerator();
        while (myEnumerator.MoveNext()) {
            Console.WriteLine("\t{0}:\t{1}", myEnumerator.Key, myEnumerator.Value);
        }
        Console.WriteLine();
    }

    public static void PrintByKeys(Hashtable myList) {
        // k 遍历, 通过 [] 获取对应的 v
        IEnumerator ie = myList.Keys.GetEnumerator();
        while (ie.MoveNext()) {
            object key = ie.Current;
            object value = myList[key];
            Console.WriteLine("\t{0}:\t{1}", key, value);
        }
        Console.WriteLine();
        
        // foreach
        foreach (string key in myList.Keys) {
            Console.WriteLine("\t{0}:\t{1}", key, myList[key]);
        }
    }
}