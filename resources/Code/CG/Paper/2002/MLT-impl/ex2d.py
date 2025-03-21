import cv2
import numpy as np
import os
from tqdm import trange


def makeHistogram(f, mutations, warm_up, save_dir):

    W, H = f.shape
    RESOLUTION = W * H

    # 求 f 的平均值，用于归一化，采样大量样本实现
    N = W * H * 100
    rnd_vec = np.random.randint(0, W, N), np.random.randint(0, H, N)
    f_avg = np.mean(f[rnd_vec])

    # 需要设置类型，因为 f 的类型是 uint8，直方图会溢出
    histogram = np.zeros_like(f, dtype=np.uint32)

    # 均匀转移函数，因此概率相同
    Tx2y = 1.0 / RESOLUTION
    Ty2x = 1.0 / RESOLUTION

    # 初始化样本
    x = [np.random.randint(0, W), np.random.randint(0, H)]
    Fx = f[x[0], x[1]]
    max_mutation = max(mutations)

    for spp in trange(max_mutation + warm_up):
        for _ in range(RESOLUTION):
            # 转移样本，随机选取一个样本：T(y|x) = 1/(W*H)
            y = [np.random.randint(0, W), np.random.randint(0, H)]
            Fy = f[y[0], y[1]]

            # 计算接受概率
            Axy = min(1, (Fy * Ty2x) / (Fx * Tx2y))

            # 接受样本
            if (np.random.rand() < Axy):
                x = y
                Fx = Fy

            if (spp >= warm_up):
                # 更新直方图
                histogram[x[0], x[1]] += 1

        # 记录结果
        current_iter = spp + 1 - warm_up

        if (current_iter in mutations):
            h_ave = np.mean(histogram.flatten())
            scale = f_avg / h_ave

            # scale 直方图，然后保存
            checkpoint = scale * histogram
            checkpoint = np.clip(checkpoint, 0, 255)
            checkpoint = checkpoint.astype(np.uint8)
            cv2.imwrite(save_dir + f"ex2d_mutation_{current_iter}.png", checkpoint)


if __name__ == '__main__':
    img_filename = "assets/test.png"
    save_dir = "assets/test/"

    if (os.path.exists(save_dir) == False):
        os.makedirs(save_dir)

    # 读取图片，0-255
    img = cv2.imread(img_filename, cv2.IMREAD_GRAYSCALE)
    if (img.min() == 0):
        img = cv2.max(img, 1)
        cv2.imwrite(img_filename, img)
        print("Set Min Value to 1")

    warm_up = 2
    mutations = [1, 8, 64, 128, 256]

    makeHistogram(img, mutations, warm_up, save_dir)
