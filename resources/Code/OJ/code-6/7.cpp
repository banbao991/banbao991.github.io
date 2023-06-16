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
#include <stdlib.h>
using namespace std;
#pragma warning (disable:4996)

#define INF 0x3f3f3f3f
#define MAXN 35
#define LL long long

int main() {
    string str[MAXN];
    int len = 0;
    cin >> str[len++] >> str[len++];
    while (cin >> str[len++]) {
        //if (str[len] == str[0] || str[len] == str[1]) {
        //    --len;
        //}
    }
    --len;

    int dp[MAXN][MAXN];
    memset(dp, -1, sizeof(dp));

    int str_len = str[0].size();

    for (int i = 0; i < len; ++i) {
        dp[i][i] = 0;
        for (int j = 0; j < i; ++j) {
            // 判断
            int diff = 0;
            string &a = str[i], &b = str[j];
            for (int k = 0; k < str_len; ++k) {
                diff += (a[k] != b[k]);
            }
            if (diff == 1) {
                dp[i][j] = dp[j][i] = 1;
            }
        }
    }

    // 最短路
    for (int k = 0; k < len; ++k) {
        for (int i = 0; i < len; ++i) {
            for(int j = 0; j < len; ++j) {
                if (dp[i][k] != -1 && dp[k][j] != -1) {
                    int new_dis = dp[i][k] + dp[k][j];
                    if (dp[i][j] == -1) {
                        dp[i][j] = new_dis;
                    } else {
                        dp[i][j] = min(dp[i][j], new_dis);
                    }
                }
            }
        }
    }

    printf("%d\n", dp[0][1] + 1);
    return 0;
}