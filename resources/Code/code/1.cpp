#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    vector<string> strs;
    strs.clear();
    while (cin >> s) {
        strs.push_back(s);
    }
    sort(strs.begin(), strs.end());
    auto end = unique(strs.begin(), strs.end());
    auto start = strs.begin();
    while (start != end) {
        cout << *start << endl;
        ++start;
    }
    return 0;
}