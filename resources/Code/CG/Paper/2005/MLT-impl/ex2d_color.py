import cv2
import numpy as np
import os
from tqdm import trange


def luminance(bgr):
    return 0.299 * bgr[..., 2] + 0.587 * bgr[..., 1] + 0.114 * bgr[..., 0]


def makeHistogram(f, mutations, warm_up, save_dir):

    W, H, _ = f.shape
    RESOLUTION = W * H

    # 求 f 的平均值，用于归一化，采样大量样本实现
    N = W * H * 100
    rnd_vec = np.random.randint(0, W, N), np.random.randint(0, H, N)
    f_avg = np.mean(luminance(f[rnd_vec]))

    # 已经是 float32 了
    histogram = np.zeros_like(f)

    # 均匀转移函数，因此概率相同
    Tx2y = 1.0 / RESOLUTION
    Ty2x = 1.0 / RESOLUTION
    # 初始化样本
    x = [np.random.randint(0, W), np.random.randint(0, H)]
    Cx = f[x[0], x[1]].copy()  # 注意这里如果不使用 copy 的话，就是浅拷贝，会导致原始数据被修改
    Fx = luminance(Cx)
    Cx /= Fx
    max_mutation = max(mutations)

    for spp in trange(max_mutation + warm_up):
        for _ in range(RESOLUTION):
            # 转移样本，随机选取一个样本：T(y|x) = 1/(W*H)
            y = [np.random.randint(0, W), np.random.randint(0, H)]
            Cy = f[y[0], y[1]].copy()
            Fy = luminance(Cy)
            Cy /= Fy

            # 计算接受概率
            Axy = min(1, (Fy * Ty2x) / (Fx * Tx2y))

            # 接受样本
            if (np.random.rand() < Axy):
                x = y
                Fx = Fy
                Cx = Cy

            if (spp >= warm_up):
                # 更新直方图
                histogram[x[0], x[1]] += Cx

        # 记录结果
        current_iter = spp + 1 - warm_up

        if (current_iter in mutations):
            h_ave = np.mean(luminance(histogram))
            scale = f_avg / h_ave

            # scale 直方图，然后保存
            checkpoint = scale * histogram
            checkpoint = (np.clip(checkpoint, 0, 1.0) * 255).astype(np.uint8)
            cv2.imwrite(save_dir + f"ex2d_color_mutation_{current_iter}.png", checkpoint)


if __name__ == '__main__':
    img_filename = "assets/test_color.png"
    save_dir = "assets/test/"

    if (os.path.exists(save_dir) == False):
        os.makedirs(save_dir)

    # 读取图片，BGR
    img = cv2.imread(img_filename, cv2.IMREAD_COLOR)

    if (img.flatten().min() == 0):
        original_shape = img.shape
        img = cv2.max(img.flatten(), 1)
        img = img.reshape(original_shape)
        cv2.imwrite(img_filename, img)
        print("Set Min Value to 1")

    # 转化为 0-1
    img = img.astype(np.float32) / 255.0

    warm_up = 2
    mutations = [1, 8, 64, 128, 256]

    makeHistogram(img, mutations, warm_up, save_dir)
