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
#define MAXN 150
#define LL long long

struct Node {
    int age;
    int seq;
    string id;
    Node() {}
    Node(int _a, int _s, string _i) : age(_a), seq(_s), id(_i) {}
    bool operator < (const Node& b) const {
        if (age >= 60 && b.age >= 60) {
            // 年龄可能相同
            if (age != b.age) {
                return age > b.age;
            }
            return seq < b.seq;
        } else if (age < 60 && b.age < 60) {
            return seq < b.seq;
        } else {
            return age >= 60;
        }
    }
};

int main() {
    int N;
    cin >> N;
    vector<Node> vec;
    vec.clear();
    string id;
    int age;
    for (int i = 0; i < N; ++i) {
        cin >> id >> age;
        vec.push_back(Node(age, i, id));
    }
    sort(vec.begin(), vec.end());
    for (int i = 0; i < N; ++i) {
        cout << vec[i].id << endl;
    }
    return 0;
}