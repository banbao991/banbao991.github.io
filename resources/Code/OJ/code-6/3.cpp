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
#define MAXN 10050
#define LL long long
double a[MAXN];

int main() {
    int N, K;
    double max_val = 0.0f;
    scanf("%d %d", &N, &K);
    for (int i = 0; i < N; ++i) {
        scanf("%lf", &a[i]);
        max_val = max(max_val, a[i]);
    }

    sort(a, a + N);

    // 二分
    double l = 0.005f, r = max_val;
    while (r - l > 1e-7f && r >= 0.01f) {
        int tot = 0;
        double m = (l + r) / 2;
        for (int i = N - 1; i >= 0; --i) {
            int t = int(a[i] / m);
            if (t == 0 || tot >= K) {
                break;
            }
            tot += t;
        }
        if (tot >= K) {
            l = m;
        } else {
            r = m;
        }
    }

    if (r < 0.01f) {
        r = 0.00f;
    }
    printf("%.2f\n", floor(r * 100) / 100);
    return 0;
}