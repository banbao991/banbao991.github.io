using System;
using System.Text;


class TestStringStringBuilder {
    private const int CYCLE = 10000;

    private static void testInsertHead(string str) {
        Console.WriteLine("Insert\nTest String: " + str);
        DateTime a = DateTime.Now;
        string s = "";
        for (int i = 0; i < CYCLE; ++i) {
            s = s.Insert(0, str);
        }
        Console.WriteLine("\tstring:\n\t\t " + (DateTime.Now - a));

        a = DateTime.Now;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < CYCLE; ++i) {
            sb = sb.Insert(0, str);
        }
        Console.WriteLine("\tStringBuilder:\n\t\t " + (DateTime.Now - a));
    }

    private static void testAppendTail(string str) {
        Console.WriteLine("Append\nTest String: " + str);
        DateTime a = DateTime.Now;
        string s = "";
        for (int i = 0; i < CYCLE; ++i) {
            s = s + str;
        }
        Console.WriteLine("\tstring:\n\t\t " + (DateTime.Now - a));

        a = DateTime.Now;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < CYCLE; ++i) {
            sb = sb.Append(str);
        }
        Console.WriteLine("\tStringBuilder:\n\t\t " + (DateTime.Now - a));
    }

    private static void Main(string[] args) {
        testInsertHead("test string");
        testInsertHead(".");

        testAppendTail("test string");
        testAppendTail(".");

        Console.Read();
        return;
    }
}
/*Output
Insert
Test String: test string
        string:
                 00:00:00.3391256
        StringBuilder:
                 00:00:01.2311807
Insert
Test String: .
        string:
                 00:00:00.0239335
        StringBuilder:
                 00:00:00.0408926
Append
Test String: test string
        string:
                 00:00:00.2792579
        StringBuilder:
                 00:00:00
Append
Test String: .
        string:
                 00:00:00.0219424
        StringBuilder:
                 00:00:00
*/