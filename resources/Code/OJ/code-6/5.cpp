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
#define MAXN 150
#define LL long long


int main() {
    int T, M;
    scanf("%d %d", &T, &M);
    // aa: 当前月在 a 城市办公
    // bb: 当前月在 b 城市办公

    int a[MAXN], b[MAXN], aa[MAXN], bb[MAXN];
    memset(aa, 0, sizeof(aa));
    memset(bb, 0, sizeof(bb));
    
    for (int i = 0; i < T; ++i) {
        scanf("%d %d", &a[i], &b[i]);
    }
    aa[0] = a[0];
    bb[0] = b[0];
    for (int i = 1; i < T; ++i) {
        aa[i] = max(aa[i - 1], bb[i - 1] - M) + a[i];
        bb[i] = max(bb[i - 1], aa[i - 1] - M) + b[i];
    }

    printf("%d\n", max(aa[T - 1], bb[T - 1]));
    return 0;
}