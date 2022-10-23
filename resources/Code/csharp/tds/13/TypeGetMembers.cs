using System;
using System.Reflection;

public class MyClass {
    public int intI;
    public void MyMeth() {
    }

    public static void Main() {
        Type t = typeof(MyClass);

        // 也可以使用：
        // MyClass t1 = new MyClass();
        // Type t = t1.GetType();

        MethodInfo[] x = t.GetMethods();
        foreach (MethodInfo xtemp in x) {
            Console.WriteLine(xtemp.ToString());
        }

        Console.WriteLine();

        MemberInfo[] x2 = t.GetMembers();
        foreach (MemberInfo xtemp2 in x2) {
            Console.WriteLine(xtemp2.ToString());
        }
    }
}
