using System;
using System.Collections;
public class SamplesArrayList  {
    public static void Main()  {
        ArrayList myAL = new ArrayList();
        myAL.Add( "The" );
        myAL.Add( "quick" );
        myAL.Add( "brown" );
        myAL.Add( "fox" );
        ArrayList mySyncdAL = ArrayList.Synchronized( myAL );
        Console.WriteLine( myAL.IsSynchronized  );     // False
        Console.WriteLine( mySyncdAL.IsSynchronized ); // True
    }
}