#include <Eigen/Dense>
#include <cmath>
#include <iostream>
#define ROW 11
#define COL 8
#define HIGH 7

// y=1+x+x^2+...+x^7
double calc(const double x) {
    double y = 1;
    for (int i = 0; i < HIGH; ++i) {
        y = x * y + 1;
    }
    return y;
}

// y=1+x+x^2+...+x^7
double calc2(const double x) {
    double y = 1;
    for (int i = 1; i <= HIGH; ++i) {
        y += pow(x, i);
    }
    return y;
}

int main() {
    // 向量 x,y
    Eigen::VectorXd c(ROW), y(ROW);
    for (int i = 0; i < ROW; ++i) {
        c[i] = 2 + 0.2 * i;
        y[i] = calc(c[i]);
    }
    // std::cout << c.transpose() << std::endl;
    // std::cout << x.transpose() << std::endl;

    // for (int i = 0; i < ROW; ++i) {
    //     c[i] = 2 + 0.2 * i;
    //     y[i] = calc2(c[i]);
    // }
    // std::cout << y.transpose() << std::endl;

    // 矩阵
    Eigen::MatrixXd A(ROW, COL);
    for (int i = 0; i < ROW; ++i) {
        A(i, 0) = 1;
        double t = c[i];
        for (int j = 1; j < COL; ++j) {
            A(i, j) = A(i, j - 1) * t;
        }
    }
    // std::cout << A << std::endl;

    // 法线方程求解
    std::cout << "A^tAx = A^tb" << std::endl;
    std::cout << "x = (A^tA)^{-1}A^tb" << std::endl;
    auto At = A.transpose();
    auto AtA = At * A;
    auto x = AtA.inverse() * At * y;
    std::cout << x.transpose() << std::endl;

    std::cout << "bcdsvd" << std::endl;
    std::cout << A.bdcSvd(Eigen::ComputeThinU | Eigen::ComputeThinV)
                     .solve(y)
                     .transpose()
              << std::endl;
    return 0;
}
/*
A^tAx = A^tb
x = (A^tA)^{-1}A^tb
 773.846 -332.091 -118.409  93.8004 -24.9489  5.18484 0.556747  1.02216
bcdsvd
1 1 1 1 1 1 1 1
*/
