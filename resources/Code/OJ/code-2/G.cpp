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

#define inf 0x3f3f3f3f
#define MAXN 105

struct Node {
    char val;
    Node *left, *right;
    Node(char v, Node* l, Node* r) :val(v), left(l), right(r) {}
    Node(char v) :val(v), left(NULL), right(NULL) {}
};

void delete_tree(Node *root) {
    printf("%c", root->val);
    if (root->left) delete_tree(root->left);
    if (root->right) delete_tree(root->right);
    delete root;
}

char* char_index;

// 左子结点范围 [down, root->val]
// 右子结点范围 [root->val, up]
void dfs(Node* root, char down, char up) {
    if (root->left) {
        dfs(root->left, down, root->val);
    } else {
        if (*char_index >= down && *char_index <= root->val) {
            root->left = new Node(*char_index);
            ++char_index;
        }
    }

    if (root->right) {
        dfs(root->right, root->val, up);
    } else {
        if (*char_index >= root->val && *char_index <= up) {
            root->right = new Node(*char_index);
            ++char_index;
        }
    }
}

// 输入保证生成树唯一
// 二叉搜索树
int main() {
    string str;
    vector<string> seq;
    bool OK = false;
    while (!OK) {
        cin >> str;
        if (str.size() == 1 && str[0] == '$') {
            break;
        }
        // 获取序列
        seq.clear();
        seq.push_back(str);
        while (true) {
            cin >> str;
            if (str.size() == 1 && (str[0] == '*' || str[0] == '$')) {
                if (str[0] == '$') {
                    OK = true;
                }
                break;
            }
            seq.push_back(str);
        }
        // 构造树
        int seq_length = seq.size();
        Node *root = new Node(seq[seq_length - 1][0]);
        for (int i = seq_length - 2; i >= 0; --i) {
            char_index = &(seq[i][0]);
            dfs(root, 'A', 'Z');
        }
        // 前序输出
        delete_tree(root);
        printf("\n");
    }

    return 0;
}