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
#define MAXN 100050
#define LL long long

struct Node {
    Node *left, *right;
    char val;
    int depth;
    Node() :left(NULL), right(NULL), val('$') {}
};

int N;
int cnt;

void del(Node *root) {
    if (root->left) {
        del(root->left);
    }
    if (root->right) {
        del(root->right);
    }
    delete root;
}

void Build(Node *root) {
    getchar();
    char val, tag;
    scanf("%c%c", &val, &tag);
    // 左子结点深度比当前结点大 1
    // 右子结点深度和当前结点相同
    if (tag == '0') {
        root->val = val;
        root->left = new Node();
        root->left->depth = root->depth + 1;
        Build(root->left);

        root->right = new Node();
        root->right->depth = root->depth;
        Build(root->right);

    } else {
        root->val = val;
    }
}

int main() {
    scanf("%d", &N);
    cnt = 0;
    Node *root = new Node();
    root->depth = 0;

    // input
    Build(root);

    // output
    bool first_for_output = true;
    bool first_for_queue = true;
    queue<Node*> Q;
    while (!Q.empty()) { Q.pop(); }
    stack<char> S;
    while (!S.empty()) { Q.pop(); }

    while (first_for_queue || !Q.empty()) {
        Node* r;
        if (first_for_queue) {
            first_for_queue = false;
            r = root;
        } else {
            r = Q.front();
            Q.pop();
        }

        // 所有深度相同的结点入栈
        int depth = r->depth;
        while(true) {
            while (r && r->val != '$') {
                S.push(r->val);
                if (r->left) {
                    Q.push(r->left);
                }
                r = r->right;
            }
            if (!Q.empty() && Q.front()->depth == depth) {
                r = Q.front();
                Q.pop();
            } else {
                break;
            }
        } 
        while (!S.empty()) {
            if (first_for_output) {
                first_for_output = false;
                printf("%c", S.top());
            } else {
                printf(" %c", S.top());
            }
            S.pop();
        }
    }

    // del
    del(root);

    return 0;
}