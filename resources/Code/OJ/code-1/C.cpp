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
#define MAXNN 100

char M[MAXNN][MAXNN];
int type[MAXNN][MAXNN];
bool vis[MAXNN][MAXNN];

int w, h;
int typeCnt = 0;

int dx[] = { -1,0,1,0 };
int dy[] = { 0,1,0,-1 };

struct node {
    int x, y;
    int type;
};


void dfs1(int x, int y) {
    type[x][y] = typeCnt;
    vis[x][y] = true;
    for (int i = 0; i < 4; ++i) {
        int tx = x + dx[i], ty = y + dy[i];
        if (tx >= 0 && tx < h && ty >= 0 && ty < w && M[tx][ty] != '.' && !vis[tx][ty]) {
            dfs1(tx, ty);
        }
    }
}

void dfs2(int x, int y, int ntype) {
    vis[x][y] = true;
    for (int i = 0; i < 4; ++i) {
        int tx = x + dx[i], ty = y + dy[i];
        if (tx >= 0 && tx < h && ty >= 0 && ty < w && type[tx][ty] == ntype && M[tx][ty] == 'X' && !vis[tx][ty]) {
            dfs2(tx, ty, ntype);
        }
    }
}

int check(int x, int y, int ntype){
    int ans = 0;
    vis[x][y] = true;
    if (M[x][y] == 'X') {
        dfs2(x, y, ntype);
        ++ans;
    }
    for (int i = 0; i < 4; ++i) {
        int tx = x + dx[i], ty = y + dy[i];
        if (tx >= 0 && tx < h && ty >= 0 && ty < w && type[tx][ty] == ntype && !vis[tx][ty]) {
            ans += check(tx, ty, ntype);
        }
    }
    return ans;
}

int main() {
    int num = 0;
    while (scanf("%d %d", &w, &h) != EOF) {
        typeCnt = 0;
        // input
        if (!w && !h) {
            break;
        }
        getchar();
        for (int i = 0; i < h; ++i) {
            for (int j = 0; j < w; ++j) {
                scanf("%c", &M[i][j]);
            }
            getchar();
        }
        vector<node> typedot;
        typedot.clear();

        // dfs1
        memset(vis, 0, sizeof(vis));
        memset(type, 0, sizeof(type));
        for (int i = 0; i < h; ++i) {
            for (int j = 0; j < w; ++j) {
                if (M[i][j] != '.' && !vis[i][j]) {
                    ++typeCnt;
                    node n;
                    n.type = typeCnt;
                    n.x = i;
                    n.y = j;
                    typedot.push_back(n);
                    dfs1(i, j);
                }
            }
        }
        vector<int> ans;
        ans.clear();

        // dfs2
        memset(vis, 0, sizeof(vis));
        for (int i = 0; i < typeCnt; ++i) {
            node n = typedot[i];
            ans.push_back(check(n.x, n.y, n.type));
        }

        // output
        printf("Throw %d\n", ++num);

        sort(ans.begin(), ans.end());
        int alength = ans.size();
        if (alength) {
            printf("%d", ans[0]);
            for (int i = 1; i < alength; ++i) {
                printf(" %d", ans[i]);
            }
        }
        printf("\n\n");
    }
    return 0;
}
