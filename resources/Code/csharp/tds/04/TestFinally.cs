using System;

public class TestFinally {

    public static void Main() {
        for (int i = 0; i < 2; ++i) {
            try {
                Console.WriteLine("Main: " + ((i == 0) ? "Have" : "No") + " Exception!");
                test(i == 0);
            } catch {
                Console.WriteLine("Main: catch exception from test()");
            }
        }
    }

    private static void test(bool haveException) {
        try {
            if (haveException) {
                throw new Exception();
            } else {
                return;
            }
        } catch {
            Console.WriteLine("test: have exception!");
            throw; // 重抛异常
        } finally {
            Console.WriteLine("test: Execute finally!");
        }
    }
}

/*Output
Main: Have Exception!
test: have exception!
test: Execute finally!
Main: catch exception from test()
Main: No Exception!
test: Execute finally!
*/
