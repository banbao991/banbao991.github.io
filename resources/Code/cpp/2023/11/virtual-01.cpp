#include <iostream>

#define SEG \
    { std::cout << std::endl; }
#define OUTPUT \
    { std::cout << "function: " << __FUNCTION__ << std::endl; }
#define SIZE(a) \
    { std::cout << "sizeof(" #a ") = " << sizeof(a) << std::endl; }

class A {
public:
    virtual void a_v() { OUTPUT; }
    virtual void b_v() { OUTPUT; }

    void a_n() { OUTPUT; }
    void b_n() { OUTPUT; }

    virtual void c_v() {
        a_v();          // 多态
        (*this).a_v();  // 多态
        this->a_v();    // 多态

        // 注意这里调用的是基类的函数
        (*this).a_n();
        this->a_n();
    }
};

class B : public A {
public:
    virtual void a_v() override { OUTPUT; }
    void a_n() { OUTPUT; }

    void c() {
        // 派生类调用了未 override 的虚函数 a, 虚函数 a 中调用了虚函数,
        // 这个虚函数该多态也会也会多态
        this->c_v();
    }
};

void test1();
void test2();
void test3();

int main(int ac, char **av) {
    test1();
    test2();
    test3();
    return 0;
}

void test1() {
    std::cout << "A a; B b;" << std::endl;
    A a;
    a.a_v();
    a.b_v();
    a.a_n();
    a.b_n();

    B b;  // 虚函数也正常继承
    b.a_v();
    b.b_v();
    b.a_n();
    b.b_n();
}

void test2() {
    SEG;
    B b;
    std::cout << "A a = (A)b; A a = new B(); A& a = b;" << std::endl;
    A a = b;
    (&a)->a_v();  // 不多态
    a.a_v();      // 不多态
    a.b_v();
    a.a_n();
    a.b_n();

    A *ap = new B();
    ap->a_v();  // 指针: 虚函数多态
    ap->b_v();
    ap->a_n();
    ap->b_n();

    A &an = b;
    an.a_v();  // 引用: 虚函数多态
    an.b_v();
    an.a_n();
    an.b_n();

    SIZE(a);
    SIZE(b);
    SIZE(ap);
    SIZE(an);
}

void test3() {
    SEG;
    B b;
    b.c();
}

/*
A a; B b;
function: A::a_v
function: A::b_v
function: A::a_n
function: A::b_n
function: B::a_v
function: A::b_v
function: B::a_n
function: A::b_n

A a = (A)b; A a = new B(); A& a = b;
function: A::a_v
function: A::a_v
function: A::b_v
function: A::a_n
function: A::b_n
function: B::a_v
function: A::b_v
function: A::a_n
function: A::b_n
function: B::a_v
function: A::b_v
function: A::a_n
function: A::b_n
sizeof(a) = 8
sizeof(b) = 8
sizeof(ap) = 8
sizeof(an) = 8

function: B::a_v
function: B::a_v
function: B::a_v
function: A::a_n
function: A::a_n
*/