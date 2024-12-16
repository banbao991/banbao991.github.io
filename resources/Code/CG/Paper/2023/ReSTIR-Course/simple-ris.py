import random


def f(x):
    '''f(x) = x*x, x: [0, 1], f(x)dx = 2x^2dx = 2/3'''
    return x * x


def sample():
    x = random.uniform(0, 1)
    px = 1.0
    return x, px


def one_sample_MC():
    x, px = sample()
    return f(x) / px


def MC(n):
    sum = 0.0
    for i in range(n):
        sum += one_sample_MC()
    return sum / n


def ris(n, target_p):
    candidate = []
    w = []
    n_inv = 1.0 / n
    for i in range(n):
        x, px = sample()
        candidate.append(x)
        w.append(n_inv * target_p(x) / px)

    w_sum = 0.0
    for i in range(n):
        w_sum += w[i]

    for i in range(n):
        w[i] /= w_sum

    # sample
    rdn = random.uniform(0, 1)
    sum = 0.0
    result_x = 0.0
    for i in range(n):
        sum += w[i]
        if rdn < sum:
            result_x = candidate[i]
            break

    return f(result_x) / target_p(result_x) * w_sum


N = 100000

print(f.__doc__)
print("\nMC")
print("{} samples:\n\t{}".format(1, MC(1)))
print("{} samples:\n\t{}".format(N, MC(N)))

print("\nRIS")
print("q(x) = f(x):\n\t{}".format(ris(N, f)))
print("q(x) = x:\n\t{}".format(ris(N, lambda x: x)))

# N times ris
N = 100
samples_per_ris = 1000
sum = 0.0
for i in range(N):
    sum += ris(samples_per_ris, lambda x: x)
print("q(x) = x, {} times RIS, {} samples each RIS process:\n\t{}".format(N, samples_per_ris, sum / N))
