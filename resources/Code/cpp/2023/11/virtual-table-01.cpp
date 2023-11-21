#include <iostream>

#define SEG \
    { std::cout << std::endl; }
#define OUTPUT \
    { std::cout << "function: " << __FUNCTION__ << std::endl; }
#define SIZE(a) \
    { std::cout << "sizeof(" #a ") = " << sizeof(a) << std::endl; }

typedef void *(*VFPTR)();                                   // 函数指针, 参数为空, 返回值为 void*
#define GET_VT(a) (VFPTR *)(*(ADDR *)(a))                   // 把地址读出来, 然后转换成函数指针
#define GET_VT_MASK(a) (((ADDR)(a)) >> (ADDRESS_SIZE * 4))  // 取前一半的地址作为 mask

class A {
public:
    virtual void a_v() { OUTPUT; }
    virtual void b_v() { OUTPUT; }
};

class B : public A {
public:
    virtual void a_v() override { OUTPUT; }
    virtual void c_v() { OUTPUT; }
};

class C : public B {
public:
    virtual void d_v() { OUTPUT; }
};

VFPTR *get_vt(void *v) {
    VFPTR *vt = nullptr;
    const int ADDRESS_SIZE = sizeof(void *);
    if (ADDRESS_SIZE == 8) {
        // 64 bit machine
        typedef long long ADDR;
        vt = GET_VT(v);
    } else {
        // 32 bit machine
        typedef int ADDR;
        vt = GET_VT(v);
    }
    return vt;
}

bool check_end(VFPTR *vt, int i) {
    const int ADDRESS_SIZE = sizeof(void *);
    if (ADDRESS_SIZE == 8) {
        // 64 bit machine
        typedef long long ADDR;
        return GET_VT_MASK(vt[i]) != GET_VT_MASK(vt[0]);
    } else {
        // 32 bit machine
        typedef int ADDR;
        return GET_VT_MASK(vt[i]) != GET_VT_MASK(vt[0]);
    }
}

void print_vt(void *v) {
    int VT_MASK = 0;
    VFPTR *vt = get_vt(v);
    std::cout << "virtual table address: " << vt << std::endl;
    for (int i = 0; vt[i] != nullptr; ++i) {
        if (check_end(vt, i)) {
            break;
        }
        std::cout << "virtual function " << i
                  << " --> " << std::hex << vt[i]
                  << " --> ";
        vt[i]();  // output the function name
    }
    std::cout << std::endl;
}

int main(int ac, char **av) {
    A a;
    B b;
    C c;

    print_vt(&a);
    print_vt(&b);
    print_vt(&c);

    return 0;
}

/*
virtual table address: 00007FF7C453BD48
virtual function 0 --> 00007FF7C453141F --> function: A::a_v
virtual function 1 --> 00007FF7C453134D --> function: A::b_v

virtual table address: 00007FF7C453BD88
virtual function 0 --> 00007FF7C4531311 --> function: B::a_v
virtual function 1 --> 00007FF7C453134D --> function: A::b_v
virtual function 2 --> 00007FF7C453107D --> function: B::c_v

virtual table address: 00007FF7C453BDC0
virtual function 0 --> 00007FF7C4531311 --> function: B::a_v
virtual function 1 --> 00007FF7C453134D --> function: A::b_v
virtual function 2 --> 00007FF7C453107D --> function: B::c_v
virtual function 3 --> 00007FF7C4531451 --> function: C::d_v
*/