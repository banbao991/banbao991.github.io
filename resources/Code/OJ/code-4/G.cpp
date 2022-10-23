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
#define MAXN 25

int main() {
    int N;
    while (scanf("%d", &N) != EOF && N) {
        // 结果就是最早到的同学花费的时间
        int v, t;
        double ans = 10e10;
        double tt = 4.5 * 3600;
        for (int i = 0; i < N; ++i) {
            scanf("%d\t%d", &v, &t);
            // 如果他是第一个到的, 那么不会和他一起(没遇见)
            // 如果不是第一个到的, 那就不用管他
            if (t < 0) {
                continue;
            }
            double cost = tt / v + t;
            ans = min(cost, ans);
        }
        printf("%d\n", (int)ceil(ans));
    }
    return 0;
}