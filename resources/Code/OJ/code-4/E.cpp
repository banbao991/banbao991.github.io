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
#define MAXN 105

int main() {
    int x, y;
    scanf("%d %d", &x, &y);
    while (x != y) {
        while (x > y) {
            x >>= 1;
        }
        while (y > x) {
            y >>= 1;
        }
    }
    printf("%d\n", x);
    return 0;
}