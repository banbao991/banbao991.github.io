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
#define MAXN 45
#define LL long long

struct Node {
    int x, y, s;
    Node(int _x, int _y, int _s) :x(_x), y(_y), s(_s) {}
};

int main() {
    int R, C;
    char m[MAXN][MAXN];
    char vis[MAXN][MAXN];
    memset(vis, 0, sizeof(vis));

    scanf("%d %d", &R, &C);
    getchar();
    for (int i = 0; i < R; ++i) {
        for (int j = 0; j < C; ++j) {
            scanf("%c", &m[i][j]);
        }
        getchar();
    }

    queue<Node> Q;
    while (!Q.empty()) Q.pop();
    Q.push(Node(0, 0, 1));
    vis[0][0] = true;
    int dst_x = R - 1, dst_y = C - 1;
    int dx[] = { -1,0,1,0 };
    int dy[] = { 0,1,0,-1 };

    while (!Q.empty()) {
        Node node = Q.front();
        Q.pop();
        for (int i = 0; i < 4; ++i) {
            int xx = node.x + dx[i],
                yy = node.y + dy[i];
            if (xx >= 0 && xx < R && yy >= 0 && yy < C && m[xx][yy] == '.' && !vis[xx][yy]) {
                vis[xx][yy] = true;
                if (xx == dst_x && yy == dst_y) {
                    printf("%d\n", node.s + 1);
                } else {
                    Q.push(Node(xx, yy, node.s + 1));
                }
            }
        }
    }
    return 0;
}