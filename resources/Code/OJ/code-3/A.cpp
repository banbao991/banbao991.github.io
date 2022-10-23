#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory.h>
#include <stdio.h>
#include <map>
#include <stack>
#include <queue>
using namespace std;
#pragma warning (disable:4996)

#define INF 0x3f3f3f3f
#define MAXN 25

int is_prime(int num) {
    if (num == 1) return 0;
    if (num == 2) return 1;
    int e = ((int)sqrt(double(num))) + 1;
    for (int i = 2; i <= e; ++i) {
        if (num % i == 0) {
            return 0;
        }
    }
    //printf("%d\n", num);
    return 1;
}

int main() {
    int s, t;

    while (scanf("%d %d", &s, &t) != EOF) {
        int ans = 0;
        if (s > t) {
            s ^= t;
            t ^= s;
            s ^= t;
        }
        for (int i = s; i <= t; ++i) {
            ans += is_prime(i);
        }
        printf("%d\n", ans);
    }
    
    return 0;
}