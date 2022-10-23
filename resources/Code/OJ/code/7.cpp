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

#define A 'a'
#define Z 'z'

char cell[500][500] = {};
int max_right[500] = {};
int maxdepth = 0;

struct Node {
    char op;
    int pri; // 优先级 -1: (, 0:), 1:+-, 2:*/, 3:a-z
    Node(char _op, int _pri) :op(_op), pri(_pri) {}
};

struct NodeV {
    int v;
    bool op;
    NodeV(int _v, bool _op) :v(_v), op(_op) {}
};

int get_val(stack<NodeV> &t_stack) {
    NodeV tn = t_stack.top();
    t_stack.pop();
    if (!tn.op) return tn.v;

    int op = tn.v;
    int v1, v2;
    v2 = get_val(t_stack);
    v1 = get_val(t_stack);
    if (op == '+') {
        v1 += v2;
    } else if (op == '-') {
        v1 -= v2;
    } else if (op == '*') {
        v1 *= v2;
    } else if (op == '/') {
        v1 /= v2;
    }
    return v1;
}

int get_depth(stack<NodeV> &t_stack) {
    NodeV tn = t_stack.top();
    t_stack.pop();
    if (!tn.op) return 0;
    int op = tn.v;
    int v1, v2;
    v1 = get_depth(t_stack);
    v2 = get_depth(t_stack);
    return max(v1, v2) + 1;
}

void traval(int depth, int center, stack<NodeV> &t_stack) {
    NodeV tn = t_stack.top();
    int depth_num = depth * 2;
    cell[depth_num][center] = tn.v;
    max_right[depth_num] = max(max_right[depth_num], center);
    t_stack.pop();
    if (!tn.op) return;
    cell[depth_num + 1][center - 1] = '/';
    cell[depth_num + 1][center + 1] = '\\';
    max_right[depth_num + 1] = max(max_right[depth_num + 1], center + 1);

    int shift = (1 << (maxdepth  - 1- depth));
    traval(depth + 1, center + shift, t_stack);
    traval(depth + 1, center - shift, t_stack);
}


int main() {
    int N;
    char a[60];
    scanf("%s", a);
    scanf("%d", &N); getchar();
    int val[30]; // 字母对应的值
    for (int i = 0; i < N; ++i) {
        int ti;
        char tc;
        scanf("%c %d", &tc, &ti); getchar();
        val[tc - A] = ti;
    }
    // 输出序列
    vector<Node> output;
    // 操作符栈
    stack<Node> op;
    while (!op.empty()) op.pop();
    // 处理为后缀表达式
    char *tc = a;
    char t1;
    while (t1 = *(tc++)) {
        // 操作数直接输出到序列中
        if (t1 >= A && t1 <= Z) {
            output.push_back(Node(t1, 4));
        }
        // 左括号直接压栈
        else if (t1 == '(') {
            op.push(Node(t1, -1));
        }
        // 右括号, 弹到左括号位置
        else if (t1 == ')') {
            // ERROR
            if (op.empty()) {
                printf("ERROR\n");
                return -1;
            }
            Node tn = op.top();
            while (tn.pri != -1) {
                output.push_back(tn);
                op.pop();
                // ERROR
                if (op.empty()) {
                    printf("ERROR\n");
                    return -1;
                }
                tn = op.top();
            }
            op.pop();
        }
        // 操作符: 弹出优先级比当前操作符高的操作符
        else {
            Node now(t1, 1); // +-
            if (t1 == '*' || t1 == '/') {
                now.pri = 2; // */
            }
            // 非空, 非 (, 优先级低
            while (!op.empty()) {
                Node tn = op.top();
                if (tn.pri == -1 || tn.pri < now.pri) {
                    break;
                }
                op.pop();
                output.push_back(tn);
            }
            // 压栈
            op.push(now);
        }
    }
    while (!op.empty()) {
        Node tn = op.top();
        // ERROR
        if (tn.pri == -1) {
            printf("ERROR\n");
            return -1;
        }
        output.push_back(tn);
        op.pop();
    }

    int s_length = output.size();
    for (int i = 0; i < s_length; ++i) {
        printf("%c", output[i].op);
    }
    printf("\n");


    // 构建后缀序列
    // **每次使用完后缀序列都需要重建一次**
    stack<NodeV> t_stack;
    for (int i = 0; i < s_length; ++i) {
        Node tn = output[i];
        if (tn.pri == 1 || tn.pri == 2) {
            t_stack.push(NodeV(tn.op, true));
        } else {
            t_stack.push(NodeV(tn.op, false));
        }
    }

    // 输出树
    for (int i = 0; i < 500; ++i)
        for (int j = 0; j < 500; ++j)
            cell[i][j] = ' ';
    maxdepth = get_depth(t_stack);
    for (int i = 0; i < s_length; ++i) {
        Node tn = output[i];
        if (tn.pri == 1 || tn.pri == 2) {
            t_stack.push(NodeV(tn.op, true));
        } else {
            t_stack.push(NodeV(tn.op, false));
        }
    }
    traval(0, (1 << maxdepth) - 1, t_stack);
    maxdepth = maxdepth * 2 + 1;
    for (int i = 0; i < maxdepth; ++i) {
        int max_t = max_right[i];
        for (int j = 0; j <= max_t; ++j) {
            printf("%c", cell[i][j]);
        }
        printf("\n");
    }


    // 计算值
    for (int i = 0; i < s_length; ++i) {
        Node tn = output[i];
        if (tn.pri == 1 || tn.pri == 2) {
            t_stack.push(NodeV(tn.op, true));
        } else {
            t_stack.push(NodeV(val[tn.op - A], false));
        }
    }
    int ans = get_val(t_stack);
    printf("%d\n", ans);
    return 0;
}