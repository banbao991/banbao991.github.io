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
#define MAXN 350

struct Node {
    int x, y;
    Node() {}
    Node(int _x, int _y) : x(_x), y(_y) {}
    bool operator < (const Node &n) const {
        if (x != n.x) {
            return x < n.x;
        }
        return y < n.y;
    }
};

float dis[MAXN][MAXN];

float distance(int x1, int y1, int x2, int y2) {
    int t1 = x1 - x2;
    int t2 = y1 - y2;
    return (float)sqrt(float(t1*t1 + t2*t2));
}

int main() {
    map<Node, int> M;
    M.clear();

    memset(dis, 0, sizeof(dis));

    Node point[MAXN];

    int index = 0;
    int s, t;

    scanf("%d %d", &s, &t);
    point[0] = Node(s, t);
    M[point[0]] = index++;

    scanf("%d %d", &s, &t);
    point[1] = Node(s, t);
    M[point[1]] = index++;


    int old_index;
    Node old;
    // subway
    while (scanf("%d %d", &s, &t) != EOF) {

        //if (s == 1 && t == 1) {
        //    break;
        //}

        old = Node(s, t);
        if (M.find(old) == M.end()) {
            point[index] = old;
            old_index = index++;
        } else {
            old_index = M[old];
        }
        while (true) {
            scanf("%d %d", &s, &t);
            if (s == -1 && t == -1) {
                break;
            }
            Node now(s, t);
            int now_index;
            if (M.find(now) == M.end()) {
                point[index] = now;
                now_index = index++;
            } else {
                now_index = M[now];
            }
            float cost = distance(old.x, old.y, s, t) / 1000.0f / 40.0f * 60.0f;
            if (dis[old_index][now_index] == 0) {
                dis[old_index][now_index] = dis[now_index][old_index] = cost;
            } else if (cost < dis[old_index][now_index]) {
                dis[old_index][now_index] = dis[now_index][old_index] = cost;
            }

            // 更新
            old_index = now_index;
            old = now;
        }
    }

    for (int i = 0; i < index; ++i) {
        for (int j = 0; j < index; ++j) {
            if (i == j) {
                dis[i][j] = 0;
            } else {
                float now = distance(point[i].x, point[i].y, point[j].x, point[j].y) / 1000.0f / 10.f * 60.f;
                if (dis[i][j] == 0) {
                    dis[i][j] = now;
                } else {
                    dis[i][j] = dis[j][i] = min(dis[i][j], now);
                }
            }
        }
    }

    // Floyd
    for (int k = 0; k < index; ++k) {
        for (int i = 0; i < index; ++i) {
            for (int j = 0; j < index; ++j) {
                float now = dis[i][k] + dis[k][j];
                if (now < dis[i][j]) {
                    dis[i][j] = now;
                }
            }
        }
    }

    printf("%d", int(roundf(dis[0][1])));
    return 0;
}