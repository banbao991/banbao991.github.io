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
#define MAXN 1050
#define MAXM 10050
#define MAXC 150

struct Edge {
    int s, t, f;
};

int main() {
    int p[MAXN];
    Edge edge[MAXM];
    int m, n;
    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; ++i) {
        scanf("%d", p + i);
    }
    for (int i = 0; i < m; ++i) {
        int s, t, f;
        scanf("%d %d %d", &s, &t, &f);
        edge[i].s = s;
        edge[i].t = t;
        edge[i].f = f;
    }
    // BF
    int dp[MAXN][MAXC]; // dp[i][j] 表示到达 i 点剩余油量 j 的最小花费
    int q;
    scanf("%d", &q);
    while (q--) {
        int s, t, f;
        scanf("%d %d %d", &f, &s, &t);
        // 初始化
        memset(dp, -1, sizeof(dp));
        for (int i = 0; i <= f; ++i) {
            dp[s][i] = p[s] * i;
        }

        // bellman-ford
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < m; ++j) {
                Edge e = edge[j];
                for (int k = e.f; k <= f; ++k) {
                    int now = dp[e.s][k];
                    if (now != -1) {
                        int left = k - e.f;
                        if (dp[e.t][left] == -1 || now < dp[e.t][left]) {
                            dp[e.t][left] = now;
                            // 同时向上更新(可优化，每个点值只更新一次)
                            for (int l = left + 1; l <= f; ++l) {
                                int update = now + p[e.t] * (l - left);
                                if (dp[e.t][l] == -1 || update < dp[e.t][l]) {
                                    dp[e.t][l] = update;
                                } else {
                                    break; // 优化
                                }
                            }
                        }
                    }
                }
            }
        }
        int ans = dp[t][0];
        for (int i = 1; i <= f; ++i) {
            if (dp[t][i] != -1 && dp[t][i] < ans) {
                ans = dp[t][i];
            }
        }
        if (ans != -1) {
            printf("%d\n", ans);
        }else{
            printf("impossible\n");
        }
    }
    return 0;
}