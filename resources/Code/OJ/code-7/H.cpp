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
#define MAXN 300
#define LL long long

struct Node {
    int x, y;
    Node() {}
    Node(int _x, int _y) :x(_x), y(_y) {}
    bool operator < (const Node &b) const {
        if (x != b.x) {
            return x < b.x;
        }
        return y < b.y;
    }
};

double dp[MAXN][MAXN];
double dis[MAXN][MAXN];
vector<vector<int>> adj;

int main() {
    map<Node, int> m;
    Node pos[MAXN];
    m.clear();
    int a, b;
    int cnt = 0;
    cin >> a >> b;
    pos[cnt].x = a;
    pos[cnt++].y = b;
    cin >> a >> b;
    pos[cnt].x = a;
    pos[cnt++].y = b;


    adj.clear();
    adj.resize(MAXN);
    for (int i = 0; i < MAXN; ++i) {
        adj[i].clear();
    }

    memset(dp, 0, sizeof(dp));
    memset(dis, 0, sizeof(dis));

    // 读入所有点
    while (cin >> a >> b) {
        int s = a, t = b;
        int p;
        if (m.find(Node(a, b)) != m.end()) {
            p = m[Node(a, b)];
        } else {
            p = cnt;
            m[Node(a, b)] = cnt;
            pos[p].x = a;
            pos[p].y = b;
            ++cnt;
        }
        while (true) {
            cin >> a >> b;
            if (a == -1 && b == -1) {
                break;
            }
            int p2;
            if (m.find(Node(a, b)) != m.end()) {
                p2 = m[Node(a, b)];
            } else {
                p2 = cnt;
                m[Node(a, b)] = cnt;
                ++cnt;
                pos[p2].x = a;
                pos[p2].y = b;
            }
            adj[p].push_back(p2);
            adj[p2].push_back(p);
            p = p2;
        }
    }

    // 计算距离
    for (int i = 0; i < cnt; ++i) {
        dis[i][i] = 0;
        for (int j = 0; j < i; ++j) {
            int dx = pos[i].x - pos[j].x;
            int dy = pos[i].y - pos[j].y;
            dis[i][j] = dis[j][i] = sqrt(1.0*dx*dx + 1.0*dy * dy);
        }
    }

    // 步行时间初始化
    for (int i = 0; i < cnt; ++i) {
        dp[i][i] = 0;
        for (int j = 0; j < i; ++j) {
            dp[i][j] = dp[j][i] = dis[i][j] * 60.0 / 10.0 / 1000.0;
        }
    }

    // 地铁初始化
    for (int i = 0; i < cnt; ++i) {
        int ss = i;
        for (auto j : adj[i]) {
            dp[ss][j] = dp[j][ss] = min(dis[ss][j] * 60.0 / 40.0 / 1000.0, dp[ss][j]);
            //ss = j;
        }
    }

    // Floyd
    for (int k = 0; k < cnt; ++k) {
        for (int i = 0; i < cnt; ++i) {
            for (int j = 0; j < cnt; ++j) {
                dp[i][j] = dp[j][i] = min(dp[i][j], dp[i][k] + dp[k][j]);
            }
        }
    }

    printf("%d\n", int(round(dp[0][1])));

    return 0;
}