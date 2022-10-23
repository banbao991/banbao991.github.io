/*
 * 编译命令
 * csc -out:Test1.exe Test1.cs Form1.Designer.cs Program.cs
*/

using System;
using System.Drawing;
using System.Windows.Forms;

namespace Test {

    public partial class Form1 : Form {

        public Form1() {
            InitializeComponent();
        }

        private void panel1_Paint(object sender, PaintEventArgs e) {
            Graphics g = e.Graphics;
            g.FillRectangle(Brushes.White, 0, 0, Width, Height);
            float x = g.VisibleClipBounds.Width;
            float y = g.VisibleClipBounds.Height;
            PointF[] pts = {
                new PointF(0,0), new PointF(x/2,0),
                new PointF(x/2,y/2), new PointF(0,y/2)
            };
            Pen pen = new Pen(Color.Blue, 1.0F);
            g.ScaleTransform(0.8F, 0.8F);
            g.TranslateTransform(x / 2 + 20, y / 2 + 20);
            for (int i = 0; i < 36; i++) {
                g.DrawBeziers(pen, pts);
                g.DrawRectangle(pen, -x / 12, -y / 12, x / 6, y / 6);
                g.DrawEllipse(pen, -x / 4, -y / 3, x / 2, y * 2 / 3);
                g.RotateTransform(10);
            }
        }

        private void panel1_Click(object sender, EventArgs e) {
            this.panel1.Invalidate();
        }
    }
}