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
#define MAXN 105

int main() {
    int a[MAXN][MAXN];
    int ans[MAXN];
    int N;
    scanf("%d", &N);
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j <= i; ++j) {
            scanf("%d", &a[i][j]);
        }
    }
    memset(ans, 0, sizeof(ans));
    // down to up
    int N_1 = N - 1;
    for (int i = 0; i < N; ++i) {
        ans[i] = a[N_1][i];
    }
    for (int r = N - 2; r >= 0; --r) {
        for (int i = 0; i <= r; ++i) {
            ans[i] = a[r][i] + max(ans[i], ans[i + 1]);
        }
    }
    printf("%d\n", ans[0]);

    return 0;
}