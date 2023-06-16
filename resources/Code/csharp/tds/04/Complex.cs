public struct Complex {
    public double real;

    public double imaginary;

    public Complex(double real, double imaginary) {
        this.real = real;

        this.imaginary = imaginary;
    }

    public static Complex operator +(Complex c1) {
        return c1;
    }

    public static Complex operator -(Complex c1) {
        return new Complex(-c1.real, -c1.imaginary);
    }

    public static bool operator true(Complex c1) {
        return c1.real != 0 || c1.imaginary != 0;
    }

    public static bool operator false(Complex c1) {
        return c1.real == 0 && c1.imaginary == 0;
    }

    public static Complex operator +(Complex c1, Complex c2) {
        return new Complex(c1.real + c2.real, c1.imaginary + c2.imaginary);
    }

    public static Complex operator -(Complex c1, Complex c2) {
        return c1 + (-c2);
    }

    public static Complex operator *(Complex c1, Complex c2) {
        return new Complex(c1.real * c2.real - c1.imaginary * c2.imaginary,

            c1.real * c2.imaginary + c1.imaginary * c2.real);
    }

    public static Complex operator *(Complex c, double k) {
        return new Complex(c.real * k, c.imaginary * k);
    }

    public static Complex operator *(double k, Complex c) {
        return c * k;
    }

    public override string ToString() {
        return (System.String.Format("({0} + {1} i)", real, imaginary));
    }

    public static void Main() {
        Complex num1 = new Complex(2, 3);
        Complex num2 = new Complex(3, 4);

        Complex result = num1 ? -num1 * 5 + num1 * num2 : new Complex(0, 0);

        System.Console.WriteLine("First complex number:  {0}", num1);
        System.Console.WriteLine("Second complex number: {0}", num2);
        System.Console.WriteLine("The result is: {0}", result);
    }
}