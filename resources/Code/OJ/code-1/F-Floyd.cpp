#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory.h>
#include <stdio.h>
#include <map>
#include <stack>
using namespace std;
#pragma warning (disable:4996)

#define inf 0x3f3f3f3f
#define MAXN 105
int dp[MAXN][MAXN];
int main() {
    //memset(dp, -1, sizeof(dp));
    int N, A, B;
    scanf("%d %d %d", &N, &A, &B);

    for (int i = 1; i <= N; ++i) {
        for (int j = 1; j <= N; ++j) {
            dp[i][j] = (i == j) ? 0 : inf;
        }
    }

    for (int i = 1; i <= N; ++i) {
        //dp[i][i] = 0;
        int num, t;
        scanf("%d", &num);
        if (num) {
            scanf("%d", &t);
            dp[i][t] = 0;
            while (--num) {
                scanf("%d", &t);
                dp[i][t] = 1;
            }
        }
    }

    // 暴力 Floyd TLE
    for (int k = 1; k <= N; ++k) {
        for (int i = 1; i <= N; ++i) {
            for (int j = 1; j <= N; ++j) {
                int t = dp[i][k] + dp[k][j];
                dp[i][j] = min(dp[i][j], t);
            }
        }
    }

    printf("%d\n", dp[A][B] == inf ? -1 : dp[A][B]);

    return 0;
}
