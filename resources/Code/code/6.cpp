#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory.h>
#include <stdio.h>
#include <map>
#include <stack>
using namespace std;
#pragma warning (disable:4996)

int dp[35][35];
int pre[35][35];

struct node {
    int n, dis;
};

int main() {
    memset(dp, -1, sizeof(dp));
    memset(pre, -1, sizeof(pre));

    map<string, int> m;
    m.clear();
    vector<string> name;
    name.clear();
    int P, Q, R;
    string s;

    cin >> P;
    for (int i = 0; i < P; ++i) {
        cin >> s;
        name.push_back(s);
        m[s] = i;
    }

    string s2;
    int t;
    cin >> Q;
    for (int i = 0; i < Q; ++i) {
        cin >> s >> s2 >> t;
        int ss = m[s], ss2 = m[s2];
        dp[ss][ss2] = t;
        dp[ss2][ss] = t;
        pre[ss][ss2] = ss;
        pre[ss2][ss] = ss2;
    }

    for (int i = 0; i < P; ++i) {
        dp[i][i] = 0;
        pre[i][i] = i;
    }
    // Floyd
    for (int k = 0; k < P; ++k) {
        for (int i = 0; i < P; ++i) {
            if (i == k) continue;
            for (int j = 0; j < P; ++j) {
                if (j == k) continue;
                if (dp[i][k] != -1 && dp[k][j] != -1) {
                    int new_dis = dp[i][k] + dp[k][j];
                    if (dp[i][j] == -1 || new_dis < dp[i][j]) {
                        dp[i][j] = new_dis;
                        pre[i][j] = k;
                    }
                }
            }
        }
    }
    stack<node> sta;
    while (!sta.empty()) sta.pop();
    cin >> R;
    for (int i = 0; i < R; ++i) {
        cin >> s >> s2;
        int a = m[s], b = m[s2];
        while (a != b) {
            node t;
            t.dis = dp[pre[a][b]][b];
            t.n = b;
            sta.push(t);
            b = pre[a][b];
        }
        cout << s;
        while (!sta.empty()) {
            node t = sta.top();
            sta.pop();
            cout << "->(" << t.dis << ")->" << name[t.n];
        }
        cout << endl;
    }


    return 0;
}