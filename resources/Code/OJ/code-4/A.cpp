#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory.h>
#include <stdio.h>
#include <map>
#include <stack>
#include <queue>
using namespace std;
#pragma warning (disable:4996)

#define INF 0x3f3f3f3f
#define MAXN 10

int main() {
    int a[MAXN];
    for (int i = 0; i < MAXN; ++i) {
        scanf("%d", a + i);
    }
    int h;
    scanf("%d", &h);
    h += 30;
    int ans = 0;
    for (int i = 0; i < MAXN; ++i) {
        if (a[i] <= h) {
            ++ans;
        }
    }
    printf("%d\n", ans);
    return 0;
}