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

// 注意关键条件: 国王等级不一定是最高的!!!!!!

int main() {
    int M, N;
    while (scanf("%d %d", &M, &N) != EOF) {

        int dp[MAXN][MAXN];
        int level[MAXN];
        int no_cons[MAXN][MAXN]; // 不加限制的距离
        memset(no_cons, -1, sizeof(no_cons));

        // 探险家看作顶点 0
        no_cons[0][0] = 0;
        int king_class;
        for (int i = 1; i <= N; ++i) {
            no_cons[i][i] = 0;
            int p, l, x;
            scanf("%d %d %d", &p, &l, &x);
            level[i] = l;
            no_cons[0][i] = p;
            for (int j = 0; j < x; ++j) {
                int t, v;
                scanf("%d %d", &t, &v);
                no_cons[t][i] = v;
            }
        }
        king_class = level[1];
        level[0] = king_class;

        int ans = -1;
        for (int max_level = king_class + M; max_level >= king_class - M; --max_level) {
            int min_level = max_level - M;
            // 构造 dp
            memset(dp, -1, sizeof(dp));
            for (int i = 0; i <= N; ++i) {
                if (level[i] > max_level || level[i] < min_level) {
                    continue;
                }
                for (int j = 0; j <= N; ++j) {
                    if (level[j] > max_level || level[j] < min_level) {
                        continue;
                    }
                    dp[i][j] = no_cons[i][j];
                }
            }
            // Floyd
            for (int k = 0; k <= N; ++k) {
                for (int i = 0; i <= N; ++i) {
                    for (int j = 0; j <= N; ++j) {
                        if (dp[i][k] != -1 && dp[k][j] != -1) {
                            int t = dp[i][k] + dp[k][j];
                            if (dp[i][j] == -1) {
                                dp[i][j] = t;
                            } else {
                                dp[i][j] = min(t, dp[i][j]);
                            }
                        }
                    }
                }
            }
            ans = (ans == -1) ? dp[0][1] :
                ((dp[0][1] == -1) ? ans : min(ans, dp[0][1]));
        }
        printf("%d\n", ans);
    }
    return 0;
}