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


int month[13] = { 0,31,28,31,30,31,30,31,31,30,31,30,31 };

// 是不是闰年
bool is4(int year) {
    if (year % 4 != 0)  return false;
    if (year % 100 != 0) return true;
    return (year % 400 == 0);
}

// 是今年的第几天
int dis11(int a[3]) {
    int res = month[a[1] - 1] + a[2] + (is4(a[0]) && a[1] >= 3);
    return res;
}

int main() {
    for (int i = 2; i <= 12; ++i) {
        month[i] += month[i - 1];
    }
    int a[3], b[3];
    scanf("%d %d %d", a, a + 1, a + 2);
    scanf("%d %d %d", b, b + 1, b + 2);
    // 输入保证 a < b
    int r1 = dis11(a), r2 = dis11(b);
    int ans = 0;
    if (a[0] == b[0]) {
        ans = r2 - r1;
    } else {
        ans = 365 - r1 + r2;
        if (is4(a[0])) {
            ++ans;
        }
        // 暴力枚举
        for (int i = a[0] + 1; i < b[0]; ++i) {
            ans += 365 + is4(i);
        }
    }
    printf("%d\n", ans);
    return 0;
}