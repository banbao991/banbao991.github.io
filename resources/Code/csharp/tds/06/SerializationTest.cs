using System;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;

namespace SerializationTest {
[Serializable]
class Book {
    public string name;
    public double price;
    // 如果 book 的版本变了，反序列化时，这个默认值不会被执行
    public int num = 13; 
    public string [] reader;
    override public string ToString() {
        return "book: " + name 
               + "\nprice :" + price
               + "\nauthors :" + string.Join(",",reader)
               + "\nversion :" + num;
    }
}

class Program {
    static void Main(string[] args) {
        TestBinary();
    }
    static void TestBinary() {
        BinaryFormatter formatter = new BinaryFormatter();

        Book book = new Book();
        book.name = "学习C#";
        book.price = 123.45;
        book.reader = new string[] { "张三", "李四", "王五"};
        book.num = 14;

        // Binary
        // 序列化
        FileStream stream = new FileStream(".\\StrObj.t", FileMode.Create, FileAccess.Write,
                                           FileShare.None);
        formatter.Serialize(stream, book);
        stream.Close();
        
        // 反序列化
        FileStream readstream = new FileStream(".\\StrObj.t", FileMode.Open, FileAccess.Read,
                                               FileShare.Read );
        Book book2 = (Book)formatter.Deserialize(readstream);
        readstream.Close();

        Console.WriteLine(book2);
        // Console.ReadLine();
    }
}
}