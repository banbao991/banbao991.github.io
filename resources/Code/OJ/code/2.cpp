#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

struct Node{
    int x, y, n;
};

int main() {
    Node node[30];
    int D, N;
    cin >> D >> N;
    for (int i = 0; i < N; ++i) {
        cin >> node[i].x >> node[i].y >> node[i].n;
    }
    // Brute
    int ans = 0;
    int cnt = 0;
    for (int x = 0; x <= 1024; ++x) {
        for (int y = 0; y <= 1024; ++y) {
            int n = 0;
            for (int i = 0; i < N; ++i) {
                int dx = node[i].x - x, dy = node[i].y - y;
                dx = abs(dx);
                dy = abs(dy);
                if (dx <= D && dy <= D) {
                    n += node[i].n;
                }
            }
            if (n > ans) {
                cnt = 1;
                ans = n;
            } else if (n == ans) {
                ++cnt;
            }
        }
    }
    cout << cnt << " " << ans << endl;

    return 0;
}