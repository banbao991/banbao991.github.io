using System;
using System.Drawing;
using System.Collections;
using System.ComponentModel;
using System.Windows.Forms;
using System.Data;
using System.IO;
using System.Runtime.InteropServices;
namespace BmpFileReader {
/// <summary>
/// Form1 的摘要说明。
/// </summary>
public class Form1 : System.Windows.Forms.Form {
    private System.Windows.Forms.Button button1;
    private System.Windows.Forms.PictureBox pictureBox1;
    /// <summary>
    /// 必需的设计器变量。
    /// </summary>
    private System.ComponentModel.Container components = null;
    public Form1() {
        //
        // Windows 窗体设计器支持所必需的
        //
        InitializeComponent();
        //
        // TODO: 在 InitializeComponent 调用后添加任何构造函数代码
        //
    }
    /// <summary>
    /// 清理所有正在使用的资源。
    /// </summary>
    protected override void Dispose( bool disposing ) {
        if( disposing ) {
            if (components != null) {
                components.Dispose();
            }
        }
        base.Dispose( disposing );
    }
    #region Windows 窗体设计器生成的代码
    /// <summary>
    /// 设计器支持所需的方法 - 不要使用代码编辑器修改
    /// 此方法的内容。
    /// </summary>
    private void InitializeComponent() {
        this.button1 = new System.Windows.Forms.Button();
        this.pictureBox1 = new System.Windows.Forms.PictureBox();
        this.SuspendLayout();
        //
        // button1
        //
        this.button1.Location = new System.Drawing.Point(240, 16);
        this.button1.Name = "button1";
        this.button1.Size = new System.Drawing.Size(56, 24);
        this.button1.TabIndex = 0;
        this.button1.Text = "button1";
        this.button1.Click += new System.EventHandler(this.button1_Click);
        //
        // pictureBox1
        //
        this.pictureBox1.Location = new System.Drawing.Point(248, 184);
        this.pictureBox1.Name = "pictureBox1";
        this.pictureBox1.Size = new System.Drawing.Size(216, 200);
        this.pictureBox1.TabIndex = 1;
        this.pictureBox1.TabStop = false;
        //
        // Form1
        //
        this.AutoScaleBaseSize = new System.Drawing.Size(6, 14);
        this.ClientSize = new System.Drawing.Size(320, 273);
        this.Controls.Add(this.pictureBox1);
        this.Controls.Add(this.button1);
        this.Name = "Form1";
        this.Text = "Form1";
        this.Load += new System.EventHandler(this.Form1_Load);
        this.Paint += new System.Windows.Forms.PaintEventHandler(this.Form1_Paint);
        this.ResumeLayout(false);
    }
    #endregion
    /// <summary>
    /// 应用程序的主入口点。
    /// </summary>
    [STAThread]
    static void Main() {
        Application.Run(new Form1());
    }
    string fileName = ".\\t.bmp";
    Stream stream = null;
    private void button1_Click(object sender, System.EventArgs e) {
        ReadAndShowBitmap(this.CreateGraphics());
    }
    private void Form1_Load(object sender, System.EventArgs e) {
    }
    private void Form1_Paint(object sender, System.Windows.Forms.PaintEventArgs e) {
        //e.Graphics.DrawLine( new Pen(Color.Red,1), 50, 100, 50+1, 100+1);
        ReadAndShowBitmap( e.Graphics );
    }
    private void ReadAndShowBitmap(Graphics graph) {
        stream = new FileStream( fileName, FileMode.Open, FileAccess.Read );
        BITMAPFILEHEADER fileHeader = ReadFileHeader_UseBinaryReader(); //文件头
        //BITMAPFILEHEADER fileHeader = ReadFileHeader(); //文件头
        BITMAPINFOHEADER bmpInfo = ReadInfo(); //信息头
        if( bmpInfo.biBitCount != 24 ) {
            MessageBox.Show( "本程序只能处理24位位图" );
            stream.Close();
            return;
        }
        int w = bmpInfo.biWidth;
        int h = bmpInfo.biHeight;
        stream.Seek( fileHeader.bfOffBits, SeekOrigin.Begin );//略去一些字节，定位到图像数据处
        int LineSize = w * 3;
        if( LineSize%4 != 0 ) LineSize +=  4 - (LineSize % 4) ; //每个图像点占3个字节。若一行不是4的倍数,则补齐
        for( int i=1; i<=h; i++ ) { //各行
            for( int j=1; j<=w; j++ ) { //各点
                RGBTRIPLE point = ReadPixel();
                Color color = Color.FromArgb(point.rgbtRed, point.rgbtGreen, point.rgbtBlue);
                graph.DrawLine( new Pen(color,1), j, h - i, j, h - i+1);//注意图像的坐标上下是反的,另外，线的长度为1，才能画出点来
            }
            if( w * 3 % 4 != 0 ) { //每行不是4的倍数,略出空字节
                //stream.Seek( fileHeader.bfOffBits + LineSize * i, SeekOrigin.Begin );
                stream.Seek( 4- w * 3 % 4, SeekOrigin.Current );
            }
        }
        stream.Close();
    }
    private BITMAPFILEHEADER ReadFileHeader_UseBinaryReader( ) { //使用BinaryReader进行读
        BinaryReader br = new BinaryReader( stream );
        BITMAPFILEHEADER x = new BITMAPFILEHEADER();
        x.bfType = br.ReadInt16();
        x.bfSize = br.ReadInt32();
        x.bfReserved1 = br.ReadInt16();
        x.bfReserved2 = br.ReadInt16();
        x.bfOffBits = br.ReadInt32();
        return x;
    }
    private BITMAPFILEHEADER ReadFileHeader( ) { //直接读到内存数组中
        BITMAPFILEHEADER x = new BITMAPFILEHEADER();
        int c = Marshal.SizeOf( x );
        byte [] buffer  = new byte[c];
        stream.Read( buffer,0, c );
        unsafe {
            fixed( byte * p = buffer  ) {
                x = *((BITMAPFILEHEADER *)p);
            }
        }
        return x;
    }
    private BITMAPINFOHEADER ReadInfo( ) {
        BITMAPINFOHEADER x = new BITMAPINFOHEADER();
        int c = Marshal.SizeOf( x );
        byte [] buffer  = new byte[c];
        stream.Read( buffer,0, c );
        unsafe {
            fixed( byte * p = buffer  ) {
                x = *((BITMAPINFOHEADER *)p);
            }
        }
        return x;
    }
    private RGBTRIPLE ReadPixel( ) {
        RGBTRIPLE x = new RGBTRIPLE();
        int c = Marshal.SizeOf( x );
        byte [] buffer  = new byte[c];
        stream.Read( buffer,0, c );
        unsafe {
            fixed( byte * p = buffer  ) {
                x = *((RGBTRIPLE *)p);
            }
        }
        return x;
    }
    [StructLayout(LayoutKind.Sequential, Pack=1)]
    public struct BITMAPFILEHEADER {
        public short bfType;
        public int bfSize;
        public short bfReserved1;
        public short bfReserved2;
        public int bfOffBits;
    }
    [StructLayout(LayoutKind.Sequential, Pack=1)]
    public struct BITMAPINFOHEADER {
        public int biSize;
        public int biWidth;
        public int biHeight;
        public short biPlanes;
        public short biBitCount;
        public int biCompression;
        public int biSizeImage;
        public int biXPelsPerMeter;
        public int biYPelsPerMeter;
        public int biClrUsed;
        public int biClrImportant;
    }
    [StructLayout(LayoutKind.Sequential, Pack=1)]
    public struct RGBTRIPLE {
        public byte rgbtBlue;
        public byte rgbtGreen;
        public byte rgbtRed;
    }
}
}