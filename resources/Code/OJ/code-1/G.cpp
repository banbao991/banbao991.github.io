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

#define MAXN 50100
int parent[MAXN], relationship[MAXN]; // parent, relationship

// 0: 同类
// 1: 吃
// 2: 被吃

int m1[3][3] = {
    0,1,2,
    1,2,0,
    2,0,1,
};

int m2[3][3] = {
    0,1,2,
    2,0,1,
    1,2,0,
};

int getRoot(int x) {
    if (parent[x] != x) {
        int p = parent[x];
        parent[x] = getRoot(parent[x]);
        relationship[x] = m1[relationship[x]][relationship[p]];
    }
    return parent[x];
}

bool query(int val, int x, int y) {
    if (val == 1) {
        // 同类
        int p1 = getRoot(x), p2 = getRoot(y);
        // 已经能够推断出关系, 看是否为假
        if (p1 == p2) {
            // 和根的关系相同才能是同类
            return relationship[x] == relationship[y];
        } 
        // 不能推断出关系, 更新它
        else {
            parent[p1] = p2;
            // 求出 relationship
            int r1 = m1[0][relationship[y]];
            relationship[p1] = m2[relationship[x]][r1];
            return true;
        }
    }
    if (val == 2) {
        if (x == y) {
            // x 吃 x
            return false;
        } else {
            // x 吃 y
            int p1 = getRoot(x), p2 = getRoot(y);
            // 已经能够推断出关系, 看是否为假
            if (p1 == p2) {
                return m2[(3 - relationship[x]) % 3][(3 - relationship[y]) % 3] == 1;
            }
            // 不能推断出关系, 更新它
            else {
                parent[p1] = p2;
                // 求出 relationship
                int r1 = m1[1][relationship[y]];
                relationship[p1] = m2[relationship[x]][r1];
                return true;
            }
        }
    }
}

int main() {
    int N, K;
    scanf("%d %d", &N, &K);
    for (int i = 0; i < N; ++i) {
        parent[i] = i;
        relationship[i] = 0;
    }
    int ans = 0;
    for (int i = 0; i < K; ++i) {
        int v, x, y;
        scanf("%d %d %d", &v, &x, &y);
        // X 或 Y 比 N 大
        if (x > N || y > N) {
            ++ans;
            continue;
        }
        if (!query(v, x, y)) {
            ++ans;
        }
    }
    printf("%d\n", ans);
    return 0;
}
