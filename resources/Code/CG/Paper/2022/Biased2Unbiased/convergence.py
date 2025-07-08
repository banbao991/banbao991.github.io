import numpy as np
import matplotlib.pyplot as plt
from tqdm import trange


def monte_carlo_estimator(alpha, n, epsilon=1e-10):
    samples = np.random.uniform(epsilon, 1, size=n)
    values = 1 / (samples**alpha)
    return np.mean(values)


# 参数设置
alphas = np.linspace(0.1, 0.9, num=9)
n_values = np.logspace(1, 5, num=20).astype(int)  # 10^1到10^5
print(n_values)
trials = 500              # 每个n的试验次数
epsilon = 1e-10           # 防止除以0

plt.figure(figsize=(10, 6))

for alpha in alphas:
    true_value = 1 / (1 - alpha)

    mse = []

    for i in trange(len(n_values), desc=f'α={alpha}', leave=False):
        n = n_values[i]
        estimates = [monte_carlo_estimator(alpha, n, epsilon) for _ in range(trials)]
        estimates = np.array(estimates)
        errors = np.abs(estimates - true_value)
        mse.append(np.mean(errors))

    mse = np.array(mse) / mse[0]

    # 绘制对数坐标下的收敛曲线
    plt.loglog(n_values, mse, 'o-', label=f'α={alpha:.1f}')

# 添加理论参考线
plt.loglog(n_values, 1 / np.sqrt(n_values) * np.sqrt(n_values[0]), '--', label='O(1/√n)')
plt.loglog(n_values, 1 / n_values**0.25 * (n_values[0]**0.25), '--', label='O(1/n^0.25)')

plt.xlabel('Number of samples (n)', fontsize=12)
plt.ylabel('Mean Absolute Error', fontsize=12)
plt.title('Convergence of Secondary Estimator', fontsize=14)
plt.legend()
plt.grid(True, which="both", ls="--")
plt.tight_layout()
plt.show()
