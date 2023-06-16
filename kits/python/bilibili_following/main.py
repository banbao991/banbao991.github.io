# 使用方式
# python -u uid

import os
import requests
import argparse
import json
import datetime


def get_time() -> str:
    return str(datetime.datetime.now()).replace(" ", "-").replace(":", "-")[0:19]


# 输出关注的人
def deal_json(arr: list):
    data = dict()
    data["total"] = arr[0]["total"]
    data_tmp = list()
    for d in arr:
        data_tmp.extend(d["list"])

    data["list"] = data_tmp

    now_time = get_time()
    # 写入 json 文件
    with open("%s/info-%s.json" % (uid_dir, now_time), "w", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False))

    # 写入关注列表
    with open("%s/following-%s.txt" % (uid_dir, now_time), "w", encoding="utf-8") as f:
        for i in data_tmp:
            f.write("%s,%s\n" % (i["uname"], i["mid"]))

# 下载 json 文件


def download(url: str, file_name) -> str:
    try:
        res = requests.get(url, timeout=8)
    except:
        # 出现异常直接退出
        print("Exception Caught!")
        return None
    return json.loads(res.text)["data"]


# 处理的主函数
def deal(uid: str):
    json_array = []
    index = 1
    base_url = "https://api.bilibili.com/x/relation/followings?vmid=%s" % (uid)

    json_array.append(download(base_url + "&pn=%d" %
                               (index), "%s/%03d.json" % (uid_dir, index)))
    index += 1

    if(json_array[0] == None):
        print("can not get following messages!")
        return

    # 下载剩余的 json 文件
    total = int(json_array[0]["total"])

    # 上面下载了一次了
    total -= 50
    while(total > 0):
        json_array.append(download(base_url + "&pn=%d" %
                                   (index), "%s/%03d.json" % (uid_dir, index)))
        total -= 50
        index += 1

    # 处理 json 文件
    deal_json(json_array)


def mkdir(uid: str):
    global uid_dir
    global json_dir

    # uid 文件夹
    uid_dir = "./%s" % (uid)
    if(not os.path.exists(uid_dir)):
        os.makedirs(uid_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--uid", "-u")
    args = parser.parse_args()

    if(args.uid == None):
        args.uid = "231063804"
        # print("usage: python main.py -u uid")
        # exit()

    # 新建文件夹
    mkdir(args.uid)
    # 下载 json 文件并处理
    deal(args.uid)
