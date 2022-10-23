using System;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Imaging;

public unsafe class UnsafeBitmap {
    Bitmap bitmap;
    int stride;
    BitmapData bitmapData = null;
    Byte* pBase = null;
    public UnsafeBitmap(Bitmap bitmap) {
        this.bitmap = new Bitmap(bitmap);
    }
    public UnsafeBitmap(int width, int height) {
        this.bitmap = new Bitmap(width, height, PixelFormat.Format24bppRgb);
    }
    public void Dispose() {
        bitmap.Dispose();
    }
    public Bitmap Bitmap {
        get {
            return (bitmap);
        }
    }
    public struct PixelData {
        public byte blue;
        public byte green;
        public byte red;
    }
    private Point PixelSize {
        get {
            GraphicsUnit unit = GraphicsUnit.Pixel;
            RectangleF bounds = bitmap.GetBounds(ref unit);
            return new Point((int)bounds.Width, (int)bounds.Height);
        }
    }
    public void LockBitmap() {
        GraphicsUnit unit = GraphicsUnit.Pixel;
        RectangleF boundsF = bitmap.GetBounds(ref unit);
        Rectangle bounds = new Rectangle((int)boundsF.X,
                                         (int)boundsF.Y,
                                         (int)boundsF.Width,
                                         (int)boundsF.Height);
        bitmapData = bitmap.LockBits(bounds, ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
        pBase = (Byte*)bitmapData.Scan0.ToPointer();
        stride = bitmapData.Stride;
        //stride = (int)boundsF.Width * sizeof(PixelData);
        //if (stride % 4 != 0) {
        //    stride = 4 * (stride / 4 + 1);
        //}
    }
    public PixelData GetPixel(int x, int y) {
        PixelData returnValue = *PixelAt(x, y);
        return returnValue;
    }
    public void SetPixel(int x, int y, PixelData colour) {
        PixelData* pixel = PixelAt(x, y);
        *pixel = colour;
    }
    public void UnlockBitmap() {
        bitmap.UnlockBits(bitmapData);
        bitmapData = null;
        pBase = null;
    }
    public PixelData* PixelAt(int x, int y) {
        return (PixelData*)(pBase + y * stride + x * sizeof(PixelData));
    }
}

// 测试两种方式图像处理花费的时间
public class Test {
    static void Main(string[] args) {
        if(args.Length != 1) {
            Console.WriteLine("UnsafeBitmap.exe inputIMG");
            return;
        }
        Bitmap bitmap = new Bitmap(args[0]);
        UnsafeBitmap bitmap2 = new UnsafeBitmap( bitmap );
        System.Diagnostics.Stopwatch sw = new System.Diagnostics.Stopwatch();
        sw.Start();
        for( int i=0; i<bitmap.Width; i++) {
            for( int j=0; j<bitmap.Height; j++ ) {
                Color c = bitmap.GetPixel( i,j );
            }
        }
        sw.Stop();
        Console.WriteLine( sw.ElapsedTicks );
        sw.Reset();
        sw.Start();
        bitmap2.LockBitmap();
        for( int i=0; i<bitmap.Width; i++) {
            for( int j=0; j<bitmap.Height; j++ ) {
                UnsafeBitmap.PixelData c = bitmap2.GetPixel( i,j );
            }
        }
        bitmap2.UnlockBitmap();
        sw.Stop();
        Console.WriteLine( sw.ElapsedTicks );
    }
}