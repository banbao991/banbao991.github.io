using System;
using System.Collections.Generic;

public class ListTest {

    public static void Main() {
        List<string> fruits = new List<string>();
        fruits.Add("Apple");
        fruits.Add("Banana");
        fruits.Add("Carrot");
        Console.WriteLine("Count: {0}", fruits.Count);
        PrintValues1(fruits);
        PrintValues2(fruits);
        PrintValues3(fruits);
    }

    private static void PrintValues1(IList<string> myList) {
        // 数组遍历方式
        for (int i = 0; i < myList.Count; i++) {
            Console.Write("{0}\n", myList[i]);
        }
    }

    private static void PrintValues2(IList<string> myList) {
        // foreach 遍历方式
        foreach (string item in myList) {
            Console.Write("{0}\n", item);
        }
    }

    private static void PrintValues3(IEnumerable<string> myList) {
        // foreach 的内部实现
        IEnumerator<string> myEnumerator = myList.GetEnumerator();
        while (myEnumerator.MoveNext()) {
            Console.Write("{0}\n", myEnumerator.Current);
        }
        Console.WriteLine();
    }
}
