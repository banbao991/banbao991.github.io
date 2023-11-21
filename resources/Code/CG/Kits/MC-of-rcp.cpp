#include <iostream>
#include <random>
#include <ctime>

#define FLOAT long double

/// configuration
const FLOAT B = 1.5;
const FLOAT L1 = 1.0;
const FLOAT L2 = 2.0;
const FLOAT RR_RATE = 0.6;

inline FLOAT f(FLOAT x) {
    return x * x;
}

class Random {
public:
    Random(FLOAT l1, FLOAT l2) {
        gen = std::uniform_real_distribution<FLOAT>{l1, l2};
        e.seed(static_cast<uint32_t>(time(0)));
    }
    Random(uint32_t seed) {
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
    Random2(FLOAT l1, FLOAT l2)
        : Random(l1, l2) {}

    FLOAT operator()() {
        FLOAT v = gen(e);
        return sqrt(3 * v - 2);  // p(x) \propto x
    }

    FLOAT eval(FLOAT x) {
        return (2.0 / 3.0) * x;
    }
};

int main() {
    Random p{1, 2};
    Random2 q{1, 2};

    const int NUM = 1'000'000;
    FLOAT val = 0;
    std::vector<FLOAT> ans{};

    std::cout << "f(x) = x^2, x ~ U(" << L1 << "," << L2 << ")" << std::endl
              << std::endl;

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
    ans.push_back((L2 * L2 * L2 - L1 * L1 * L1) / 3.0);
    std::cout << "[Analytical]" << std::endl
              << "1/E[f(x)] = " << 1.0 / ans.back() << std::endl
              << std::endl;

    //// M1: esitimate the expectation of x^2
    val = 0;
    for (int i = 0; i < NUM; ++i) {
        FLOAT x = q();
        val += f(x) * p.eval(x) / q.eval(x);
        // FLOAT x = p();
        // val += f(x);
    }
    ans.push_back(val / NUM);
    std::cout << "[Unbiased MC]" << std::endl
              << "samples: " << NUM << ", 1/E[f(x)] = " << 1.0 / ans.back() << std::endl
              << std::endl;

    //// M2: esitimate the expectation of 1/x^2
    val = 0;
    for (int i = 0; i < NUM; ++i) {
        FLOAT x = q();
        val += p.eval(x) / (f(x) * q.eval(x));
    }
    ans.push_back(val / NUM);
    std::cout << "[Unbiased MC]" << std::endl
              << "samples: " << NUM << ", E[1/f(x)] = " << ans.back() << std::endl
              << std::endl;

    //// M3: 1/x^2, may be biased?
    {
        std::vector<int> Ms;
        int t_num = NUM;
        do {
            Ms.push_back(t_num);
        } while (t_num /= 10);
        std::cout << "[Biased MC]" << std::endl;
        for (const int M_NUM: Ms) {
            val = 0;
            const int N_NUM = NUM / M_NUM;
            for (int i = 0; i < M_NUM; ++i) {
                FLOAT v_m = 0;
                for (int j = 0; j < N_NUM; ++j) {
                    FLOAT x = q();
                    v_m += f(x) * p.eval(x) / q.eval(x);
                }
                val += 1.0 / (v_m / N_NUM);
            }
            ans.push_back(val / M_NUM);
            std::cout << "samples: " << M_NUM * N_NUM << ", 1/E[f(x)] = " << ans.back()
                      << ", (M, N) = (" << M_NUM << ", " << N_NUM << ")" << std::endl;
        }
        std::cout << std::endl;
    }

    //// M4: 1/x^2, PT-like method
    Random rd{0, 1};

    val = 0;
    int sum = 0;
    for (int i = 0; i < NUM; ++i) {
        FLOAT g_a = 1.0 / B;
        FLOAT q_a = 1.0;
        while (true) {
            FLOAT x = q();
            g_a *= (B - f(x) * p.eval(x)) / B;
            q_a *= q.eval(x);
            val += g_a / (q_a * RR_RATE);
            ++sum;
            if (rd() < RR_RATE) {
                break;
            }
            q_a *= (1 - RR_RATE);
        }
    }
    ans.push_back(val / sum + 1.0 / B);
    std::cout << "[Unbiased MC]" << std::endl
              << "samples: " << sum << ", 1/E[f(x)] = " << ans.back() << std::endl
              << std::endl;

    //// M5: 1/x^2, PT-like method(optimized)
    val = 0;
    sum = 0;
    for (int i = 0; i < NUM; ++i) {
        FLOAT g_a = 1.0 / B;
        FLOAT q_a = 1.0;
        while (true) {
            FLOAT x = q();
            g_a *= 1 - f(x) * p.eval(x) / (B * q.eval(x));
            val += g_a / (q_a * RR_RATE);
            ++sum;
            if (rd() < RR_RATE) {
                break;
            }
            q_a *= (1 - RR_RATE);
        }
    }
    ans.push_back(val / sum + 1.0 / B);
    std::cout << "[Unbiased MC(Optimized)]" << std::endl
              << "samples: " << sum << ", 1/E[f(x)] = " << ans.back() << std::endl
              << std::endl;

    //// M6: 1/x^2, the expectation of the length of the t
    val = 0;
    sum = 0;
    const FLOAT SCALE = 3;  // scale to (0, 1)
    for (int i = 0; i < NUM; ++i) {
        int t = 0;
        while (true) {
            FLOAT x = q();
            FLOAT rr = (f(x) / SCALE) * p.eval(x) / q.eval(x);
            ++t;
            ++sum;
            if (rd() < rr) {
                break;
            }
        }
        val += t;
    }
    ans.push_back(val / NUM / SCALE);
    std::cout << "[Unbiased MC]" << std::endl
              << "samples: " << sum << ", 1/E[f(x)] = " << ans.back() << std::endl
              << std::endl;

    return 0;
}

/*
f(x) = x^2, x ~ U(1,2)

[Analytical]
1/E[f(x)] = 0.428571

[Unbiased MC]
samples: 1000000, 1/E[f(x)] = 0.428565

[Unbiased MC]
samples: 1000000, E[1/f(x)] = 0.500303

[Biased MC]
samples: 1000000, 1/E[f(x)] = 0.44452, (M, N) = (1000000, 1)
samples: 1000000, 1/E[f(x)] = 0.43013, (M, N) = (100000, 10)
samples: 1000000, 1/E[f(x)] = 0.428637, (M, N) = (10000, 100)
samples: 1000000, 1/E[f(x)] = 0.428578, (M, N) = (1000, 1000)
samples: 1000000, 1/E[f(x)] = 0.428597, (M, N) = (100, 10000)
samples: 1000000, 1/E[f(x)] = 0.428532, (M, N) = (10, 100000)
samples: 1000000, 1/E[f(x)] = 0.428606, (M, N) = (1, 1000000)

[Unbiased MC]
samples: 1667510, 1/E[f(x)] = 0.429374

[Unbiased MC(Optimized)]
samples: 1664683, 1/E[f(x)] = 0.426288

[Unbiased MC]
samples: 1285493, 1/E[f(x)] = 0.428498
*/