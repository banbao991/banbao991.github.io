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

#define MAXN 50100


int main() {
    int N;
    scanf("%d", &N);
    char str[200];
    for (int i = 0; i < N; ++i) {
        scanf("%s", str);
        int ans = 1, start = 0;
        int len = strlen(str);
        for (int i = 0; i < len; ++i) {
            if (len - i <= ans) {
                break;
            }
            for (int j = i + ans; j < len; ++j) {
                // [i, j]
                int times = (j - i + 1) >> 1;
                int k = 0;
                for (; k < times; ++k) {
                    if (str[i + k] != str[j - k]) {
                        break;
                    }
                }
                if (k == times) {
                    ans = j - i + 1;
                    start = i;
                }
            }
        }
        str[start + ans] = 0;
        printf("%s\n", str + start);
    }
    return 0;
}