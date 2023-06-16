using System;
class A {
    public A() {
        Console.WriteLine( "in A() "  );
        PrintFields();
    }
    public virtual void PrintFields() {
        Console.WriteLine( "in A.PrintFields() "  );
    }
}
class B: A {
    int x = 1;
    int y;
    public B()  : this( 0 ) {
        Console.WriteLine( "in B()" );
        y = -1;
    }
    public B( int i ) {
        Console.WriteLine( "in B( " + i + ")" );
    }
    public override void PrintFields() {
        Console.WriteLine( "in B.PrintFields() "  );
        Console.WriteLine("x = {0}, y = {1}", x, y);
    }
}
class T {
    static void Main() {
        B b = new B();
    }
}

/*
in A() 
in B.PrintFields() 
x = 1, y = 0
in B( 0)
in B()
*/