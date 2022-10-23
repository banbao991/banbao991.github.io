using System;

namespace ConsoleDemo1 {

    internal delegate double Fun(double x);

    public class DelegateIntegral {

        public static void Main() {
            Func<double, double> fun = new Func<double, double>(Math.Sin);
            double d = Integral(fun, 0, Math.PI / 2, 1e-4);
            Console.WriteLine(d);

            Func<double, double> fun2 = new Func<double, double>(Linear);
            double d2 = Integral(fun2, 0, 2, 1e-3);
            Console.WriteLine(d2);

            Rnd rnd = new Rnd();
            double d3 = Integral(new Func<double, double>(rnd.Num), 0, 1, 0.01);
            Console.WriteLine(d3);
        }

        private static double Linear(double a) {
            return a * 2 + 1;
        }

        private class Rnd {
            private Random r = new Random();

            public double Num(double x) {
                return r.NextDouble();
            }
        }

        // 积分计算
        private static double Integral(Func<double, double> f, double a, double b, double eps) {
            int n, k;
            double fa, fb, h, t1, p, s, x, t = 0;

            fa = f(a);
            fb = f(b);

            // 迭代初值
            n = 1;
            h = b - a;
            t1 = h * (fa + fb) / 2.0;
            p = double.MaxValue;

            // 迭代计算
            while (p >= eps) {
                s = 0.0;
                for (k = 0; k <= n - 1; k++) {
                    x = a + (k + 0.5) * h;
                    s = s + f(x);
                }
                t = (t1 + h * s) / 2.0;
                p = Math.Abs(t1 - t);
                t1 = t;
                n = n + n;
                h = h / 2.0;
            }
            return t;
        }
    }
}