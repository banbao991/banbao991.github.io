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
#include <stdlib.h>
using namespace std;
#pragma warning (disable:4996)

#define INF 0x3f3f3f3f
#define MAXN 200
#define LL long long

int main() {
    int m1[MAXN][MAXN]; // 1 -> 可能在
    int m2[MAXN][MAXN]; // 1 -> 一定不在


    int A, B, K;
    scanf("%d %d %d", &A, &B, &K);
    for (int i = 1; i <= A; ++i) {
        for (int j = 1; j <= B; ++j) {
            m1[i][j] = 0;
            m2[i][j] = 0;
        }
    }



    int TTT = 0;
    bool first = true;
    for (int k = 0; k < K; ++k) {
        int R, S, P, T;
        scanf("%d %d %d %d", &R, &S, &P, &T);
        int u = max(1, R - (P >> 1));
        int d = min(A, R + (P >> 1));
        int l = max(1, S - (P >> 1));
        int r = min(B, S + (P >> 1));

        if (first && T) {
            ++TTT;
            for (int i = u; i <= d; ++i) {
                for (int j = l; j <= r; ++j) {
                    m1[i][j] = 1;
                }
            }
            first = false;
        } else {
            if (T) { ++TTT; }

            for (int i = u; i <= d; ++i) {
                for (int j = l; j <= r; ++j) {
                    if (T) {
                        ++m1[i][j];
                    } else {
                        m2[i][j] = 1;
                    }
                }
            }
        }
    }

    int ans = 0;
    for (int i = 1; i <= A; ++i) {
        for (int j = 1; j <= B; ++j) {
            if (m1[i][j] == TTT && m2[i][j] == 0) {
                ++ans;
            }
        }
    }

    printf("%d\n", ans);
    return 0;
}