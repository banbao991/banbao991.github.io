using System;
using System.Drawing;
using System.Collections;
using System.ComponentModel;
using System.Windows.Forms;
using System.Data;

public class Form1 : Form {
    public Form1() {
        this.AutoScaleBaseSize = new Size(6, 14);
        this.ClientSize = new Size(400, 400);
        this.Paint += new PaintEventHandler(this.Form1_Paint);
        this.Click += new EventHandler(this.Redraw);
    }
    static void Main() {
        Application.Run(new Form1());
    }
    private void Form1_Paint(object sender, PaintEventArgs e) {
        graphics = e.Graphics;
        drawTree(10, 200, 380, 100, -PI / 2);
    }
    private void Redraw(object sender, EventArgs e) {
        this.Invalidate();
    }

    private Graphics graphics;
    const double PI = Math.PI;
    double th1 = 35 * Math.PI / 180;
    double th2 = 25 * Math.PI / 180;
    double per1 = 0.6;
    double per2 = 0.7;

    Random rnd = new Random();
    double rand() {
        return rnd.NextDouble();
    }

    void drawTree(int n, double x0, double y0, double leng, double th) {
        if (n == 0) {
            return;
        }

        double x1 = x0 + leng * Math.Cos(th);
        double y1 = y0 + leng * Math.Sin(th);

        drawLine(x0, y0, x1, y1);

        drawTree(n - 1, x1, y1, per1 * leng * (0.5 + rand()), th + th1 * (0.5 + rand()));
        drawTree(n - 1, x1, y1, per2 * leng * (0.4 + rand()), th - th2 * (0.5 + rand()));
        if (rand() > 0.6)
            drawTree(n - 1, x1, y1, per2 * leng * (0.4 + rand()), th - th2 * (0.5 + rand()));
    }
    void drawLine(double x0, double y0, double x1, double y1) {
        graphics.DrawLine(
            Pens.Blue,
            (int)x0, (int)y0, (int)x1, (int)y1
        );
    }
}