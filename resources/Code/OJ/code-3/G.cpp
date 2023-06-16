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
#define MAXN 15

int main() {
    int N;
    priority_queue<int, vector<int>, greater<int>> Q;
    scanf("%d", &N);
    while (N--) {
        int type;
        scanf("%d", &type);
        if (type == 1) {
            int t;
            scanf("%d", &t);
            Q.push(t);
        } else if (type == 2) {
            printf("%d\n", Q.top());
            Q.pop();
        }
    }
    return 0;
}