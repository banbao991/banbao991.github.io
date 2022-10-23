#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory.h>
#include <stdio.h>
#include <map>
#include <set>
#include <stack>
#include <queue>
using namespace std;
#pragma warning (disable:4996)

#define INF 0x3f3f3f3f
#define MAXN 100
#define LL unsigned long long


// ax + by = gcd(a, b) = d
void exgcd(LL a, LL b, LL &d, LL &x, LL&y) {
    if (!b) {
        d = a;
        x = 1;
        y = 0;
    } else {
        exgcd(b, a%b, d, y, x);
        y -= x * (a / b);
    }
}

int main() {
    LL A, B, C, k;
    while (scanf("%llu %llu %llu %llu", &A, &B, &C, &k) != EOF) {
        if (!A && !B && !C && !k) {
            break;
        }
        // ax +      by = c
        // Cx + (-2^k)y = B-A
        LL a, b, c, d, x, y, dm;

        c = B - A;
        // 特判
        if (c == 0) {
            printf("0\n");
            continue;
        }

        a = C;
        b = 1ULL << k;
        exgcd(a, b, d, x, y);

        if (c%d) {
            printf("FOREVER\n");
            continue;
        }

        dm = b / d;
        x = (((x*c / d) % dm) + dm) % dm;
        printf("%llu\n", x);
    }
    return 0;
}