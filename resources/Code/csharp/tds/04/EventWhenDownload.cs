using System;

// 声明委托
public delegate void DownloadStartHandler(object sender, DownloadStartEventArgs e);
public delegate void DownloadEndHandler(object sender, DownloadEndEventArgs e);
public delegate void DownloadingHandler(object sender, DownloadingEventArgs e);

public class DownloadStartEventArgs {

    public string Url {
        get {
            return _url;
        }
        set {
            _url = value;
        }
    }

    private string _url;

    public DownloadStartEventArgs(string url) {
        this._url = url;
    }
}

public class DownloadEndEventArgs {

    public string Url {
        get {
            return _url;
        }
        set {
            _url = value;
        }
    }

    private string _url;

    public long ByteCount {
        get {
            return _byteCount;
        }
        set {
            _byteCount = value;
        }
    }

    private long _byteCount;

    public DownloadEndEventArgs(string url, long size) {
        this._url = url; this._byteCount = size;
    }
}

public class DownloadingEventArgs {

    public string Url {
        get {
            return _url;
        }
        set {
            _url = value;
        }
    }

    private string _url;

    public double Percent {
        get {
            return _percent;
        }
        set {
            _percent = value;
        }
    }

    private double _percent;

    public DownloadingEventArgs(string url, double percent) {
        this._url = url; this._percent = percent;
    }
}

public class Crawler {

    //  声明事件
    public event DownloadStartHandler DownloadStart;
    public event DownloadEndHandler DownloadEnd;
    public event DownloadingHandler Downloading;

    public string Name {
        get {
            return name;
        }
        set {
            name = value;
        }
    }

    private string name;
    private string site;

    public Crawler(string name, string site) {
        this.name = name;
        this.site = site;
    }

    public void Craw() {
        while (true) {
            string url = GetNextUrl();
            if (url == null) break;
            long size = GetSizeOfUrl(url);
            // 下载开始的事件发生
            if (DownloadStart != null) {
                DownloadStart(this, new DownloadStartEventArgs(url));
            }
            for (long i = 0; i < size + 1024; i += 1024) {
                // 下载数据...
                System.Threading.Thread.Sleep(100);
                double percent = (int)(i * 100.0 / size);
                if (percent > 100) percent = 100;
                // 下载数据的事件发生
                if (Downloading != null) {
                    Downloading(this, new DownloadingEventArgs(url, percent));
                }
            }
            // 下载结束的事件发生
            if (DownloadEnd != null) {
                DownloadEnd(this, new DownloadEndEventArgs(url, size));
            }
        }
    }

    private string GetNextUrl() {
        int a = rnd.Next(10);
        if (a == 0) return null;
        return site + "/Page" + a + ".htm";
    }

    private long GetSizeOfUrl(string url) {
        return rnd.Next(3000 * url.Length);
    }

    private Random rnd = new Random();
}

internal class Test {

    private static void Main() {
        Crawler crawler = new Crawler("Crawer101", "https:// www.pku.edu.cn");
        crawler.DownloadStart += new DownloadStartHandler(ShowStart); // 注册事件
        crawler.DownloadEnd += new DownloadEndHandler(ShowEnd);
        crawler.Downloading += new DownloadingHandler(ShowPercent);
        crawler.Craw();
    }

    private static void ShowStart(object sender, DownloadStartEventArgs e) {
        Console.WriteLine((sender as Crawler).Name + "开始下载" + e.Url);
    }

    private static void ShowEnd(object sender, DownloadEndEventArgs e) {
        Console.WriteLine("\n\r下载" + e.Url + "结束,其下载" + e.ByteCount + "字节");
    }

    private static void ShowPercent(object sender, DownloadingEventArgs e) {
        Console.Write("\r下载" + e.Url + "......." + e.Percent + "%");
    }
}