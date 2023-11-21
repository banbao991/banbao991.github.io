#include <iostream>
#include <random>
#include <ctime>
#include <functional>

#define FLOAT long double

inline FLOAT f(FLOAT x) {
    return x * x;
}

inline FLOAT g(FLOAT x, FLOAT y) {
    return (x + 1) * std::exp(y);
}

/// configuration
const FLOAT L1 = 1.0;
const FLOAT L2 = 2.0;
const FLOAT B = g(L2, L2) / (L2 - L1);
const FLOAT RR_RATE = 0.6;
const int NUM_X = 100'000;
const int NUM_Y = 10;
const int NUM = NUM_X * NUM_Y;

const FLOAT VAL_A = 1.0 / 3.0 * (1.0 + 2.0 * std::log(3.0 / 2.0)) * 1.5 / (std::exp(2) - std::exp(1));
const FLOAT VAL_B = 73.0 / 8.0 / 1.5 * (std::exp(2) - std::exp(1));

class Random {
public:
    Random(FLOAT l1, FLOAT l2, uint32_t seed) {
        gen = std::uniform_real_distribution<FLOAT>{l1, l2};
        e.seed(seed);
    }

    FLOAT operator()() {
        return gen(e);
    }

    FLOAT eval(FLOAT x) {
        return 1;
    }

protected:
    std::default_random_engine e{};
    std::uniform_real_distribution<FLOAT> gen{};
};

class Random2 : public Random {
public:
    Random2(FLOAT l1, FLOAT l2, uint32_t seed)
        : Random(l1, l2, seed) {}

    FLOAT operator()() {
        FLOAT v = gen(e);
        return sqrt(3 * v - 2);  // p(x) \propto x
    }

    FLOAT eval(FLOAT x) {
        return (2.0 / 3.0) * x;
    }
};

FLOAT simpson(std::function<FLOAT(FLOAT)> func, FLOAT a, FLOAT b, int steps) {
    FLOAT h = (b - a) / steps;
    FLOAT sum = 0;
    for (int i = 0; i < steps; ++i) {
        FLOAT x1 = a + h * i;
        FLOAT x2 = a + h * (i + 1);
        FLOAT xm = (x1 + x2) / 2;
        sum += h / 3 * (func(x1) + 4 * func(xm) + func(x2));
    }
    return sum;
}

int main() {
    Random p{L1, L2, 38358U};
    Random q{L1, L2, 65431U};

    FLOAT val_A = 0, val_B = 0;

#if 0
        // validate p(or q) is a pdf
        for (int i = 0; i < NUM; ++i) {
            FLOAT x = p();
            val += q.eval(x) / p.eval(x);
            // FLOAT x = q();
            // val += p.eval(x) / q.eval(x);
        }
        std::cout << val / NUM << std::endl;
#endif

    //// analytical solution
    std::cout << "[Analytical]" << std::endl
              << "A = " << VAL_A << ", B = " << VAL_B << std::endl
              << std::endl;

    //// M1: naive version
    val_A = 0;
    val_B = 0;
    for (int i = 0; i < NUM_X; ++i) {
        FLOAT x = p();
        FLOAT sum = 0;
        for (int i = 0; i < NUM_Y; ++i) {
            FLOAT y = q();
            sum += g(x, y) / q.eval(y);
        }
        val_A += f(x) / p.eval(x) / (sum / NUM_Y);
        val_B += f(x) / p.eval(x) * (sum / NUM_Y);
    }
    val_A /= NUM_X;
    val_B /= NUM_X;
    std::cout << "[first dy, then dx]" << std::endl
              << "samples: " << NUM << ", A = " << val_A << "(" << std::abs(VAL_A - val_A) << ")"
              << ", B = " << val_B << std::endl
              << std::endl;

    //// M2: 1/x^2, PT-like method
    val_A = 0;
    Random rd{0, 1, 156461U};
    int total_NUM = 0;
    for (int i = 0; i < NUM_X; ++i) {
        FLOAT sum_val = 0;
        int sum_NUM = 0;

        FLOAT x = p();
        const uint32_t samples_Y = std::max(1U, static_cast<uint32_t>(NUM_Y * RR_RATE));

        for (int j = 0; j < samples_Y; ++j) {
            FLOAT g_a = 1.0 / B;
            FLOAT q_a = 1.0;
            while (true) {
                FLOAT y = q();
                g_a *= (B - g(x, y)) / B;
                q_a *= q.eval(y);
                sum_val += g_a / (q_a * RR_RATE);
                ++sum_NUM;
                if (rd() < RR_RATE) {
                    break;
                }
                q_a *= (1 - RR_RATE);
            }
        }
        val_A += f(x) / p.eval(x) * (sum_val / sum_NUM + 1.0 / B);
        total_NUM += sum_NUM;
    }
    val_A /= NUM_X;
    std::cout << "[PT-like method]" << std::endl
              << "samples: " << total_NUM << ", (X, Y) = (" << NUM_X << ", " << NUM_Y << ")" << std::endl
              << "A = " << val_A << "(" << std::abs(VAL_A - val_A) << ")" << std::endl
              << std::endl;

    //// M3: 1/x^2, PT-like method(optimized)
    val_A = 0;
    total_NUM = 0;
    for (int i = 0; i < NUM_X; ++i) {
        FLOAT sum_val = 0;
        int sum_NUM = 0;

        FLOAT x = p();
        const uint32_t samples_Y = std::max(1U, static_cast<uint32_t>(NUM_Y * RR_RATE));

        for (int j = 0; j < samples_Y; ++j) {
            FLOAT g_a = 1.0 / B;
            FLOAT q_a = 1.0;
            while (true) {
                FLOAT y = q();
                g_a *= 1 - g(x, y) / (B * q.eval(y));
                sum_val += g_a / (q_a * RR_RATE);
                ++sum_NUM;
                if (rd() < RR_RATE) {
                    break;
                }
                q_a *= (1 - RR_RATE);
            }
        }
        val_A += f(x) / p.eval(x) * (sum_val / sum_NUM + 1.0 / B);
        total_NUM += sum_NUM;
    }
    val_A /= NUM_X;
    std::cout << "[PT-like method(Optimized)]" << std::endl
              << "samples: " << total_NUM << ", (X, Y) = (" << NUM_X << ", " << NUM_Y << ")" << std::endl
              << "A = " << val_A << "(" << std::abs(VAL_A - val_A) << ")" << std::endl
              << std::endl;

    //// M4: analical solution, simpson method
    val_A = simpson([](FLOAT x) { return f(x) / simpson([=](FLOAT y) { return g(x, y); }, L1, L2, NUM_Y); }, L1, L2, NUM_X);
    std::cout << "[Analytical(Simpson)]" << std::endl
              << "samples: " << total_NUM << ", (X, Y) = (" << NUM_X << ", " << NUM_Y << ")" << std::endl
              << "A = " << val_A << "(" << std::abs(VAL_A - val_A) << ")"
              << std::endl;
    return 0;
}

/*
[Analytical]
A = 0.193858, B = 28.4139

[first dy, then dx]
samples: 1000000, A = 0.195336(0.0014786), B = 28.3969

[PT-like method]
samples: 999597, (X, Y) = (100000, 10)
A = 0.192066(0.00179133)

[PT-like method(Optimized)]
samples: 999598, (X, Y) = (100000, 10)
A = 0.192302(0.0015553)

[Analytical(Simpson)]
samples: 999598, (X, Y) = (100000, 10)
A = 0.193858(6.72916e-09)
*/