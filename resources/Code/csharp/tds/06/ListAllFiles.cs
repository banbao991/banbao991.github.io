using System;
using System.IO;
using System.Security.AccessControl;

internal class ListAllFiles {
    static int MAX_LEVEL = 1;
    public static void Main(string[] args) {
        string fileDir = "D:\\";
        if (args.Length != 1) {
            Console.WriteLine("ListAllFiles.exe FileDir");
        } else {
            fileDir = args[0];
        }
        ListFiles(new DirectoryInfo(fileDir), 0);
        return;
    }
    public static void ListFiles(FileSystemInfo info, int level) {
        if (level > MAX_LEVEL) {
            return;
        }
        if (!info.Exists) return;
        DirectoryInfo dir = info as DirectoryInfo;
        if (dir == null) return; // 不是目录
        FileSystemInfo[] files;
        // 异常, System.UnauthorizedAccessException
        try {
            files = dir.GetFileSystemInfos();
        } catch (Exception e) {
            Console.WriteLine("Exception: " + info.FullName + ", " +  e.GetType());
            return;
        }
        for (int i = 0; i < files.Length; i++) {
            FileInfo file = files[i] as FileInfo;
            if (file != null) {
                // 是文件
                Console.WriteLine(new string('\t', level) + file.FullName + "\t" + file.Length);
            } else {
                // 是目录
                // 对于子目录, 进行递归调用
                ListFiles(files[i], level + 1);
            }
        }
    }
}