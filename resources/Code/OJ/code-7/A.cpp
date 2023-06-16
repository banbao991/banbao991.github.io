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
#define MAXN 200
#define LL long long

int m[MAXN][MAXN];
int N;

int tot;
int tot2;
int dx[] = { -1,0,1,0 };
int dy[] = { 0,1,0,-1 };

int main() {
    scanf("%d", &N);
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            scanf("%d", &m[i][j]);
        }
    }
    int a1 = 0, a2 = 0;
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            if (m[i][j] <= 50) {
                ++a1;
                for (int k = 0; k < 4; ++k) {
                    int xx = i + dx[k];
                    int yy = j + dy[k];
                    if (xx < N && xx >= 0 && yy < N && yy >= 0) {
                        if (m[xx][yy] > 50) {
                            ++a2;
                            break;
                        }
                    } else {
                        ++a2;
                        break;
                    }
                }
            }
        }
    }

    printf("%d %d\n", a1, a2);
    return 0;
}