using System;
using System.Reflection;

[AttributeUsage(AttributeTargets.Class
     | AttributeTargets.Method,
     AllowMultiple = true)]
public class HelpAttribute : System.Attribute {
    public readonly string Url;
    private string topic;

    // 属性 Topic 是命名参数
    public string Topic {
        get {
            return topic;
        }
        set {
            topic = value;
        }
    }

    // url 是位置参数
    public HelpAttribute(string url) {
        this.Url = url;
    }
}

[HelpAttribute("https://msvc/MyClassInfo", Topic = "Test"),
Help("https://my.com/about/class")]
internal class MyClass {

    [Help("http;//my.com/about/method")]
    public void MyMethod(int i) {
        return;
    }
}

public class MemberInfo_GetCustomAttributes {

    public static void Main() {
        Type myType = typeof(MyClass);
        object[] attributes = myType.GetCustomAttributes(false);
        for (int i = 0; i < attributes.Length; i++) {
            PrintAttributeInfo(attributes[i]);
        }
        MemberInfo[] myMembers = myType.GetMembers();
        for (int i = 0; i < myMembers.Length; i++) {
            Console.WriteLine("\nNumber {0}: ", myMembers[i]);
            Object[] myAttributes = myMembers[i].GetCustomAttributes(false);
            for (int j = 0; j < myAttributes.Length; j++) {
                PrintAttributeInfo(myAttributes[j]);
            }
        }
    }

    private static void PrintAttributeInfo(object attr) {
        if (attr is HelpAttribute) {
            HelpAttribute attrh = (HelpAttribute)attr;
            Console.WriteLine("----Url: " + attrh.Url + "  Topic: " + attrh.Topic);
        }
    }
}

/*Output
----Url: https://msvc/MyClassInfo  Topic: Test
----Url: https://my.com/about/class  Topic:

Number Void MyMethod(Int32):
----Url: http;//my.com/about/method  Topic:

Number Boolean Equals(System.Object):

Number Int32 GetHashCode():

Number System.Type GetType():

Number System.String ToString():

Number Void .ctor():
*/