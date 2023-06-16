using System;
using System.Text.RegularExpressions;

class Test {
    static void  Main() {
        string pattern = @"^[\. a-zA-z]+ (?<name>\w+), [a-zA-z]+, x(?<ext>\d+)$";
        string [] sa = {
            "Dr. David Jones, Ophthalmology, x2441",
            "Ms. Cindy Harriman, Registry, x6231",
            "Mr. Chester Addams, Mortuary, x1667",
            "Dr. Hawkeye Pierce, Surgery, x0986",
        };
        Regex rx = new Regex( pattern );
        foreach (string s in sa) {
            Match m= rx.Match(s);
            if(m.Success) {
                Console.Write(rx.Replace(s, "姓：$1, 分机号：$2"));
                Console.WriteLine(m.Result("(${name}, ${ext})"));
            }
        }
    }
}