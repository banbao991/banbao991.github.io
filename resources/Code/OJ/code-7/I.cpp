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
#define MAXN 200050
#define LL long long

int a[MAXN];
int b[MAXN];

int N;
LL ans;

void add(int l, int r) {
    int m = (l + r) >> 1;

    int i = l;
    int j = m + 1;
    int k = l;
    while (i <= m && j <= r) {
        if (a[i] > 2*a[j]) {
            ans += (m - i + 1);
            ++j;
        } else {
            ++i;
        }
    }

    ///////////////////


    i = l;
    j = m + 1;
    k = l;
    while (i <= m && j <= r) {
        if (a[i] < a[j]) {
            b[k++] = a[i++];
        } else {
            b[k++] = a[j++];
        }
    }

    while (i <= m) {
        b[k++] = a[i++];
    }
    while (j <= r) {
        b[k++] = a[j++];
    }
    for (i = l; i <= r; ++i) {
        a[i] = b[i];
    }
}

void merge(int l, int r) {
    if (l >= r) {
        return;
    }
    int m = (l + r) >> 1;
    merge(l, m);
    merge(m + 1, r);
    add(l, r);
}

int main() {
    while (true) {
        scanf("%d", &N);
        if (N == 0) {
            break;
        }
        ans = 0;
        for (int i = 0; i < N; ++i) {
            scanf("%d", &a[i]);
        }
        merge(0, N - 1);
        printf("%lld\n", ans);
    }
    return 0;
}