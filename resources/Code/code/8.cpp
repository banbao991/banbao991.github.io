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

#define MAXN 80100

// 链式前向星存储边
struct Edge {
    // v:   当前边的终点
    // next: 与当前边同起点的上一条边的位置
    int v, next;
    // w:    权重
    int w;
    Edge() {}
    Edge(int _v, int _next, int _w) :v(_v), next(_next), w(_w) {}
};

int dp[MAXN][30]; // dp[i][j] 保存当前结点 i 向上跳 2^j 的祖先
Edge edge[MAXN];  // 链式前向星存储边的方式保存树
int tot = 0;      // 当前一共的边数
int depth[MAXN];  // 深度
int dist[MAXN];    // 到根节点的距离
int fa[MAXN];     // 父结点
int head[MAXN];   // head[i] 保存的是以 i 为起点的所有边中编号最大的那个
// 顺着 head 一直查找, 能够找出所有的同起点的边, 且按照终点大小排序

void addEdge(int u, int v, int w) {
    edge[tot] = Edge(v, head[u], w);
    head[u] = tot++; // 当前边
    // 无向边
    edge[tot] = Edge(u, head[v], w);
    head[v] = tot++;
}


// 通过一遍深搜计算出计算如下数据结构
// 每一个点的深度 depth
// lca 辅助数组 dp
// 父结点数组 fa
// 到根的距离 dist 
void DFS(int u) {
    // 1. 构造 dp
    dp[u][0] = fa[u]; // 初始化
    // 查找到 u 的时候保证 u 的所有祖先结点数据结构都完整计算出来了
    for (int i = 1; i <= 20; ++i) {
        dp[u][i] = dp[dp[u][i - 1]][i - 1]; // 2^{i-1} + 2^{i-1} = 2^i
    }

    // 2. 遍历所有的 u 的后继结点
    // -1 表示结束
    for (int before = head[u]; ~before; before = edge[before].next) {
        int v = edge[before].v;
        // 因为我们是无向图，添加了两条边，树形结构中去掉其中一条
        // 构造 edge 的时候需要全加入，否则不同通过如上任意的方式构造出树来(还可能不能构造树)
        if (v == fa[u]) {
            continue;
        }
        // 2.1 构造 fa
        fa[v] = u;
        // 2.2 构造 depth
        depth[v] = depth[u] + 1;
        // 2.3 构造 dist
        dist[v] = dist[u] + edge[before].w;

        DFS(v);
    }
}

int LCA(int x, int y) {
    // 保证 x 为比较深的点
    if (depth[x] < depth[y]) {
        // swap(x, y)
        x ^= y;
        y ^= x;
        x ^= y;
    }
    // 让 x 沿着祖先路径向上跑，跑到离 y 最近的但是深度不大于 depth[y] 的点
    // 这里用到的知识就是任意一个数都可以表示为若干 2 的幂次的和(二进制表示)
    // 深度 < 2^20 (20 的选取有要求)
    /*
    // 方法 1
    for (int i = 20; i >= 0; --i) {
        if (depth[dp[x][i]] >= depth[y]) {
            x = dp[x][i];
        }
    }
    */
    
    // 方法 2，直接使用位运算
    int interval = depth[x] - depth[y];
    int cnt = 0;
    while (interval) {
        if (interval & 1) {
            x = dp[x][cnt];
        }
        interval >>= 1;
        ++cnt;
    }


    // 就是 y 点
    if (x == y) {
        return x;
    }
    // 一起向上跳
    // 这里的想法也是一样的
    // 当前深度和 lca(x,y) 的深度差可以表示未若干 2 的幂次的和
    for (int i = 20; i >= 0; --i) {
        if (dp[x][i] != dp[y][i]) {
            x = dp[x][i];
            y = dp[y][i];
        }
    }
    return dp[x][0];
}


int main() {
    int N, M;
    while (scanf("%d %d", &N, &M) != EOF) {
        memset(head, -1, sizeof(head)); // head 初始化为 -1(查到 -1 表示找完了)
        memset(dp, 0, sizeof(dp));
        memset(dist, 0, sizeof(dist));
        memset(depth, 0, sizeof(depth));

        int u, v, w;
        char c;
        // input 
        for (int i = 0; i < M; ++i) {
            scanf("%d %d %d %c", &u, &v, &w, &c);
            addEdge(u, v, w);
        }

        // 构造树，把结点 1 当作根节点
        fa[1] = 1;
        dist[1] = depth[1] = 0;
        DFS(1); // 题目条件是连通的

        // query
        scanf("%d", &M);
        while (M--) {
            int u, v;
            scanf("%d %d", &u, &v);
            printf("%d\n", dist[u] + dist[v] - 2 * dist[LCA(u, v)]);
        }
    }
    return 0;
}