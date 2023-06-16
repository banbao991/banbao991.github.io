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
#define MAXN 10
#define LL long long

char m[MAXN][MAXN];
char p[MAXN];
int N, K;
int tot;

// level: 放第几个棋子
// row:   放第几行
void dfs(int level, int row) {
    if (level == K) {
        ++tot;
        return;
    }

    for (int i = 0; i < N; ++i) {
        if (m[row][i] == '#') {
            int j = 0;
            for (; j < row; ++j) {
                if (p[j] == i) {
                    break;
                }
            }
            if (j == row) {
                p[row] = i;
                dfs(level + 1, row + 1);
            }
        }
    }

    if (N - row > K - level) {
        p[level] = -1;
        dfs(level, row + 1);
    }
}

int main() {
    while (scanf("%d %d", &N, &K) != EOF && N != -1 && K != -1) {
        tot = 0;
        getchar();
        for (int i = 0; i < N; ++i) {
            for (int j = 0; j < N; ++j) {
                scanf("%c", &m[i][j]);
            }
            getchar();
        }

        for (int i = 0; i < N; ++i) {
            // 还可以不放这一行
            if (m[0][i] == '#') {
                p[0] = i;
                dfs(1, 1);
            }
        }
        if (N > K) {
            p[0] = -1;
            dfs(0, 1);
        }
        printf("%d\n", tot);
    }
    return 0;
}