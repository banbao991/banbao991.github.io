// leetcode
// https://leetcode.cn/problems/search-in-rotated-sorted-array/

class Solution {
public:
    int search(vector<int>& nums, int target) {
        return cycleSearch(nums, 0, nums.size() - 1, target);
    }

    int binarySearch(vector<int>& nums, int s, int e, int target) {
        while (s <= e) {
            int h = (s + e) >> 1;
            int b = nums[h];
            if (b < target) {
                s = h + 1;
            } else if (b > target) {
                e = h - 1;
            } else {
                return h;
            }
        }
        return -1;
    }

    int cycleSearch(vector<int>& nums, int s, int e, int target) {
        if (s == e) { return nums[s] == target ? s : -1; }
        if (e < s) { return -1; }

        int h = (s + e) >> 1;
        int a = nums[s], b = nums[h], c = nums[e];

        if (a == target) return s;
        if (b == target) return h;
        if (c == target) return e;

        if (a < c) {
            return binarySearch(nums, s + 1, e - 1, target);
        }

        if (a < b) {
            int res = binarySearch(nums, s + 1, h - 1, target);
            if (res != -1) {
                return res;
            } else {
                return cycleSearch(nums, h + 1, e - 1, target);
            }
        }

        else {
            int res = binarySearch(nums, h + 1, e - 1, target);
            if (res != -1) {
                return res;
            } else {
                return cycleSearch(nums, s + 1, h - 1, target);
            }
        }
    }
};
