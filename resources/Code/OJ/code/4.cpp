#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory.h>
#include <stdio.h>
using namespace std;
#pragma warning (disable:4996)

// 记忆化搜索
char map[25][25];
bool vis[25][25];

int dx[] = { -1,0,1,0 };
int dy[] = { 0,1,0,-1 };

int dfs(int sx, int sy) {
    int ans = 0;
    for (int i = 0; i < 4; ++i) {
        int x = sx + dx[i], y = sy + dy[i];
        if (!vis[x][y] && map[x][y] == '.') {
            ++ans;
            vis[x][y] = true;
            ans += dfs(x, y);
        }
    }
    return ans;
}

int main() {
    int x, y;
    int sx, sy;
    char c;
    while (scanf("%d %d", &y, &x) != EOF) {
        if (!x && !y) break;
        memset(map, 0, sizeof(map));
        memset(vis, 0, sizeof(vis));
        getchar();
        for (int i = 1; i <= x; ++i) {
            for (int j = 1; j <= y; ++j) {
                scanf("%c", &c);
                if (c == '@') {
                    sx = i;
                    sy = j;
                }
                map[i][j] = c;
            }
            getchar();
        }
        vis[sx][sy] = 1;
        printf("%d\n", dfs(sx, sy) + 1);
    }
    return 0;
}