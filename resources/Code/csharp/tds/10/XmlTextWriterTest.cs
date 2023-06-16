using System;
using System.IO;
using System.Xml;

public class Sample {
    private const string filename = "sampledata.xml";
    public static void Main() {
        XmlTextWriter writer = null;
        writer = new XmlTextWriter (filename, null);
        // 为使文件易读，使用缩进
        writer.Formatting = Formatting.Indented;
        // 写XML声明
        writer.WriteStartDocument();

        // 引用样式
        String PItext="type='text/xsl' href='book.xsl'";
        writer.WriteProcessingInstruction("xml-stylesheet", PItext);
        // 文档类型
        writer.WriteDocType("book", null, null, "<!ENTITY h 'hardcover'>");
        // 写入注释
        writer.WriteComment("sample XML");

        // 写一个元素（根元素）
        writer.WriteStartElement("book");
        // 属性
        writer.WriteAttributeString("genre", "novel");
        writer.WriteAttributeString("ISBN", "1-8630-014");

        // 书名元素
        writer.WriteElementString("title", "The Handmaid's Tale");
        // Write the style element
        writer.WriteStartElement("style");
        writer.WriteEntityRef("h");
        writer.WriteEndElement();
        // 价格元素
        writer.WriteElementString("price", "19.95");
        // 写入 CDATA
        writer.WriteCData("Prices 15% off!!");
        // 关闭根元素
        writer.WriteEndElement();
        writer.WriteEndDocument();

        writer.Flush();
        writer.Close();

        // 加载文件
        XmlDocument doc = new XmlDocument();
        doc.PreserveWhitespace = true;
        doc.Load(filename);
        // XML文件的内容显示在控制台
        Console.Write(doc.InnerXml);
    }
}
