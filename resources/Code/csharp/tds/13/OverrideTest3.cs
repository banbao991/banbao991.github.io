using System;
class T{
    public void run() {
        Console.WriteLine("father: run()");
    }

    public void run(int i) {
        Console.WriteLine("father: run(int)");
    }

    public static void Main() {
        T t = new T1();
        t.run(1); // 输出: father: run(int)
    }
}

class T1 : T {
    new public void run() {
        Console.WriteLine("son: run()");
    }
}