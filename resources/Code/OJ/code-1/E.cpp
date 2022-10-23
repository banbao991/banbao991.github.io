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
#define MAXNN 100

long long ans = 0;

void merge(int *p, int *q, int l, int r) {
    int mid = (l + r) >> 1;
    int i = l, j = mid + 1, k = l;

    // 计算
    while (i <= mid && j <= r) {
        if (p[i] > 2 * p[j]) {
            ans += (mid - i + 1);
            ++j;
        } else {
            ++i;
        }
    }

    // 归并
    i = l;
    j = mid + 1;
    k = l;
    while (i <= mid && j <= r) {
        if (p[i] <= p[j]) {
            q[k++] = p[i++];
        } else {
            q[k++] = p[j++];
        }
    }
    while (i <= mid) {
        q[k++] = p[i++];
    }
    while (j <= r) {
        q[k++] = p[j++];
    }
    for (i = l; i <= r; ++i) {
        p[i] = q[i];
    }
}

void mergeSort(int *p, int *q, int l, int r) {
    if (l < r) {
        int mid = (l + r) >> 1;
        mergeSort(p, q, l, mid);
        mergeSort(p, q, mid + 1, r);
        merge(p, q, l, r);
    }
}

int main() {
    int N;
    while (scanf("%d", &N) != EOF && N) {
        ans = 0;
        int *p = new int[N];
        int *q = new int[N];
        // input
        for (int i = 0; i < N; ++i) {
            scanf("%d", p + i);
        }
        mergeSort(p, q, 0, N - 1);
        printf("%lld\n", ans);
        /*
        for (int i = 0; i < N; ++i) {
            printf("%d ", p[i]);
        }
        printf("\n");
        */
        delete[] q;
        delete[] p;
    }
    return 0;
}
