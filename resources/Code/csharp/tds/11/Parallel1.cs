using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Diagnostics;
class T {
    static void Main(string[] args) {
        List<double> list = new List<double>();
        for(int i=0; i<100; i++) list.Add(i*i);
        ParallelLoopResult loopResult = Parallel.ForEach(
        list, (double x, ParallelLoopState state) => {
            if (x == 400)state.Break();
            Console.WriteLine("x={0},thread id={1}",
                              x, Thread.CurrentThread.ManagedThreadId);
        });
        Console.WriteLine("IsCompleted: {0}",
                          loopResult.IsCompleted);
        Console.WriteLine("BreakValue: {0}",
                          loopResult.LowestBreakIteration.HasValue);
        Console.Read();
    }
}
