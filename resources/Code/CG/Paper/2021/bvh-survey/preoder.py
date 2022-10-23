# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right


# https://leetcode-cn.com/problems/binary-tree-preorder-traversal/

class Solution:
    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        if(root == None):
            return []
        
        # 构造父指针
        # 题目中没给
        root.parent = None
        self.constructParent(root)
        
        # 利用父指针,不利用其他的数据结构进行前序遍历
        ans = []
        isDown = True
        now  = root
        last = None
        while(now != None):
            if(isDown):
                ans.append(now.val) # output
                if(now.left != None):
                    last = now
                    now = now.left
                # 可能缺少左子结点
                # 完全二叉树不需要做如下判断
                elif(now.right != None):
                    last = now
                    now = now.right
                else:
                    isDown = False
                    t = now
                    now = last
                    last = t
            else:
                if(last == now.left):
                    # 可能缺少左子结点
                    # 完全二叉树不需要做如下判断
                    if(now.right != None):
                        isDown = True
                        last = now 
                        now = now.right
                    else:
                        last = now
                        now = now.parent
                else:
                    last = now
                    now = now.parent
        return ans


    def constructParent(self, node: TreeNode):
        if(node.left != None):
            node.left.parent = node
            self.constructParent(node.left)
        
        if(node.right != None):
            node.right.parent = node
            self.constructParent(node.right)