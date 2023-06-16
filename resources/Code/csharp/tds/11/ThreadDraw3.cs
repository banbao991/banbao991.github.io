using System;
using System.Drawing;
using System.Collections.Generic;
using System.ComponentModel;
using System.Windows.Forms;
using System.Data;
using System.Drawing.Drawing2D;
using System.Threading;

namespace TestWin {
/// <summary>
/// Form1 的摘要说明。
/// </summary>
public class Form1 : System.Windows.Forms.Form {
    private System.ComponentModel.IContainer components;

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

    #region Windows Form Designer generated code
    /// <summary>
    /// 设计器支持所需的方法 - 不要使用代码编辑器修改
    /// 此方法的内容。
    /// </summary>
    private void InitializeComponent() {
        this.pictureBox1 = new System.Windows.Forms.PictureBox();
        this.panel1 = new System.Windows.Forms.Panel();
        this.button1 = new System.Windows.Forms.Button();
        this.button2 = new System.Windows.Forms.Button();
        this.button3 = new System.Windows.Forms.Button();
        this.panel1.SuspendLayout();
        this.SuspendLayout();
        //
        // pictureBox1
        //
        this.pictureBox1.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
        this.pictureBox1.Dock = System.Windows.Forms.DockStyle.Fill;
        this.pictureBox1.Name = "pictureBox1";
        this.pictureBox1.Size = new System.Drawing.Size(344, 261);
        this.pictureBox1.TabIndex = 0;
        this.pictureBox1.TabStop = false;
        //
        // panel1
        //
        this.panel1.Controls.AddRange(new System.Windows.Forms.Control[] {
            this.button3,
            this.button2,
            this.button1
        });
        this.panel1.Dock = System.Windows.Forms.DockStyle.Bottom;
        this.panel1.Location = new System.Drawing.Point(0, 229);
        this.panel1.Name = "panel1";
        this.panel1.Size = new System.Drawing.Size(344, 32);
        this.panel1.TabIndex = 1;
        //
        // button1
        //
        this.button1.Location = new System.Drawing.Point(32, 8);
        this.button1.Name = "button1";
        this.button1.TabIndex = 0;
        this.button1.Text = "Add";
        this.button1.Click += new System.EventHandler(this.button1_Click);
        //
        // button2
        //
        this.button2.Anchor = (((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
                                | System.Windows.Forms.AnchorStyles.Left)
                               | System.Windows.Forms.AnchorStyles.Right);
        this.button2.Location = new System.Drawing.Point(144, 8);
        this.button2.Name = "button2";
        this.button2.Size = new System.Drawing.Size(67, 23);
        this.button2.TabIndex = 1;
        this.button2.Text = "Remove";
        this.button2.Click += new System.EventHandler(this.button2_Click);
        //
        // button3
        //
        this.button3.Anchor = (System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right);
        this.button3.Location = new System.Drawing.Point(240, 8);
        this.button3.Name = "button3";
        this.button3.TabIndex = 2;
        this.button3.Text = "Resume";
        this.button3.Click += new System.EventHandler(this.button3_Click);

        //
        // Form1
        //
        this.AutoScaleBaseSize = new System.Drawing.Size(6, 14);
        this.ClientSize = new System.Drawing.Size(344, 261);
        this.Controls.AddRange(new System.Windows.Forms.Control[] {
            this.panel1,
            this.pictureBox1
        });
        this.Name = "Form1";
        this.Text = "Moving Shapes";
        this.Load += new System.EventHandler(this.Form1_Load);
        this.panel1.ResumeLayout(false);
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

    private System.Windows.Forms.PictureBox pictureBox1;
    private System.Windows.Forms.Panel panel1;
    private System.Windows.Forms.Button button1;
    private System.Windows.Forms.Button button2;
    private System.Windows.Forms.Button button3;

    private List<MovingShape> shapes = new List<MovingShape>();
    private List<Thread> threads = new List<Thread>();

    void AddMovingObject() {
        MovingShape obj = new MovingShape(this.pictureBox1);
        Thread thread = new Thread(obj.Run);
        thread.IsBackground = true;
        thread.Start();
        threads.Add(thread);
        shapes.Add(obj);
    }
    void RemoveMovingObject() {
        if (threads.Count == 0) return;
        shapes[0].Stop();
        threads[0].Abort();
        shapes.RemoveAt(0);
        threads.RemoveAt(0);
    }

    private void Form1_Load(object sender, System.EventArgs e) {
        this.Show();
        AddMovingObject();
    }

    private void button1_Click(object sender, System.EventArgs e) {
        AddMovingObject();
    }

    private void button2_Click(object sender, System.EventArgs e) {
        RemoveMovingObject();
    }

    private void button3_Click(object sender, System.EventArgs e) {
        foreach( MovingShape shape in shapes ) {
            shape.PauseResume();
        }
    }
}

public class MovingShape {
    bool bContinue = false;
    bool bPaused = false;
    private int size = 60;
    private int speed = 10;
    private Color color;
    private Brush brush;
    private Pen pen;
    private int type;
    private int x, y, w, h, dx, dy;
    protected Control app;
    Random rnd = new Random();

    public MovingShape(Control app) {
        this.app = app;
        x = rnd.Next(app.Width);
        y = rnd.Next(app.Height);
        w = rnd.Next(10,size)+10;
        h = rnd.Next(10,size)+10;
        dx = rnd.Next(5,speed);
        dy = rnd.Next(5,speed);
        color = Color.FromArgb(
                    rnd.Next(128, 256),
                    rnd.Next(128, 256),
                    rnd.Next(128, 256));
        brush = new SolidBrush(color);
        pen = new Pen(new SolidBrush(Color.Black), 1);
        type = rnd.Next(3);
        bContinue = true;
    }

    public void Run() {
        while (bContinue) {
            if( ! bPaused ) {
                app.BeginInvoke( new Action( ()=> { //改成BeginInvoke
                    x += dx;
                    y += dy;
                    if (x < 0 || x + w > app.Width) dx = -dx;
                    if (y < 0 || y + h > app.Height) dy = -dy;
                    Graphics g = app.CreateGraphics();

                    switch (type) {
                    case 0:
                        g.FillRectangle(brush, x, y, w, h);
                        g.DrawRectangle(pen, x, y, w, h);
                        break;
                    case 1:
                        g.FillEllipse(brush, x, y, w, h);
                        g.DrawEllipse(pen, x, y, w, h);
                        break;
                    case 2:
                        g.FillPie(brush, x, y, w, h, 0.1F, 0.9F);
                        g.DrawArc(pen, x, y, w, h, 0.1F, 0.9F);
                        break;
                    }
                }));
            }
            Thread.Sleep(130);
        }
    }
    public void Stop() {
        bContinue = false;
    }
    public void PauseResume() {
        bPaused = ! bPaused;
    }
}
}
