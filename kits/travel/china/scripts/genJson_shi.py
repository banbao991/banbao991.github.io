# 生成市级数据

import json
import os

origin_data = json.load(open('../data/_meta.json', 'r', encoding='utf-8'))

data = origin_data["children"]


result = []

for i in range(len(data)):
    result.append({
        "code": data[i]["code"],
        "name": data[i]["name"],
        "fullname": data[i]["fullname"],
    })

with open('../data/shi.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=4)
