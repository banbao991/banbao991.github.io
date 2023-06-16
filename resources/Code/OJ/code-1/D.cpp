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



// 输入数据全为正整数, 保证最小是 1
// 注意范围得是 MAXN(可以先构造出大于 100 的, 然后差值减到 100 以下)
// 1 12 50 70 80 90
// 101 = 90+12-1
#define MAXN 600
int main() {
    int N;
    scanf("%d", &N);
    int dp[MAXN + 1];
    int coin[6];
    while (N--) {
        memset(dp, -1, sizeof(dp));
        // input
        for (int i = 0; i < 6; ++i) {
            scanf("%d", &coin[i]);
            dp[coin[i]] = 1;
        }

        bool change = true;
        while (change) {
            change = false;
            // 求和 
            for (int i = 2; i <= MAXN; ++i) {
                for (int j = 0; j < 6; ++j) {
                    int now = i - coin[j];
                    if (now >= 1) {
                        if (dp[i] != -1) {
                            int t;
                            if ((t = dp[now] + 1) < dp[i]) {
                                dp[i] = t;
                                change = true;
                            }
                        } else {
                            dp[i] = dp[now] + 1;
                        }
                    }
                }
            }

            // 做差
            for (int i = MAXN; i >= 1; --i) {
                for (int j = 0; j < 6; ++j) {
                    int now = i + coin[j];
                    if (now <= MAXN) {
                        int t;
                        if ((t = dp[now] + 1) < dp[i]) {
                            dp[i] = t;
                            change = true;
                        }
                    }
                }
            }
        }
        int max_val = -1;
        float ans = 0.0f;
        for (int i = 1; i <= 100; ++i) {
            max_val = max(max_val, dp[i]);
            ans += dp[i];
        }
        printf("%.2f %d\n", ans/100.0f, max_val);
    }
    return 0;
}
