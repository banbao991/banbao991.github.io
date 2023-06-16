using System;
using System.Xml;

class Test {

    static void Main() {
        // XmlDocument 类使用
        XmlDocument xd = new XmlDocument();
        try {
            // .Load
            xd.Load(".\\BookList.xml");
        } catch( XmlException e ) {
            Console.WriteLine("Exception caught:  "+ e.ToString());
        }
        // XmlNode 类
        // 根结点
        XmlNode doc = xd.DocumentElement;

        // 判断是否有子结点
        if( doc.HasChildNodes ) {
            processChildren(doc,  0);
        }
    }

    static void processChildren( XmlNode xn, int level) {
        string istr;
        istr = indent(level);
        // 判断结点类型
        switch( xn.NodeType ) {
        // 文档类型
        case XmlNodeType.Comment:
            Console.WriteLine(istr +  "<!--" + xn.Value +  "-->");
            break;
        // 说明信息
        case XmlNodeType.ProcessingInstruction:
            Console.WriteLine(istr + "<?" + xn.Name +  " " + xn.Value +" ?>");
            break;
        // Text
        case XmlNodeType.Text:
            Console.WriteLine(istr + xn.Value);
            break;
        // 子结点
        case XmlNodeType.Element:
            XmlNodeList ch = xn.ChildNodes;
            Console.Write(istr + "<" + xn.Name);

            // 处理属性
            XmlAttributeCollection atts = xn.Attributes;
            if( atts != null ) {
                foreach( XmlNode at in atts ) {
                    Console.Write( " "  + at.Name + "=" + at.Value);
                }
            }
            Console.WriteLine(">");

            foreach(XmlNode nd in ch ) {
                // 对子结点递归调用
                processChildren(nd,  level + 2);
            }
            Console.WriteLine(istr + "</" + xn.Name+ ">");
            break;
        }

    }

    static string indent( int i ) {
        if( i==0 ) return "";
        return new String( ' ', i );
    }
}
