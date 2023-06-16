using System;
using System.Reflection;

class ClassA {
    public int i = 100;
    public void MA() {
        Console.WriteLine (" A.MA() is Called " );
    }
}

class ClassB : ClassA {
    public int j = 200;
    public void MB() {
        Console.WriteLine (" B.MB() is Called " );
    }
}

public class ReflectionTest {
    public static void Main() {
        const string fileName = ".\\ReflectionTest.exe";

        Assembly assembly = Assembly.LoadFrom(  fileName );
        Type [] types = assembly.GetTypes();
        foreach( Type type in types ) {
            Console.WriteLine( "---" + type.FullName  + ":" );

            MethodInfo [] methods = type.GetMethods();
            foreach( MethodInfo m in methods )
                Console.WriteLine( m.ToString() );
        }
    }
}
