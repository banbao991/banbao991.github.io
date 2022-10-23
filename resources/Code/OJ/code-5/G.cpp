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
#define MAXN 550
#define LL long long

struct Node {
    int x, y;
};

double dis[MAXN][MAXN];
Node nodes[MAXN];
char vis[MAXN];

int main() {
    int CNT;
    scanf("%d", &CNT);
    while (CNT--) {
        int P, N;
        scanf("%d %d", &P, &N);
        for (int i = 0; i < N; ++i) {
            scanf("%d %d", &nodes[i].x, &nodes[i].y);
        }

        // 距离
        memset(dis, 0, sizeof(dis));
        for (int i = 0; i < N; ++i) {
            for (int j = 0; j < i; ++j) {
                int dx = nodes[i].x - nodes[j].x,
                    dy = nodes[i].y - nodes[j].y;
                dis[i][j] = dis[j][i] = 1.0*dx * dx + dy * dy;
            }
        }

        // 二分广搜
        double ll = 0.0, rr = 20000.0;
        while (rr - ll > 1e-5) {
            double ans = (ll + rr) / 2;
            double d = ans * ans;
            vector<vector<int>> adj;
            adj.resize(N);
            for (int i = 0; i < N; ++i) {
                adj[i].clear();
            }
            // 邻接表
            for (int i = 0; i < N; ++i) {
                for (int j = 0; j < i; ++j) {
                    if (dis[i][j] < d) {
                        adj[i].push_back(j);
                        adj[j].push_back(i);
                    }
                }
            }
            // 广搜
            memset(vis, 0, sizeof(vis));
            int blocks = 0;
            queue<int> Q;
            while (!Q.empty()) { Q.pop(); }
            for (int kk = 0; kk < N; ++kk) {
                if (vis[kk]) { continue; }
                ++blocks;
                Q.push(kk);
                vis[kk] = 1;
                while (!Q.empty()) {
                    int s = Q.front();
                    Q.pop();
                    for (int i : adj[s]) {
                        if (!vis[i]) {
                            Q.push(i);
                            vis[i] = 1;
                        }
                    }
                }
            }
            if (blocks <= P) {
                rr = ans;
            } else {
                ll = ans;
            }
        }
        printf("%.2lf\n", rr);
    }
    return 0;
}