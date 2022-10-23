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
#define MAXN 21

int main() {
    int a[MAXN];
    a[1] = 1;
    a[2] = 1;
    for (int i = 3; i < MAXN; ++i) {
        a[i] = a[i - 1] + a[i - 2];
    }
    int n;
    scanf("%d", &n);
    while (n--) {
        int t;
        scanf("%d", &t);
        printf("%d\n", a[t]);
    }
    return 0;
}