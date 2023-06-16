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


bool cmp(int a, int b) {
    return a > b;
}

int A[5][27];
int s[15];
int target;
int length;

int arr[5];
int ans[5];
bool OK;

void dfs(int seq) {
    if (seq == 5) {
        if (A[0][arr[0]]- A[1][arr[1]] + A[2][arr[2]] - A[3][arr[3]] + A[4][arr[4]] == target) {
            OK = true;
            for (int i = 0; i < 5; ++i) {
                ans[i] = arr[i];
            }
        }
        return;
    }
    // deal
    for (int i = 0; i < length; ++i) {
        int j = 0;
        int c = s[i];
        for (; j < seq; ++j) {
            if (c == arr[j]) {
                break;
            }
        }
        if (j != seq) {
            continue;
        }
        arr[seq] = s[i];
        dfs(seq + 1);
        if (OK) {
            return;
        }
    }
}



int main() {
    // 预处理
    for (int i = 1; i <= 26; ++i) {
        A[0][i] = i;
    }
    for (int i = 1; i < 5; ++i) {
        for (int j = 1; j <= 26; ++j) {
            A[i][j] = A[i - 1][j] * j;
        }
    }

    // 输入
    char str[15];
    while (scanf("%d %s", &target, str) && target) {
        OK = false;
        length = strlen(str);
        for (int i = 0; i < length; ++i) {
            s[i] = str[i] - 'A' + 1;
        }
        sort(s, s + length, cmp);

        // deal
        for (int i = 0; i < length; ++i) {
            arr[0] = s[i];
            dfs(1);
            if (OK) {
                break;
            }
        }
        if (OK) {
            for (int i = 0; i < 5; ++i) {
                printf("%c", ans[i] + 'A' - 1);
            }
            printf("\n"); 
        } else {
            printf("no solution\n");
        }
    }
    
    return 0;
}