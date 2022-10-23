/*
 * 编译命令
 * csc -out:FontFamily.exe FontFamily.cs Form1.Designer.cs Program.cs
*/
using System;
using System.Drawing;
using System.Windows.Forms;

namespace Test {

    public partial class Form1 : Form {

        public Form1() {
            InitializeComponent();
        }

        private int L = 0, R = 9;

        private void panel1_Paint(object sender, PaintEventArgs e) {
            int cnt = -1;
            Graphics g = e.Graphics;
            FontFamily[] families = FontFamily.GetFamilies(g);
            Font font;
            string familyString;
            float spacing = 0;
            foreach (FontFamily family in families) {
                ++cnt;
                if (cnt < L) { continue; }
                if (cnt > R) { L = (L + 10) % families.Length; R = (R + 10) % families.Length; break; }
                try {
                    font = new Font(family, 16, FontStyle.Bold);
                    familyString = "This is the " + family.Name + "family.";
                    g.DrawString(
                        familyString,
                        font,
                        Brushes.Black,
                        new PointF(0, spacing));
                    spacing += font.Height + 5;
                } catch {
                }
            }
        }

        private void panel1_Click(object sender, EventArgs e) {
            this.panel1.Invalidate();
        }
    }
}