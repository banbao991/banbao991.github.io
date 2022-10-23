using System;
class T{
    public virtual void run() {
        Console.WriteLine("father: run()");
    }

    public virtual void run(int i) {
        Console.WriteLine("father: run(int)");
    }

    public static void Main() {
        T t = new T1();
        t.run(1); // 输出: son: run()
    }
}

class T1 : T {
    public override void run() {
        Console.WriteLine("son: run()");
    }
}
// 编译
// t.cs(14,17): warning CS0108:
// “T1.run()”隐藏继承的成员“T.run()”。
// 如果是有意隐藏，请使用关键字 new。