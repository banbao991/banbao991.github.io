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

struct Node {
    int Q_num, Period, val;
    Node() {}
    Node(int q, int p) :Q_num(q), Period(p), val(p) {}
    bool operator < (const Node &b) const {
        if (val != b.val) {
            return val > b.val;
        } 
        return Q_num > b.Q_num;
    }
};

int main() {
    char str[20];
    int cnt = 0;
    int a, b;
    priority_queue<Node> Q;
    while (!Q.empty()) Q.pop();
    while (scanf("%s", &str) != EOF && str[0] != '#') {
        scanf("%d %d", &a, &b);
        Q.push(Node(a, b));
    }
    int K;
    scanf("%d", &K);
    for (int i = 0; i < K; ++i) {
        Node n = Q.top();
        printf("%d\n", n.Q_num);
        Q.pop();
        n.val += n.Period;
        Q.push(n);
    }
    return 0;
}