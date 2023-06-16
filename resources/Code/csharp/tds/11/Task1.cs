using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Diagnostics;
class Task1 {
    static void Main(string[] args) {
        Task<double>[] tasks = {
            Task.Run( ()=>SomeFun() ),
            Task.Run( ()=>SomeFun() ),
        };
        Thread.Sleep(1);
        for(int i=0; i<tasks.Length; i++ ) {
            // 可以查看状态
            Console.WriteLine(tasks[i].Status);
            // 取Result时，会等到计算结束
            Console.WriteLine(tasks[i].Result);
        }
        // 也可以用这句，来等结束
        Task.WaitAll( tasks ); 
    }
    static void DoSometing() {}
    static double SomeFun() {
        Thread.Sleep(50);
        return 0;
    }
}