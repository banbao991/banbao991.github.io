#include <iostream>
#include <memory>

class A {
   public:
    virtual void a() const = 0;
    virtual void b() const = 0;
};

class B : public A {
   public:
    virtual void a() const override {
        std::cout << "Class B, Function a" << std::endl;
    }
    virtual void b() const override {
        std::cout << "Class B, Function b" << std::endl;
    }
};

class C : public B {
   public:
    virtual void a() const override {
        std::cout << "Class C, Function a" << std::endl;
    }
};

int main(int argc, char** argv) {
    std::shared_ptr<A> t;
    // 编译错误, 抽象类不能实例化
    // t = std::make_shared<A>();
    // t->a();
    // t->b();
    t = std::make_shared<B>();
    t->a();
    t->b();
    t = std::make_shared<C>();
    t->a();
    t->b();

    return 0;
}

/**
Class B, Function a
Class B, Function b
Class C, Function a
Class B, Function b
*/