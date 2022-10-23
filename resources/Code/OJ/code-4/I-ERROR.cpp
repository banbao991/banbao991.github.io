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

int main() {
    int A, B, C, k;
    while (scanf("%d %d %d %d", &A, &B, &C, &k) != EOF) {
        if (!A && !B && !C && !k) { break; }
        int MAX_VAL = (1 << k) - 1;
        if (k == 32) { MAX_VAL = -1; }

        // 特判 0
        if (C == 0) {
            if (B != A) {
                printf("FOREVER\n");
            } else {
                printf("0\n");
            }
            continue;
        }

        // 特判 FOREVER
        // 可能 (B-A) + n*(MAX_VAL+1)%C != 0
        // 有问题
        if (((B - A) & MAX_VAL) % C) {
            printf("FOREVER\n");
            continue;
        }
        int ans = ((B - A) & MAX_VAL) / C;
        if (ans < 0) {
            ans = ans & (MAX_VAL >> 1);
        }
        if (k == 32) {
            printf("%u\n", ans);
        } else {
            printf("%d\n", ans);
        }
    }
    return 0;
}