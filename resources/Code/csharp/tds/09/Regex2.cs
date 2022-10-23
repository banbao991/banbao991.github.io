using System;
using System.Text.RegularExpressions;
class Test {
    static void  Main() {
        string pattern = "[Bbw]ill";
        string s = "My friend Bill will pay the bill";
        if( Regex.IsMatch( s, pattern ) ) {
            Console.WriteLine( s + " 与 " + pattern +"相匹配" );
        }
        Regex rx = new Regex( pattern );
        MatchCollection mc = rx.Matches(s);
        Console.WriteLine("有 {0} 次匹配", mc.Count);
        foreach ( Match mt in mc ) {
            Console.WriteLine( mt );
        }
        Match m = rx.Match(s);
        while ( m.Success ) {
            Console.WriteLine("在位置 {0} 有匹配 '{1}'", m.Index, m.Value);
            m = rx.Match(s, m.Index+ m.Length);
        }
        for (m = rx.Match(s); m.Success; m = m.NextMatch()) {
            Console.WriteLine("在位置 {0} 有匹配 '{1}'", m.Index, m.Value);
        }
    }
}