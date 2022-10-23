/*
 * 编译命令
 * csc -out:Font.exe Font.cs Form1.Designer.cs Program.cs
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

        // 宽度调整得和文字差不多大, 才能够看到渐变效果
        private void panel1_Paint(object sender, PaintEventArgs e) {
            GraphicsPath gp = new GraphicsPath(FillMode.Winding);
            gp.AddString(
                "字体轮廓",
                new FontFamily("方正舒体"),
                (int)FontStyle.Regular,
                80,
                new PointF(10, 20),
                new StringFormat());
            Brush brush = new LinearGradientBrush(
                    new PointF(0, 0), new PointF(Width, Height),
                    Color.Red, Color.Yellow);
            e.Graphics.DrawPath(Pens.Black, gp);
            e.Graphics.FillPath(brush, gp);
        }

        private void panel1_Click(object sender, EventArgs e) {
            this.panel1.Invalidate();
        }
    }
}