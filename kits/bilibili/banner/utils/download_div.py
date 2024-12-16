# read the "img.txt" file
# the file is html format, is a div

import os
import requests
from bs4 import BeautifulSoup
import argparse

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = None
IMG_DIR_REL = None
IMG_FILE = None
IMG_FILE_NEW = None


def check_dirs(dir: str):
    global IMG_DIR
    IMG_DIR = os.path.join(CURRENT_DIR, dir)
    if (not os.path.exists(IMG_DIR)):
        print("dir does not exists")
        IMG_DIR = None
        return

    global IMG_DIR_REL
    IMG_DIR_REL = os.path.join(dir, "img")

    global IMG_FILE
    IMG_FILE = os.path.join(IMG_DIR, "div.txt")

    global IMG_FILE_NEW
    IMG_FILE_NEW = os.path.join(IMG_DIR, "div-new.txt")

    if (not os.path.exists(IMG_FILE)):
        print("img file does not exists")
        IMG_FILE = None

    if (os.path.exists(IMG_FILE_NEW)):
        print("new img file already exists")
        IMG_FILE_NEW = None

    IMG_DIR = os.path.join(IMG_DIR, "img")
    if (os.path.exists(IMG_DIR)):
        print("img dir already exists")
        IMG_DIR = None
    else:
        os.makedirs(IMG_DIR)

    # print global vars
    print("IMG_DIR: ", IMG_DIR)
    print("IMG_FILE: ", IMG_FILE)
    print("IMG_FILE_NEW: ", IMG_FILE_NEW)


def download_img():
    with open(IMG_FILE, "r") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")
    img_list = soup.find_all("img")
    img_list += soup.find_all("video")
    for img in img_list:
        img_url = img["src"]

        if (img_url.startswith("blob:")):
            print("blob url, download it manually: ", img_url)
            continue

        img_name = img_url.split("/")[-1]
        img_data = requests.get(img_url).content
        img_name = os.path.join(IMG_DIR, img_name)
        with open(img_name, "wb") as f:
            f.write(img_data)


def regen_html():
    with open(IMG_FILE, "r") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")
    img_list = soup.find_all("img")

    for img in img_list:
        img_url = img["src"]
        img_name = img_url.split("/")[-1]
        img["src"] = "utils/{}/{}".format(IMG_DIR_REL, img_name)

    img_list = soup.find_all("video")
    for img in img_list:
        img_url = img["src"]
        img_name = img_url.split("/")[-1]
        img["src"] = "utils/{}/{}.webm".format(IMG_DIR_REL, img_name)
        print("rename it after manually downloading:, " + img["src"])

    with open(IMG_FILE_NEW, "w") as f:
        f.write(str(soup))


if __name__ == "__main__":
    # get input file
    parser = argparse.ArgumentParser()
    # must have file argument
    parser.add_argument("dir", help="input dir")
    args = parser.parse_args()

    check_dirs(args.dir)

    if (IMG_FILE):
        if (IMG_DIR):
            download_img()
        if (IMG_FILE_NEW):
            regen_html()
