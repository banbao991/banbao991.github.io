// 编译时需要: /unsafe
using System;
class Test {
    static unsafe void Copy(byte[] src, byte[] dst, int count) {
        int srcLen = src.Length;
        int dstLen = dst.Length;
        if (srcLen < count || dstLen < count) {
            throw new ArgumentException();
        }
        fixed (byte* pSrc = src, pDst = dst) {
            byte* ps = pSrc;
            byte* pd = pDst;
            for (int n = 0; n < count; n++) {
                *pd++ = *ps++;
            }
        }
    }
    static void Main() {
        byte[] a = new byte[100];
        byte[] b = new byte[100];
        for (int i = 0; i < 100; ++i)
            a[i] = (byte)i;
        Copy(a, b, 100);
        Console.WriteLine("The first 10 elements are:");
        for (int i = 0; i < 10; ++i)
            Console.Write(b[i] + "{0}", i < 9 ? " " : "");
        Console.WriteLine("\n");
    }
}