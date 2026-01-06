from flask import Flask, request, jsonify
import json, random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin from frontend

tag_colors = [
    "#FF6B6B", "#FF8A65", "#FF7043", "#FFCA28", "#FFD740",
    "#C6FF00", "#AEEA00", "#76FF03", "#64DD17", "#00E676",
    "#1DE9B6", "#00B8D4", "#40C4FF", "#448AFF", "#536DFE",
    "#7C4DFF", "#D500F9", "#F50057", "#FF4081", "#E91E63",
    "#F44336", "#E53935", "#D32F2F", "#C2185B", "#8E24AA",
    "#5E35B1", "#3949AB", "#1E88E5", "#039BE5", "#00ACC1",
    "#00897B", "#43A047", "#689F38", "#AFB42B", "#FBC02D",
    "#FF9800", "#FB8C00", "#F57C00", "#FF5722", "#795548"
]
DATA_FILE = 'kanban.json'
tag_file = "tag.json"
id_file = "id_info.json"
segment_file = "segment.json"


@app.route('/data', methods=['GET'])
def get_data():
    data = create_card_data()
    return jsonify(data)

@app.route('/save', methods=['POST'])
def save_data():
    data = request.json
    with open(segment_file, 'r+') as f:
        segment = json.load(f)
        segment[data["from"]].remove(data["id"])
        segment[data["to"]].append(data["id"])

        f.seek(0)
        json.dump(segment, f, indent=2)
        f.truncate()

    return jsonify({"status": "success"})


@app.route('/addTask', methods=['POST'])
def addTask():
    data = request.json
    with open("test.json", 'w') as f:
        json.dump(data, f, indent=2)

    process_data(data)

    return jsonify({"status": "success"})

@app.route('/editTask', methods=['POST'])
def editTask():
    data = request.json

    with open(segment_file, 'r+') as f:  #updating segment - id
        segment = json.load(f)
        id = str(data["id"])
        for stage in segment:
            if id in segment[stage]:
                segment[stage].remove(id)
                break
        f.seek(0)
        json.dump(segment, f, indent=2)
        f.truncate()

    process_data(data)
    return jsonify({"status": "success"})



@app.route('/delete', methods=['POST'])
def delete():
    data = request.json
    # with open("test.json", 'w') as f:
    #     json.dump(data, f, indent=2)
    with open(segment_file, 'r+') as f:
        segment = json.load(f)
        segment[data["placeholder"]].remove(data["id"])

        f.seek(0)
        json.dump(segment, f, indent=2)
        f.truncate()

    with open(id_file, 'r+') as f:
        id = json.load(f)
        del id[data["id"]]

        f.seek(0)
        json.dump(id, f, indent=2)
        f.truncate()

    return jsonify({"status": "success"})

@app.route('/get_data/<id>', methods=['GET'])
def id_data(id):
    data = get_id_data(id)
    return jsonify(data)


def get_id_data(id):
    with open(id_file, 'r') as f:
        id_data = json.load(f)[id]

    with open(segment_file, 'r') as f:
        segment = json.load(f)
        for i in segment:
            if id in segment[i]:
                col = i

    return {
        "id": id,
        "segment" : col,
        "tags" : id_data["tags"],
        "title" : id_data["title"],
        "description" : id_data["description"],
        "level": id_data["level"],
        "duedate" : id_data["duedate"],
        "created_date" : id_data["created_date"],
        "subtask" : id_data["subtask"],
        "comments" : []
    }

def generate_hex_color():
    # new_color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
    new_color = random.choice(tag_colors)
    with open("tag.json", 'r') as f:
        data = json.load(f)
        while new_color in data.values():
            new_color = "#{:06x}".format(random.randint(0, 0xFFFFFF))

    return new_color

def process_data(data):
    with open(id_file, 'r+') as f: #updating Id data
        id = json.load(f)
        d = {
                "tags" : data["tags"],
                "title" : data["title"],
                "description" : data["description"],
                "level": data["priority"],
                "duedate" : data["duedate"],
                "created_date" : data["created_date"],
                "subtask" : data["subtask"],
                "comments" : []
            }

        id[data["id"]] = d
        f.seek(0)
        json.dump(id, f, indent=2)
        f.truncate()


    with open(segment_file, 'r+') as f:  #updating segment - id
        segment = json.load(f)
        segment[data["stage"]].append(str(data["id"]))
        f.seek(0)
        json.dump(segment, f, indent=2)
        f.truncate()



    with open(tag_file, 'r+') as f: #updating tag-color
        tags = json.load(f)
        for tag in data["tags"]:
            if tag not in tags:
                tags[tag] = generate_hex_color()
        f.seek(0)
        json.dump(tags, f, indent=2)
        f.truncate()


def create_card_data():
    with open(segment_file, 'r') as f:
        segment_data = json.load(f)

    with open("tag.json", 'r') as f:
        tag_data = json.load(f)

    with open("id_info.json", 'r') as f:
        id_info_data = json.load(f)

    data = {}

    for segment in segment_data:
        data[segment] = []
        for id in set(segment_data[segment]):
            temp = {}
            temp["id"] = id
            temp["title"] = id_info_data[id]["title"]
            temp["duedate"] = id_info_data[id]["duedate"]
            temp["level"] = id_info_data[id]['level']
            temp["comment_count"] = len(id_info_data[id]["comments"])
            temp["tags"] = []
            for tag in id_info_data[id]["tags"]:
                tag_temp = {}
                tag_temp["name"] = tag
                tag_temp["color"] = tag_data[tag] if tag in tag_data else "#ffffff"
                temp["tags"].append(tag_temp)
            data[segment].append(temp)

    return data

if __name__ == '__main__':
    app.run(debug=True, port=5000)
