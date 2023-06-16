using System;
using System.Drawing;
using System.Collections;
using System.ComponentModel;
using System.Windows.Forms;
using System.Data;

public class Form1 : Form {
    public Form1() {
        this.AutoScaleBaseSize = new Size(6, 14);
        this.ClientSize = new Size(600, 400);
        this.Paint += new PaintEventHandler(this.Form1_Paint);
    }
    static void Main() {
        Application.Run(new Form1());
    }
    private void Form1_Paint(object sender, PaintEventArgs e) {
        graphics = e.Graphics;
        drawTree(10, 200, 310, 100, -PI / 2);
    }

    private Graphics graphics;
    const double PI = Math.PI;
    double th1 = 40 * Math.PI / 180;
    double th2 = 30 * Math.PI / 180;
    double per1 = 0.6;
    double per2 = 0.7;

    void drawTree(int n, double x0, double y0, double leng, double th) {
        if (n == 0) {
            return;
        }

        double x1 = x0 + leng * Math.Cos(th);
        double y1 = y0 + leng * Math.Sin(th);

        drawLine(x0, y0, x1, y1, n / 2);

        drawTree(n - 1, x1, y1, per1 * leng, th + th1);
        drawTree(n - 1, x1, y1, per2 * leng, th - th2);
    }
    void drawLine(double x0, double y0, double x1, double y1, int width) {
        graphics.DrawLine(
            new Pen(Color.Blue, width),
            (int)x0, (int)y0, (int)x1, (int)y1
        );
    }
}