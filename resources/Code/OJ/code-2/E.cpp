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
#define MAXN 15


int m[MAXN][MAXN];
int vis[MAXN][MAXN];
int N, C;
bool catch0;


int dx[6] = { -1,-1,0,1,1,0 };
int dy[6] = { -1,0,1,1,0,-1 };

int dfs(int x, int y, int v) {
    vis[x][y] = true;
    int ans = 1;
    for (int i = 0; i < 6; ++i) {
        int tx = x + dx[i], ty = y + dy[i];
        if (tx >= 0 && tx < N && ty >= 0 && ty < N && ty <= tx && !vis[tx][ty]) {
            if (m[tx][ty] == 0) {
                catch0 = true;
            } else if (m[tx][ty] == v) {
                ans += dfs(tx, ty, v);
            }
        }
    }
    return ans;
}

int grade() {
    int ans = 0;
    memset(vis, 0, sizeof(vis));
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j <= i; ++j) {
            if (vis[i][j] || m[i][j] == 0) {
                continue;
            }
            catch0 = false; 
            int t = dfs(i, j, m[i][j]);
            if (!catch0) {
                ans += ((m[i][j] == C) ? -1 : 1) * t;
            }
        }
    }
    return ans;
}

// 如果一组棋子没有和空格相邻，则将其移除
int main() {
    while (scanf("%d %d", &N, &C) && N && C) {
        // input
        for (int i = 0; i < N; ++i) {
            for (int j = 0; j <= i; ++j) {
                scanf("%d", &m[i][j]);
            }
        }
        // deal
        int ans = -inf;
        for (int i = 0; i < N; ++i) {
            for (int j = 0; j <= i; ++j) {
                if (m[i][j] == 0) {
                    m[i][j] = C;
                    int t = grade();
                    ans = max(ans, t);
                    m[i][j] = 0;
                }
            }
        }
        printf("%d\n", ans);
    }
    return 0;
}