using System;
using System.Collections.Generic;
using System.Linq;

namespace ConsoleApp1 {
    internal class Program {
        private static int Seq = 0;
        private static Random rdm = new Random();

        public string Name {
            set; get;
        }

        public int RunTime {
            set; get;
        }

        private Program() {
            ++Seq;
            Name = "Program_" + Seq;
            RunTime = rdm.Next(100);
        }

        private static void Main(string[] args) {
            List<Program> programs = new List<Program>();
            for (int i = 0; i < 10; ++i) {
                programs.Add(new Program());
            }
            
            // Linq
            var a = from p in programs
                    where p.RunTime < 50
                    orderby p.Name
                    select p.Name;
            foreach (var i in a) {
                Console.WriteLine(i);
            }

            Console.WriteLine("\n");

            // Lambda 表达式
            var b = programs
                .Where(p => p.RunTime < 50)
                .OrderBy(p => p.Name)
                .Select(p => p.Name);
            foreach (var i in a) {
                Console.WriteLine(i);
            }
        }
    }
}