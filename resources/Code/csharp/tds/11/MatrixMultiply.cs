using System;
using System.Threading;
using System.Threading.Tasks;
using System.Diagnostics;
class T {
    static void Main(string[] args) {
        int m = 100, n=400, t=1000;
        double[,] ma = new double[m,n];
        double[,] mb = new double[n,t];
        double[,] r1 = new double[m,t];
        double[,] r2 = new double[m,t];
        InitMatrix(ma);
        InitMatrix(mb);
        InitMatrix(r1);
        InitMatrix(r2);
        Console.WriteLine("矩阵乘法");
        Stopwatch sw = new Stopwatch();
        sw.Start();
        MultiMatrixNormal(ma, mb, r1 );
        sw.Stop();
        Console.WriteLine("普通方法用时"+sw.ElapsedMilliseconds);
        sw.Restart();
        MultiMatrixParallel(ma, mb, r2 );
        sw.Stop();
        Console.WriteLine("并行方法用时"+sw.ElapsedMilliseconds);
        bool ok = CompareMatrix(r1, r2);
        Console.WriteLine("结果相同"+ok);
    }
    static Random rnd = new Random();
    static void InitMatrix(double[,] matA) {
        int m = matA.GetLength(0);
        int n = matA.GetLength(1);
        for(int i=0; i<m; i++) {
            for( int j=0; j<n; j++ ) {
                matA[i,j] = rnd.Next();
            }
        }
    }
    static void MultiMatrixNormal( double [,] matA,  double [,] matB,  double [,] result) {
        int m = matA.GetLength(0);
        int n = matA.GetLength(1);
        int t = matB.GetLength(1);
        //Console.WriteLine(m+","+n+","+t);
        for(int i=0; i<m; i++) {
            for( int j=0; j<t; j++) {
                double temp = 0;
                for( int k=0; k<n; k++ ) {
                    temp += matA[i,k] * matB[k,j];
                }
                result[i,j] = temp;
            }
        }
    }
    static void MultiMatrixParallel( double [,] matA,  double [,] matB,  double [,] result) {
        int m = matA.GetLength(0);
        int n = matA.GetLength(1);
        int t = matB.GetLength(1);
        Parallel.For(0, m, i => {
            for( int j=0; j<t; j++) {
                double temp = 0;
                for( int k=0; k<n; k++ ) {
                    temp += matA[i,k] * matB[k,j];
                }
                result[i,j] = temp;
            }
        });
    }
    static bool CompareMatrix( double [,] matA,  double [,] matB) {
        int m = matA.GetLength(0);
        int n = matA.GetLength(1);
        for(int i=0; i<m; i++) {
            for( int j=0; j<n; j++) {
                if(Math.Abs(matA[i,j]-matB[i,j])>0.1 ) return false;
            }
        }
        return true;
    }
}
