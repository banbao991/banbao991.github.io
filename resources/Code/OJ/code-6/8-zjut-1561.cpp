/**********************************************************************
 * author:      banbao
 * language:    c++/c
 * bbq :        线段数组, 延迟更新
 **********************************************************************/

 /* library */
#include <iostream>
using namespace std;
#include <stdio.h>
#include <malloc.h>
#include <algorithm>
#include <cmath>
#include <string>
#include <string.h>
#include <math.h>
#include <memory.h>
#include <bitset>
#include <set>
#include <map>
#include <stack>
#include <queue>
#include <vector>
#include <ctime>
#include <iomanip>
#include <sstream>

/* micros */
#define lowbit(x) ((x)&(-x))
#define leftson(x) ((x<<1)+1)
#define rightson(x) ((x<<1)+2)
#define parent(x) ((x-1)>>1)
#define mid(x,y) (((x)+(y))>>1)

/* functions */
template<class T>
inline int ABS(T a) { return a < 0 ? -a : a; }
template<class T>
inline void MYSWAP(T &a, T &b) {
    T c = a;
    a = b;
    b = c;
}
void init();

/* pragmas */
#pragma warning(disable:4996)

/* const variables */
const int INF_INT = 1 << 25;
const double PI = acos((double)-1);
const double INF = 1e20;
const double EPS = 1e-6;
//freopen("test.txt", "w", stdout);

/* code start here */
#define tr t[root]
struct node {
    int l, r;
    int sum;
    int val;
    bool pass;
}t[400010];

int ans;
void Insert(int root, int l, int r, int val);

void Build(int root, int l, int r) {
    tr.l = l;
    tr.r = r;
    tr.sum = 0;
    tr.pass = false;
    if (l != r) {
        int m = mid(l, r);
        Build(leftson(root), l, m);
        Build(rightson(root), m + 1, r);
    }
}

void Query(int root, int l, int r) {
    if (tr.l == l && tr.r == r) {
        ans ^= tr.sum;
        return;
    }
    int m = mid(tr.l, tr.r);
    /* pass */
    if (tr.pass) {
        tr.pass = false;
        Insert(leftson(root), tr.l, m, tr.val);
        Insert(rightson(root), m + 1, tr.r, tr.val);
    }
    if (r <= m) Query(leftson(root), l, r);
    else if (l > m) Query(rightson(root), l, r);
    else {
        Query(leftson(root), l, m);
        Query(rightson(root), m + 1, r);
    }
     /* update(root); */
}

void Insert(int root, int l, int r, int val) {
    /* lazy */
    if (tr.l == l && tr.r == r) {
        tr.val = val;
        if ((r - l) & 1) tr.sum = 0;
        else tr.sum = val;
        if (l != r) tr.pass = true;/* lazy */
        return;
    }
    int m = mid(tr.l, tr.r);
    /* pass */
    if (tr.pass) {
        tr.pass = false;
        Insert(leftson(root), tr.l, m, tr.val);
        Insert(rightson(root), m + 1, tr.r, tr.val);
    }
    if (r <= m) Insert(leftson(root), l, r, val);
    else if (l > m) Insert(rightson(root), l, r, val);
    else {
        Insert(leftson(root), l, m, val);
        Insert(rightson(root), m + 1, r, val);
    }
    /* update */
    tr.sum = (t[leftson(root)].sum) ^ (t[rightson(root)].sum);
}

int main() {
    int N, n, q, l, r;
    long long val;
    char cmd[2];
    scanf("%d", &N);
    while (N--) {
        scanf("%d %d", &n, &q);
        Build(0, 1, n);
        for (int i = 1; i <= n; ++i) {
            scanf("%lld", &val);
            Insert(0, i, i, (int)val);
        }
        for (int i = 0; i < q; ++i) {
            scanf("%s", cmd);
            if (cmd[0] == 'C') {
                scanf("%d %d %lld", &l, &r, &val);
                Insert(0, l, r, (int)val);
            }
            else {
                ans = 0;
                scanf("%d %d", &l, &r);
                Query(0, l, r);
                printf("%u\n", ans);
            }
        }
        printf("\n");
    }
    system("pause");
    return 0;
}

void init() {
}