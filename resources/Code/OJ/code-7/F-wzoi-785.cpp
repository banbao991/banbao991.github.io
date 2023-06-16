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
#define MAXN 1005
#define LL long long

int dp[MAXN+1][MAXN+1];
int a[MAXN+1];

int main() {
    int N;
    scanf("%d", &N);
    for (int i = 1; i <= N; ++i) {
        scanf("%d", &a[i]);
    }
    // dp[i][j]: 只考虑前 i 个数, 前 i 个数中删除 j 个数, 能够满足在原位的数字的个数

    memset(dp, 0, sizeof(dp));

    // 初始化
    int cnt = 0; // 初始就在原位的数字个数
    for (int i = 1; i <= N; ++i) {
        cnt += (a[i] == i);
        dp[i][0] = cnt;
        // dp[i][i] = 0; // 全删除完(初始化就是 0 了)
    }

    // dp
    for (int i = 2; i <= N; ++i) {
        for (int j = 1; j < i; ++j) {
            // 考虑第 j 个数
            // 越界初始化为 0 了, 不需要管了
            dp[i][j] = max(
                dp[i - 1][j] + (a[i] == (i - j)),  // 不删 a[j]
                dp[i - 1][j - 1]                   // 删 a[j]
            );
        }
    }

    
    cnt = 0;
    for (int i = 0; i < N; ++i) {
        cnt = max(cnt, dp[N][i]);
    }

    printf("%d\n", cnt);
    return 0;
}