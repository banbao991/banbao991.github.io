using System;
class T{
    public virtual void run() {
        Console.WriteLine("father: run()");
    }
    
    public static void Main() {
        T t = new T1();
        t.run(); // 输出: son: run()
    }
}

class T1 : T {
    public override void run() {
        Console.WriteLine("son: run()");
    }
}