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

#define inf 0x3f3f3f3f
#define MAXN 105

int is4(int year) {
    if (year % 4) return 0;
    if (year % 100) return 1;
    return !(year % 400);
}


// PE: 9/10
int main() {
    int year, month;
    while (~scanf("%d %d", &year, &month)) {
        // 1900.1.1 => Mon
        // 暴力模拟
        int dist = 0;
        for (int i = 1900; i < year; ++i) {
            dist += 365;
            dist += is4(i);
        }
        const int months[] = {
            31,28,31,30,31,30,31,31,30,31,30,31,
        };
        for (int i = 1; i < month; ++i) {
            dist += months[i - 1];
        }
        dist += (month >= 3 ? 1 : 0) * is4(year);
        // 判断 1 号周几
        int first = (dist + 1) % 7;
        //printf("%d\n", first);

        // output
        printf("Sun Mon Tue Wed Thu Fri Sat\n");
        char tab[] = "    ";
        int day_end = months[month - 1];
        if ((month == 2) && is4(year)) {
            ++day_end;
        }
        int day_cnt = 1;
        int cnt = 0;
        for (; cnt < first; ++cnt) {
            printf("%s", tab + (cnt == 0));
        }
        while (day_cnt <= day_end) {
            ++cnt;
            if (cnt == 8) {
                printf("\n");
                cnt = 1;
            }
            if (cnt == 1) {
                printf("%3d", day_cnt);
            } else {
                printf("%4d", day_cnt);
            }
            ++day_cnt;
        }
        printf("\n");
    }
    return 0;
}