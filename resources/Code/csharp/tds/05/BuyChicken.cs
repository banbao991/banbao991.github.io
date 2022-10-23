using System;

public class BuyChicken {

    // 100 元钱买 100 只鸡, 如何买?
    // 鸡母每只 3 元，鸡公每只 1 元，鸡仔每 3 只 1 元
    public static void Main() {
        for (int i = 0; i <= 100; ++i) {
            int left = 100 - i;
            int j = left % 3;
            int kCost = left / 3;
            for (; j <= left; j += 3, --kCost) {
                int k = 100 - i - j;
                if (3 * i + j + kCost == 100) {
                    Console.WriteLine("Mother: {0}, Father: {1}, Child: {2}", i, j, k);
                }
            }
        }
        Console.Read();
        return;
    }
}
