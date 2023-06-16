#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory.h>
#include <stdio.h>
#include <map>
using namespace std;
#pragma warning (disable:4996)

int dp1[55][55][55];
int dp2[55][55][55];
int dp3[55][55][55];

int dfs1(const int n, const int k, const int min_val) {
    if (k == 1) return 1;
    if (dp1[n][k][min_val]) return dp1[n][k][min_val];


    int ret = 0;
    for (int i = min_val; ; ++i) {
        int should = i * (k - 1);
        int left = n - i;
        if (should > left)  break;
        else if (should == left) ++ret;
        else ret += dfs1(left, k - 1, i);
    }
    dp1[n][k][min_val] = ret;
    return ret;
}

int dfs2(const int n, const int k, const int min_val) {
    if (k == 1) return 1;
    if (dp2[n][k][min_val]) return dp2[n][k][min_val];

    int ret = 0;
    for (int i = min_val; ; ++i) {
        int should = (i + 1) * (k - 1);
        int left = n - i;
        // 只是一个剪枝, 不能唯一确定
        if (should > left) {
            break;
        } else {
            // 数不能一样
            ret += dfs2(left, k - 1, i + 1);
        }
    }

    dp2[n][k][min_val] = ret;
    return ret;
}


int dfs3(int n, int k, int min_val) {
    if (k == 1) return n & 1;
    if (dp3[n][k][min_val]) return dp3[n][k][min_val];

    int ret = 0;
    for (int i = min_val; ; i += 2) {
        int should = i * (k - 1);
        int left = n - i;
        if (should > left) {
            break;
        } else if (should == left) {
            ++ret;
        } else {
            ret += dfs3(left, k - 1, i);
        }
    }
    dp3[n][k][min_val] = ret;
    return ret;
}

int main() {
    int N, K;
    memset(dp1, 0, sizeof(dp1));
    memset(dp2, 0, sizeof(dp2));
    memset(dp3, 0, sizeof(dp3));
    while (cin >> N >> K) {
        // N 划分成 K 个正整数之和的划分数目
        if (N < K) {
            cout << 0 << endl;
        } else if (N == K) {
            cout << 1 << endl;
        } else {
            cout << dfs1(N, K, 1) << endl;
        }

        // N 划分成若干个不同正整数之和的划分数目
        int ans = 0;
        for (int i = 1; i < N; ++i) {
            ans += dfs2(N, i, 1);
        }
        // 数不能相同, 除非只有 1 个
        if (N == 1) ++ans;
        cout << ans << endl;

        // N 划分成若干个奇正整数之和的划分数目
        ans = 0;
        // 要么全是奇数, 要么全是偶数
        for (int i = ((N & 1) ? 1 : 2); i < N; i += 2) {
            ans += dfs3(N, i, 1);
        }
        // 划分为 N 个 1
        ++ans;
        cout << ans << endl;
    }
    return 0;
}