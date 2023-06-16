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
#define MAXN 3100
#define LL long long


LL a[MAXN];

int main() {
    int N;
    scanf("%d", &N);
    LL last, now;
    scanf("%lld", &last);
    --N;
    for (int i = 0; i < N; ++i) {
        scanf("%lld", &now);
        a[i] = abs(now - last);
        last = now;
    }
    sort(a, a + N);
    for (int i = 0; i < N; ++i) {
        if (a[i] != i + 1) {
            printf("Not jolly\n");
            return 0;
        }
    }

    printf("Jolly\n");
    return 0;
}