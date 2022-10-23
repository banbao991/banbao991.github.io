using System;
using System.Drawing;
using System.Drawing.Drawing2D;
// 生成缩略图
class ThumbnailTest {
    static void Main(string[] args) {
        if(args.Length == 1) {
            string file = args[0];
            Bitmap bitmap = new Bitmap(file);
            Bitmap thum = CreateThumbnail(bitmap, 100, 100);
            thum.Save("small_" + file);
        } else {
            Console.WriteLine("ThumbnailTest.exe inputFile");
        }
    }
    public static Bitmap CreateThumbnail(Bitmap originalBmp, int desiredWidth, int desiredHeight) {
        // If the image is smaller than a thumbnail just return it
        if (originalBmp.Width <= desiredWidth && originalBmp.Height <= desiredHeight) {
            return originalBmp;
        }
        int newWidth, newHeight;
        // scale down the smaller dimension
        // 保持长宽比不变
        if (desiredWidth * originalBmp.Height < desiredHeight * originalBmp.Width) {
            newWidth = desiredWidth;
            newHeight = (int)Math.Round((decimal)originalBmp.Height * desiredWidth / originalBmp.Width);
        } else {
            newHeight = desiredHeight;
            newWidth = (int)Math.Round((decimal)originalBmp.Width * desiredHeight / originalBmp.Height);
        }
        // This code creates cleaner (though bigger) thumbnails and properly
        // and handles GIF files better by generating a white background for
        // transparent images (as opposed to black)
        // This is preferred to calling Bitmap.GetThumbnailImage()
        Bitmap bmpOut = new Bitmap(newWidth, newHeight);
        using (Graphics graphics = Graphics.FromImage(bmpOut)) {
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.FillRectangle(Brushes.White, 0, 0, newWidth, newHeight);
            graphics.DrawImage(originalBmp, 0, 0, newWidth, newHeight);
        }
        return bmpOut;
    }
}