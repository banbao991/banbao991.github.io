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
#define MAXN 200050
#define LL long long

int N;
int N2;
int q1;
int q2;
vector<string> vec;
string tmp;

void dfs(int l, int end) {
    if (end == N2) {
        vec.push_back(tmp);
        return;
    }

    if (q1) {
        --q1;
        tmp.push_back('(');
        dfs(l + 1, end + 1);
        tmp.pop_back();
        ++q1;
    }
    if (q2 && l) {
        --q2;
        tmp.push_back(')');
        dfs(l - 1, end + 1);
        tmp.pop_back();
        ++q2;
    }
}

int main() {
    scanf("%d", &N);

    vec.clear();
    q1 = N;
    q2 = N;
    N2 = N * 2;
    tmp = "";
    dfs(0, 0);
    sort(vec.begin(), vec.end());
    for (auto i : vec) {
        cout << i << endl;
    }


    return 0;
}