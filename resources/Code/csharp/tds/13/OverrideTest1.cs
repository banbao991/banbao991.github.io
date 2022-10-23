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
    public void run() {
        Console.WriteLine("son: run()");
    }
}
// 编译
// t.cs(14,17): warning CS0108:
// “T1.run()”隐藏继承的成员“T.run()”。
// 如果是有意隐藏，请使用关键字 new。