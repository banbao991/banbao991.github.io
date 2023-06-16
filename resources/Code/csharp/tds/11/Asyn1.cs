using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
/// <summary>
/// 异步调用方法总结：
/// 1.BeginEnvoke EndEnvoke
/// 当使用BeginInvoke异步调用方法时，如果方法未执行完，EndInvoke方法就会一直阻塞，直到被调用的方法执行完毕
/// </summary>
class Async1 {
    public delegate int FooDelegate(string s);
    static void Main(string[] args) {
        Console.WriteLine("主线程"+Thread.CurrentThread.ManagedThreadId);
        FooDelegate fooDelegate = Foo;
        IAsyncResult result= fooDelegate.BeginInvoke("Hello World.", null, null);
        Console.WriteLine("主线程继续执行...");
        //当使用BeginInvoke异步调用方法时，如果方法未执行完，EndInvoke方法就会一直阻塞，直到被调用的方法执行完毕
        int n = fooDelegate.EndInvoke(result);
        Console.WriteLine("回到主线程"+Thread.CurrentThread.ManagedThreadId);
        Console.WriteLine("结果是"+n);
        Console.Read();
    }
    public static int Foo(string s) {
        Console.WriteLine("函数所在线程"+Thread.CurrentThread.ManagedThreadId);
        Console.WriteLine("异步线程开始执行："+s);
        Thread.Sleep(1000);
        return s.Length;
    }
}