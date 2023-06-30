#include <iostream>
#include <algorithm>
using namespace std;

struct Node {
    Node *left, *right;
    int idx;
    int value; // -1: interior node; else : leaf node
    int delta; // max common prefix length
    Node() :left(nullptr), right(nullptr), value(-1), delta(0) {}
    Node(int _idx, int _value = -1) :left(nullptr), right(nullptr), idx(_idx), value(_value), delta(0) {}
};

int length;
int bitwidth;
int *code;
Node **leaf;
Node **interior;

// [0, length)
// i, j may out of the range
// brute implement (or cache it before start)
int delta_funtion(const int i, const int j) {
    if (i < 0 || i >= length || j < 0 || j >= length) { return -1; }
    unsigned int v = code[i] ^ code[j];
    int res = bitwidth;
    while (v) {
        --res;
        v >>= 1;
    }
    return res;
}

int sign(int v) {
    if (v == 0) { return 0; }
    return ((v > 0) << 1) - 1;
}

int main() {
    // input
    length = 8;
    bitwidth = 5;
    code = new int[length] {
        0b00001, 0b00010, 0b00100, 0b00101,
            0b10011, 0b11000, 0b11001, 0b11110,
    };

    // construct leaf node
    leaf = new Node*[length];
    for (int i = 0; i < length; ++i) {
        leaf[i] = new Node(i, code[i]);
    }

    // construt interior node
    const int length_1 = length - 1;
    interior = new Node*[length_1];
    for (int i = 0; i < length_1; ++i) {
        interior[i] = new Node(i);
    }

    // algorithm(can be parallelized)
    for (int i = 0; i < length_1; ++i) {
        // Determine direction of the range (+1 or -1)
        int d = sign(delta_funtion(i, i + 1) - delta_funtion(i, i - 1));
        // Compute upper bound for the length of the range
        int delta_min = delta_funtion(i, i - d);
        int l_max = 2;
        while (delta_funtion(i, i + l_max * d) > delta_min) {
            l_max *= 2;
        }
        // Find the other end using binary search
        int l = 0;
        int t = l_max / 2;
        while (t) {
            if (delta_funtion(i, i + (l + t)*d) > delta_min) {
                l += t;
            }
            t >>= 1;
        }
        int j = i + l * d;
        // Find the split position using binary search
        int delta_node = delta_funtion(i, j);
        interior[i]->delta = delta_node;
        int s = 0;
        for (int t1 = 1; t = ((l + (1 << t1) - 1) >> t1); ++t1) {
            if (delta_funtion(i, i + (s + t)*d) > delta_node) {
                s += t;
            }
            if (t == 1) { break; }
        }
        int gamma = i + s * d + min(d, 0); // [i, gamma] => left child, (gamma, j] => right child
        // Output child pointers
        interior[i]->left = (min(i, j) == gamma) ? leaf[gamma] : interior[gamma];
        ++gamma;
        interior[i]->right = (max(i, j) == gamma) ? leaf[gamma] : interior[gamma];
    }

    // output all edge
    for (int i = 0; i < length_1; ++i) {
        Node * &now = interior[i]->left;
        cout << "Interior Node[" << i << "], the max length of common prefix is " << interior[i]->delta << endl;
        cout << "    Edge:( I[" << i << "], " << (now->value < 0 ? "I" : "L")
            << "[" << now->idx << "] )" << endl;
        now = interior[i]->right;
        cout << "    Edge:( I[" << i << "], " << (now->value < 0 ? "I" : "L")
            << "[" << now->idx << "] )" << endl;
    }

    // free
    delete[] code;
    for (int i = 0; i < length_1; ++i) {
        delete leaf[i];
        delete interior[i];
    }
    delete leaf[length_1];
    delete[] leaf;
    delete[] interior;

    // end
    return 0;
}