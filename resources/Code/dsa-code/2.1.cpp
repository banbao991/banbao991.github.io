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
#define MAXN 100

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    vector<vector<int>> adj;
    adj.resize(n+1);
    for (int i = 0; i <= n; ++i) {
        adj[i].clear();
    }
    
    int *degree = new int[n + 1];
    for (int i = 0; i <= n; ++i) {
        degree[i] = 0;
    }


    while (m--) {
        int s, t;
        scanf("%d %d", &s, &t);
        adj[s].push_back(t);
        ++degree[t];
    }
    
    int *vis = new int[n + 1];
    for (int i = 0; i <= n; ++i) {
        vis[i] = 0;
    }

    int cnt = 0;

    queue<int> ans;
    while (!ans.empty()) { ans.pop(); }

    priority_queue<int, vector<int>, greater<int>> Q;
    while (!Q.empty()) { Q.pop(); }
    
    // 预处理
    for (int i = 1; i <= n; ++i) {
        if (degree[i] == 0) {
            Q.push(i);
        }
    }

    while (cnt != n && !Q.empty()) {
        int s = Q.top();
        Q.pop();
        if (vis[s]) {
            continue;
        }
        vis[s] = true;
        ans.push(s);
        ++cnt;

        for (int t : adj[s]) {
            if (vis[t]) { continue; }
            if (--degree[t] == 0) {
                Q.push(t);
            }
        }
    }

    if (cnt != n) {
        printf("ERROR\n");
    } else {
        while (!ans.empty()) {
            printf("v%d ", ans.front());
            ans.pop();
        }
    }
    printf("\n");


    delete degree;
    delete vis;

    return 0;
}