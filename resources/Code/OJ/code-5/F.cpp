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
#define MAXN 1050
#define LL long long

struct Node {
    int x, y;
    int ok;
};

Node node[MAXN];
int connect[MAXN][MAXN]; // 邻接表, a[x][0] 保存相邻元素个数
int p[MAXN];

int getRoot(int i) {
    if (p[i] != i) {
        p[i] = getRoot(p[i]);
    }
    return p[i];
}

int main() {
    memset(connect, 0, sizeof(connect));
    int N, D;
    scanf("%d %d", &N, &D);

    D *= D;
    for (int i = 1; i <= N; ++i) {
        scanf("%d %d", &node[i].x, &node[i].y);
        node[i].ok = false;
    }
    for (int i = 1; i <= N; ++i) {
        for (int j = 1; j < i; ++j) {
            int x = node[i].x - node[j].x, y = node[i].y - node[j].y;
            if ((x * x + y * y) <= D) {
                int len = ++connect[i][0];
                connect[i][len] = j;
                len = ++connect[j][0];
                connect[j][len] = i;
            }
        }
    }

    // 并查集
    for (int i = 1; i <= N; ++i) {
        p[i] = i;
    }
    char op;
    getchar();
    while (scanf("%c", &op) != EOF) {
        if (op == 'O') {
            int index;
            scanf("%d", &index);
            node[index].ok = true;
            int len = connect[index][0];
            for (int i = 1; i <= len; ++i) {
                int j = connect[index][i];
                if (node[j].ok) {
                    getRoot(index);
                    p[p[index]] = getRoot(p[j]);
                }
            }
        } else {
            int i, j;
            scanf("%d %d", &i, &j);
            if (getRoot(i) == getRoot(j)) {
                printf("SUCCESS\n");
            } else {
                printf("FAIL\n");
            }
        }

        getchar();
    }
    return 0;
}