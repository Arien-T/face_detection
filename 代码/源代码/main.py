from flask import  Flask, request, jsonify, render_template
import cv2
import numpy as np
from detect_face_position import detect_face_position
from detect_face_key_point import detect_face_key_point
from detect_face_property import detect_face_property
from PIL import Image, ImageDraw, ImageFont
import os
import json
import base64
from io import BytesIO
import re

fontStyle = ImageFont.truetype("SIMYOU.TTF", 40,encoding="utf-8")
app = Flask(__name__)

@app.route('/')
def index():
    return '<h1>Hello Face Detection!</h1>'
@app.route('/upload',methods=['POST','GET'])#图片上传函数
def upload():
    f = request.files.get('file')
    if f is None:
        return "No file part", 400
    if f.filename=='':
        return "No selected file",400
    if f:

        #指定新的文件名
        new_filename='0.png'
        f.save(new_filename)
        return new_filename
@app.route("/face_detect")  # 人脸检测
def inference():
    # print(request)
    # print(request.values)
    print("Image recieved")
    data_url = request.args.get("url")
    print(data_url)


    img = Image.open('0.png')  # 获取图片
    img_raw = img.copy()
    width = img_raw.size[0]
    height = img_raw.size[1]
    boxes, name_list = detect_face_position(img)
    final_result = {}
    if type(boxes) is not np.ndarray:
        final_result["bounding_box"] = None
        final_result["key_point"] = None
        final_result["face_property"] = None
        return json.dumps(final_result)

    face_key_point_list = detect_face_key_point(img_raw)
    face_property = detect_face_property(img)

    #print(face_key_point_list)
    draw = ImageDraw.Draw(img)
    for i, box in enumerate(boxes):
        draw.rectangle(box.tolist(), outline=(255, 0, 0))  # 绘制框
        draw.text( (int(box[0]),int(box[1])), str(name_list[i]), fill=(255,0,0),font=fontStyle)
    img = cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR)

    for face_key_point in face_key_point_list:
        for p in range(68):
            cv2.circle(img, (int(face_key_point[p * 2] * width), int(face_key_point[p * 2 + 1] * height)),
                       2, (0, 255, 0), 2)

    #print(face_property)
    # cv2.imshow("capture", img)
    # cv2.waitKey(0)

    print(boxes)
    print(face_key_point_list)
    print(face_property)
    print(name_list)
    final_result["bounding_box"] = boxes.tolist()
    final_result["key_point"] = face_key_point_list
    final_result["face_property"] = face_property
    final_result["name_list"] = name_list
    return json.dumps(final_result)



if __name__ == '__main__':
    app.run(host="192.168.43.71",port=90,debug=True)