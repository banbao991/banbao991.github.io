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
#define MAXN 105
#define LL long long

#define MAX_STATE (1 << 10)

int m[MAXN][15]; // 地图
int dp[2][MAX_STATE][MAX_STATE]; // 用于 dp

struct Node {
    int x, y;
    Node() {}
    Node(int _x, int _y) :x(_x), y(_y) {}
};

int main() {
    int M, N;
    memset(m, 0, sizeof(m));
    scanf("%d %d", &M, &N);
    getchar();
    for (int i = 0; i < M; ++i) {
        for (int j = 0; j < N; ++j) {
            char t;
            scanf("%c", &t);
            if (t == 'P') {
                m[i][j] = true;
            }
        }
        getchar();
    }

    // deal
    // TODO


    return 0;
}