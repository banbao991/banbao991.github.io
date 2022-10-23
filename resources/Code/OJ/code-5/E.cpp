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
#define MAXN 10050
#define LL long long

int a[MAXN];
int b[MAXN];

int main() {
    int N, S;
    scanf("%d %d", &N, &S);
    for (int i = 0; i < N; ++i) {
        scanf("%d %d", &a[i], &b[i]);
    }

    LL ans = 0;
    // 1. brute
    for (int i = 0; i < N; ++i) {
        int pp = a[i];
        int vv = b[i];
        LL cost = vv * pp;
        for (int j = 0; j < i; ++j) {
            LL tt = vv * ((LL)a[j] + (i - j)*S);
            if (tt < cost) {
                cost = tt;
            }
        }
        ans += cost;
    }

    // 2. 堆优化
    // TODO

    printf("%lld\n", ans);

    return 0;
}