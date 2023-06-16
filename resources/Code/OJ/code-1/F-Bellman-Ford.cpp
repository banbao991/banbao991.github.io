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
struct Edge {
    int s, t, w;
    Edge() {}
    Edge(int _s, int _t, int _w) :s(_s), t(_t), w(_w) {}
};
#define MAXN 105
Edge edge[MAXN*MAXN];
int main() {
    int dp[MAXN];
    memset(dp, -1, sizeof(dp));
    int N, A, B;
    int cnt = 0;
    scanf("%d %d %d", &N, &A, &B);
    for (int i = 1; i <= N; ++i) {
        int num, t;
        scanf("%d", &num);
        if(num) {
            scanf("%d", &t);
            edge[cnt++] = Edge(i, t, 0);
            while (--num) {
                scanf("%d", &t);
                edge[cnt++] = Edge(i, t, 1);
            }
        }
    }

    dp[A] = 0;
    // Bellman-Ford
    for (int i = 1; i <= N; ++i) {
        for (int j = 0; j < cnt;++j) {
            Edge &e = edge[j];
            if (dp[e.s] != -1) {
                int t = dp[e.s] + e.w;
                if (dp[e.t] == -1) {
                    dp[e.t] = t;
                } else {
                    dp[e.t] = min(dp[e.t], t);
                }
            }
        }
    }
    
    printf("%d\n", dp[B]);

    return 0;
}
