using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Windows.Forms;

namespace MethodDelegateLamda {

    public partial class Form1 : Form {

        public Form1() {
            InitializeComponent();
        }

        //示例1,使用线程
        private void button1_Click(object sender, EventArgs e) {
            //csharp 1.0
            //使用委托，使用已定义好的函数
            new Thread(new ThreadStart(MyFun)).Start();
            //csharp 2.0
            //省略委托：MyFun自动实例化为ThreadStart委托（
            new Thread(MyFun).Start();
            //匿名方法
            new Thread(new ThreadStart(delegate () { Console.Write("my function"); })).Start();
            //匿名方法，省略参数列表
            new Thread(new ThreadStart(delegate { Console.Write("my function"); })).Start();
            //匿名方法，自动转委托
            new Thread(delegate () { Console.Write("my function"); }).Start();
            //csharp 3.0
            //Lambda表达式
            new Thread(() => { Console.Write("my function"); }).Start();
        }

        private void MyFun() {
            Console.Write("my function");
        }

        //示例2,使用事件
        private void button3_Click(object sender, EventArgs e) {
            Example3();
        }

        private void Example3() {
            //csharp 1.0
            //使用委托，使用自定义函数
            this.MouseMove += new MouseEventHandler(Form1_MouseMove);
            //csharp 2.0
            //自动转委托
            this.MouseMove += Form1_MouseMove;
            Label lbl = this.label1; //这个变量下面使用了闭包（简单地说，使用外部的局部变量）
            this.MouseMove += new MouseEventHandler(delegate (object sender, MouseEventArgs e) { lbl.Text = e.X + "," + e.Y; });
            this.MouseMove += delegate (object sender, MouseEventArgs e) { lbl.Text = e.X + "," + e.Y; };
            //csharp 3.0
            //使用Lambda表达式
            this.MouseMove += (object sender, MouseEventArgs e) => { lbl.Text = e.X + "," + e.Y; };　//Lamda
            this.MouseMove += (sender, e) => { lbl.Text = e.X + "," + e.Y; }; //可以省略类型
        }

        private void Form1_MouseMove(object sender, MouseEventArgs e) {
            this.label1.Text = e.X + "," + e.Y;
        }

        //示例3, 数组排序
        private class Book {
            public string title;
            public double price;

            public Book(string title, double price) {
                this.title = title; this.price = price;
            }
        }

        private void button2_Click(object sender, EventArgs e) {
            Random rnd = new Random();
            Book[] books = new Book[10];
            for (int i = 0; i < books.Length; i++) books[i] = new Book("Book" + i, rnd.Next(100));
            //csharp 1.0
            Array.Sort(books, new MyComparer()); //用一个IComparer
            //csharp 2.0
            Array.Sort<Book>(books, new Comparison<Book>(delegate (Book book1, Book book2) { return (int)(book1.price - book2.price); })); //使用Comparison委托
            Array.Sort<Book>(books, delegate (Book book1, Book book2) { return (int)(book1.price - book2.price); });
            //csharp 3.0
            Array.Sort<Book>(books, (Book book1, Book book2) => (int)(book1.price - book2.price));
            Array.Sort<Book>(books, (book1, book2) => (int)(book1.price - book2.price)); //省略参数类型
            //使用Linq
            IOrderedEnumerable<Book> result = from book in books orderby book.price select book;
            var result2 = from book in books where book.price >= 0 orderby book.price select book.title;
            foreach (string s in result2) Console.Write(s);
            var result3 = books
                .Where<Book>(b => b.price >= 0)
                .OrderBy<Book, double>(b => b.price, Comparer<double>.Default)
                .Select<Book, Book>(book => book);
            foreach (Book b in result3) Console.Write(b.price + " ");
        }

        private class MyComparer : System.Collections.IComparer {

            public int Compare(object x1, object x2) {
                return (int)(((Book)x1).price - ((Book)x2).price);
            }
        }
    }
}