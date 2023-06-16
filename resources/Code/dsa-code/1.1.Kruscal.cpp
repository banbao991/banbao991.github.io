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
#define MAXN 27

struct Edge {
    int s, t, w;
    Edge() {}
    Edge(int _s, int _t, int _v) :s(_s), t(_t), w(_v) {}
    bool operator < (const Edge &e) const {
        return w > e.w;
    }
};

int p[MAXN];

int getRoot(int i) {
    if (p[i] != i) {
        p[i] = getRoot(p[i]);
    }
    return p[i];
}

// Kruscal
int main() {
    int N;
    priority_queue<Edge> Q;
    while (!Q.empty()) { Q.pop(); }
    for (int i = 0; i < MAXN; ++i) {
        p[i] = i;
    }
    scanf("%d", &N);
    for (int i = 1; i < N; ++i) {
        getchar();
        char sc, s;
        scanf("%c", &sc);
        s = sc - 'A';
        
        int num;
        scanf("%d", &num);

        while (num--) {
            getchar();
            char t;
            int w;
            scanf("%c %d", &t, &w);
            Q.push(Edge(s, t - 'A', w));
        }
    }

    int total = 0;
    bool OK;
    for (int i = 1; i < N; ++i) {
        OK = false;
        while (!Q.empty()) {
            Edge e = Q.top();
            Q.pop();
            if (getRoot(e.s) != getRoot(e.t)) {
                p[p[e.s]] = p[e.t]; // 注意这里是把 p[e.s] 挂到 p[e.t] 上
                total += e.w;
                OK = true;
                break;
            }
        }
        if (!OK) {
            printf("ERROR\n");
            return 0;
        }
    }

    printf("%d\n", total);

    return 0;
}