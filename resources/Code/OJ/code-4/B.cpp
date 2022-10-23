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
#define MAXN 30

int main() {
    int a[MAXN];
    int n;
    int k = 0;
    while (scanf("%d", &n) && n) {
        a[k++] = n;
    }
    n = 0;
    for (int i = 0; i < k; ++i) {
        for (int j = 0; j < i; ++j) {
            if ((a[i] == 2 * a[j]) || (a[j] == 2 * a[i])) {
                ++n;
            }
        }
    }
    printf("%d\n", n);
    return 0;
}