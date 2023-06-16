using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
/// <summary>
/// 异步调用方法总结：
/// 回调
/// 异步线程在工作结束后会主动调用我们提供的回调方法，并在回调方法中做相应的处理，例如显示异步调用的结果。
/// </summary>
class Program {
    public delegate void FooDelegate(string s);
    static void Main(string[] args) {
        Console.WriteLine("主线程."+Thread.CurrentThread.ManagedThreadId);
        FooDelegate fooDelegate = Foo;
        fooDelegate.BeginInvoke("Hello world.",
                                FooComepleteCallback, fooDelegate);
        Console.WriteLine("主线程继续执行..."+Thread.CurrentThread.ManagedThreadId);
        Console.WriteLine("Press any key to continue...");
        Console.Read();
    }
    public static void Foo(string s) {
        Console.WriteLine("函数当前线程："+Thread.CurrentThread.ManagedThreadId);
        Console.WriteLine(s);
        Thread.Sleep(1000);
    }
    //回调方法要求
    //1.返回类型为void
    //2.只有一个参数 IAsyncResult
    public static void FooComepleteCallback(IAsyncResult result) {
        Console.WriteLine("回调函数所在线程："+Thread.CurrentThread.ManagedThreadId);
        (result.AsyncState as FooDelegate).EndInvoke(result);
        Console.WriteLine("回调函数线程结束." + result.AsyncState.ToString());
    }
}