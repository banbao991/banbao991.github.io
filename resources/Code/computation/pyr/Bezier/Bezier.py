import turtle as tt
import math
import numpy as np
import argparse
import os

#获得传入的参数
parser = argparse.ArgumentParser()
parser.add_argument("-p", "--path")
args = parser.parse_args()
path = args.path

if(args.path and os.path.exists(path)):
    pass
else:
    print("File Not Found!")
    exit()

# 窗口大小
WIDTH = 800
OFFSET_X = -200
OFFSET_Y = -350

arr = []
lines = []

# 将每行转化为一个长度为 8 的数组
def str2arr(x):
    return list(map(lambda x:int(x), x.split()))


# 一直插值, 知道无法插值(只剩下一个点)
def draw_bezier_2(l):
    for t in np.arange(0, 1, 0.01):
        a = l[:]
        length = len(a)
        while(length > 0):
            cycle = length - 2
            for i in range(0, cycle, 2):
                a[i] += t*(a[i+2] - a[i])
                a[i+1] += t*(a[i+3] - a[i+1])
            length -= 2
        tt.goto(a[0]+OFFSET_X, a[1]+OFFSET_Y)

# 直接代入公式
def draw_bezier(l):
    bx = 3*(l[2] - l[0])
    cx = 3*(l[4] - l[2]) - bx
    dx = l[6] - l[0] - bx - cx
    
    by = 3*(l[3] - l[1])
    cy = 3*(l[5] - l[3]) - by
    dy = l[7] - l[1] - by - cy

    for t in np.arange(0, 1, 0.01):
        t2 = t*t
        t3 = t2*t
        nx = l[0] + bx*t + cx*t2 + dx*t3
        ny = l[1] + by*t + cy*t2 + dy*t3
        tt.goto(nx+OFFSET_X, ny+OFFSET_Y)

with open(path) as f:
    lines = f.readlines()

# 将文件转化为一个数组
arr = list(map(str2arr, list(lines)))

# 初始设置
tt.setup(1.5*WIDTH, WIDTH)

tt.penup()
tt.goto(arr[0][0]+OFFSET_X, arr[0][1]+OFFSET_Y)
tt.pendown()
tt.pensize(4)
tt.pencolor("red")

# 开画
for i in arr:
    draw_bezier(i)

tt.penup()
tt.goto(arr[0][0]+OFFSET_X, arr[0][1]+OFFSET_Y)
tt.pendown()
tt.pensize(3)
tt.pencolor("black")

# 换一种方法绘制
for i in arr:
    draw_bezier_2(i)


tt.done()