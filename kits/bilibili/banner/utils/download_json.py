# read the "img.txt" file
# the file is html format, is a div

import os
import requests
import argparse
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))


def read_json(dir: str):
    JSON_FILE = os.path.join(CURRENT_DIR, dir, "header.json")
    IMG_DIR = os.path.join(CURRENT_DIR, dir, "img")

    if (not os.path.exists(IMG_DIR)):
        os.makedirs(IMG_DIR)
    else:
        print("img dir exists, please remove it first")
        return

    with open(JSON_FILE, "r") as f:
        data = json.load(f)["data"]["split_layer"]
    # str to json
    data = eval(data)["layers"]

    for i in range(len(data)):
        img_id = data[i]["id"]
        img_url = data[i]["resources"][0]["src"]

        img_name = "{}.{}".format(img_id, img_url.split(".")[-1])
        img_path = os.path.join(IMG_DIR, img_name)

        # download
        r = requests.get(img_url)
        with open(img_path, "wb") as f:
            f.write(r.content)


if __name__ == "__main__":
    # get input file
    parser = argparse.ArgumentParser()
    # must have file argument
    parser.add_argument("dir", help="input dir")
    args = parser.parse_args()

    # read_json(args.dir)
