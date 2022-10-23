using System;
class T{
    public void run() {
        Console.WriteLine("father: run()");
    }
    
    public static void Main() {
        T t = new T1();
        t.run(); // 输出: father: run()
    }
}

class T1 : T {
    new public void run() {
        Console.WriteLine("son: run()");
    }
}