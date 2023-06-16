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
#define MAXN 25
int ans = 0;
int W, H;
char a[MAXN][MAXN];
int vis[MAXN][MAXN];
int dx[] = { -1,0,1,0 };
int dy[] = { 0,1,0,-1 };

void dfs(int x, int y) {
    ++ans;
    vis[x][y] = true;
    for (int i = 0; i < 4; ++i) {
        int tx = x + dx[i];
        int ty = y + dy[i];
        if (tx >= 0 && tx < H && ty >= 0 && ty < W && !vis[tx][ty] && a[tx][ty] == '.') { 
            dfs(tx, ty);
        }
    }
}

int main() {
    while (scanf("%d %d", &W, &H) != EOF && W && H) {
        int px, py;
        ans = 0;
        memset(vis, 0, sizeof(vis));
        getchar();
        for (int i = 0; i < H; ++i) {
            for (int j = 0; j < W; ++j) {
                char t;
                scanf("%c", &t);
                a[i][j] = t;
                if (t == '@') {
                    px = i;
                    py = j;
                }
            }
            getchar();
        }
        dfs(px, py);
        printf("%d\n", ans);
    }
    return 0;
}