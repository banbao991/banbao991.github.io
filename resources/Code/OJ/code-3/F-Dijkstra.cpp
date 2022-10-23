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
    int t, f;
    Edge() {}
    Edge(int _t, int _f) :t(_t), f(_f) {}
};
int p[MAXN];
vector<vector<Edge>> edge;
int dp[MAXN][MAXC];
int vis[MAXN][MAXC];

struct Node {
    int s, val, cost;
    Node() {}
    Node(int _s, int _val, int _cost) :s(_s), val(_val), cost(_cost) {}

    bool operator < (const Node &n) const {
        return cost > n.cost;
    }
};

void dijkstra() {
    memset(dp, -1, sizeof(dp));
    memset(vis, 0, sizeof(vis));
    int s, t, f;
    scanf("%d %d %d", &f, &s, &t);
    priority_queue<Node> Q;
    while (!Q.empty()) { Q.pop(); }

    // 初始化
    Q.push(Node(s, 0, 0));
    dp[s][0] = 0;

    while (!Q.empty()) {
        Node node = Q.top();
        Q.pop();
        // 如果已经被更新, 则忽略(因为未删除堆中元素)
        if (vis[node.s][node.val]) { continue; }

        // 找到结果马上结束
        if (node.s == t) {
            printf("%d\n", node.cost);
            return;
        }

        vis[node.s][node.val] = true;
        // 更新其他点
        // 1. 加油
        if (node.val < f) {
            int now = dp[node.s][node.val] + p[node.s];
            int old = dp[node.s][node.val + 1];
            if (old == -1 || now < old) {
                vis[node.s][node.val + 1] = false;
                dp[node.s][node.val + 1] = now;
                Q.push(Node(node.s, node.val + 1, now));
            }
        }

        // 2. 到其他点
        for (Edge e : edge[node.s]) {
            int left = node.val - e.f;
            // 没油跑不到
            if (left < 0) {
                continue;
            }
            int now = dp[node.s][node.val];
            int old = dp[e.t][left];
            if (old == -1 || now < old) {
                vis[e.t][left] = false;
                dp[e.t][left] = now;
                Q.push(Node(e.t, left, now));
            }
        }
    }

    // 输出结果
    int ans = dp[t][0];
    for (int i = 1; i <= f; ++i) {
        if (dp[t][i] != -1 && dp[t][i] < ans) {
            ans = dp[t][i];
        }
    }
    if (ans != -1) {
        printf("%d\n", ans);
    } else {
        printf("impossible\n");
    }
}

int main() {
    int m, n;
    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; ++i) {
        scanf("%d", p + i);
    }
    // 初始化邻接表
    edge.resize(n);
    for (int i = 0; i < n; ++i) {
        edge[i].clear();
    }
    int cnt = 0;
    for (int i = 0; i < m; ++i) {
        int s, t, f;
        scanf("%d %d %d", &s, &t, &f);
        edge[s].push_back(Edge(t, f));
        edge[t].push_back(Edge(s, f));
    }

    int q;
    scanf("%d", &q);
    while (q--) {
        dijkstra();
    }
    return 0;
}