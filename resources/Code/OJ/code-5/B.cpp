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
using namespace std;
#pragma warning (disable:4996)

#define INF 0x3f3f3f3f
#define MAXN 3100
#define LL long long

const char* a[] = {
    "pop", "no", "zip", "zotz", "tzec", "xul", "yoxkin", "mol", "chen",
    "yax", "zac", "ceh", "mac", "kankin", "muan", "pax","koyab", "cumhu",
    "uayet"
};

const char* b[] = {
    "imix", "ik", "akbal", "kan", "chicchan", "cimi", "manik", "lamat", "muluk", "ok",
    "chuen", "eb", "ben", "ix", "mem", "cib", "caban", "eznab", "canac", "ahau"
};

int main() {
    map<string, int> a2m;
    a2m.clear();
    for (int i = 0; i < 19; ++i) {
        a2m[string(a[i])] = i;
    }

    int N;
    scanf("%d", &N);
    printf("%d\n", N);

    //int cnt = -1;
    while (N--) {
        //++cnt;
        int d;
        char m[10];
        int y;
        float tt;

        scanf("%f", &tt);
        d = int(tt);
        scanf("%s %d", m, &y);
        
        //y = cnt / (18 * 20 + 5);
        //strcpy(m, a[(cnt - y * (18 * 20 + 5)) / 20]);
        //d = (cnt - y * (18 * 20 + 5)) % 20;
        //printf("%d. %s %d           ", d, m, y);


        int tot = y * (18 * 20 + 5) + (a2m[string(m)]) * 20 + d;
        int yy = tot / (13 * 20);
        tot -= yy * (13 * 20);
        printf("%d %s %d\n", (tot % 13) + 1, b[(tot % 20)], yy);

    }

    return 0;
}