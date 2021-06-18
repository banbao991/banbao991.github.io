#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory.h>
using namespace std;

// 记忆化搜索
int ans[15][15];

int apple(int m, int k) {
    // 递归出口
    if (m < 0)  return 0;
    if (m == 0) return 1;
    if (k == 1) return 1;

    // 记忆化
    if (ans[m][k]) return ans[m][k];

    int ret = apple(m - k, k) + apple(m, k - 1);
    ans[m][k] = ret;
    return ret;
}

int main() {
    int t;
    cin >> t;
    memset(ans, 0, sizeof(ans));
    while (t--) {
        int m, k;
        cin >> m >> k;
        cout << apple(m, k) << endl;
    }
    return 0;
}