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
#define MAXN 150
#define LL long long

struct Node1 {
    int seq;
    string str;
    Node1() {}
    Node1(int _s, string _str) :seq(_s), str(_str) {}
    bool operator < (const Node1 &b) const {
        if (str.size() != b.str.size()) {
            return str.size() > b.str.size();
        } else {
            return seq < b.seq;
        }
    }
};

struct Node2 {
    int seq;
    string str;
    Node2() {}
    Node2(int _s, string _str) :seq(_s), str(_str) {}
    bool operator < (const Node2 &b) const {
        if (str.size() != b.str.size()) {
            return str.size() < b.str.size();
        } else {
            return seq < b.seq;
        }
    }
};

int main() {
    vector<Node1> vec1;
    vec1.clear();
    vector<Node2> vec2;
    vec2.clear();
    string str;
    int i = 0;
    while (cin >> str) {
        ++i;
        vec1.push_back(Node1(i, str));
        vec2.push_back(Node2(i, str));
    }

    sort(vec1.begin(), vec1.end());
    sort(vec2.begin(), vec2.end());

    cout << vec1[0].str << endl << vec2[0].str << endl;

    return 0;
}