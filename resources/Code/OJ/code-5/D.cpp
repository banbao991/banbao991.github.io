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

int a[MAXN];
int b[MAXN];

int main() {
    int N;
    scanf("%d", &N);
    for (int i = 0; i < N; ++i) {
        scanf("%d", &a[i]);
        b[i] = a[i];
    }

    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < i; ++j) {
            if (a[j] < a[i]) {
                int tt = b[j] + a[i];
                if (tt > b[i]) {
                    b[i] = tt;
                }
            }
        }
    }
    
    int ans = b[0];
    for (int i = 1; i < N; ++i) {
        if (b[i] > ans) {
            ans = b[i];
        }
    }

    printf("%d\n", ans);

    return 0;
}