/*
 * 编译命令
 * csc -out:Brush.exe Brush.cs Form1.Designer.cs Program.cs
*/

using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace Test {

    public partial class Form1 : Form {

        public Form1() {
            InitializeComponent();
        }

        private int L = 0, R = 9;

        private void panel1_Paint(object sender, PaintEventArgs e) {
            Graphics g = e.Graphics;
            Point point = new Point(10, 10);
            Rectangle rect = new Rectangle(10, 10, 20, 150);
            Point off = new Point(30, 0);
            Brush brush;
            brush = Brushes.Azure;
            rect.Offset(off); g.FillRectangle(brush, rect);
            brush = SystemBrushes.Desktop;
            rect.Offset(off); g.FillRectangle(brush, rect);
            brush = new SolidBrush(Color.FromArgb(100, 255, 0, 0));
            rect.Offset(off); g.FillRectangle(brush, rect);
            Image bm = Bitmap.FromFile("Pen.ico");
            brush = new TextureBrush(bm);
            rect.Offset(off); g.FillRectangle(brush, rect);
            brush = new HatchBrush(
                HatchStyle.Vertical,
                Color.ForestGreen,
                Color.Honeydew);
            rect.Offset(off); g.FillRectangle(brush, rect);
            brush = new LinearGradientBrush(
                new PointF(50, 50), new PointF(200, 200),
                Color.Red, Color.Yellow);
            rect.Offset(off); g.FillRectangle(brush, rect);
        }

        private void panel1_Click(object sender, EventArgs e) {
            this.panel1.Invalidate();
        }
    }
}