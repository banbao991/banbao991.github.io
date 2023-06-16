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
#define MAXN 25
#define LL long long


int R, C;
char s[MAXN*MAXN / 5];
int m[MAXN][MAXN];
int val;
int now;
int bit;
int len;

bool no_char = false;
int tot;

void check() {
    ++tot;
    if (no_char) return;

    ++bit;
    if (bit == 5) {
        bit = 0;
        if (++now >= len) {
            no_char = true;
        }
        val = (s[now] == ' ') ? 0 : s[now] - 'A' + 1;
    }
}


#define GET_VAL (no_char ? 0 : ((val >> (4 - bit)) & 1))

int main() {

    scanf("%d %d", &R, &C);
    getchar();
    // gets_s(s); // VS2017
    gets(s); // OJ
    len = strlen(s);

    int l = 0, r = C - 1, u = 0, d = R - 1;

    val = (s[0] == ' ') ? 0 : s[0] - 'A' + 1;
    now = 0;
    bit = -1;

    int RC = R * C;
    tot = 0;
    while (tot < RC) {
        // 两个条件都得满足
        // 例子: 5 1 A
        if (r >= l && d >= u) {
            for (int i = l; i <= r; ++i) {
                check();
                m[u][i] = GET_VAL;
            }
            ++u;
        }

        if (r >= l && d >= u) {
            for (int i = u; i <= d; ++i) {
                check();
                m[i][r] = GET_VAL;
            }
            --r;
        }

        if (r >= l && d >= u) {
            for (int i = r; i >= l; --i) {
                check();
                m[d][i] = GET_VAL;
            }
            --d;
        }

        if (r >= l && d >= u) {
            for (int i = d; i >= u; --i) {
                check();
                m[i][l] = GET_VAL;
            }
            ++l;
        }
    }

    for (int i = 0; i < R; ++i) {
        for (int j = 0; j < C; ++j) {
            printf("%d", int(m[i][j]));
        }
    }
    printf("\n");
    return 0;
}