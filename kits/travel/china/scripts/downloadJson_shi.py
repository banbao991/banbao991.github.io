# 生成市级数据

import json
import os
import requests
import tqdm


def download(code):
    url = "https://geojson.cn/api/china/{}.json".format(code)
    response = requests.get(url)
    data = response.json()
    with open('../data/shi/{}.json'.format(code), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)


data = json.load(open('../data/shi.json', 'r', encoding='utf-8'))

if not os.path.exists('../data/shi'):
    os.makedirs('../data/shi')

for i in tqdm.tqdm(data):
    try:
        download(i['code'])
    except Exception as e:
        print(i['name'], e)
