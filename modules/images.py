# coding: utf-8

import datetime, os, uuid, web, urllib, cgi, re, Image, ImageFilter, shutil
from config import config
from StringIO import StringIO
from base import db
import ImageFile
ImageFile.MAXBLOCK = 1500*1500 # default is 64k

def delete_image(filename, extension):
    rem_file(os.path.join(config.upload_dir, filename))
    for size in config.image.keys():
        rem_file(os.path.join(config.static_dir, filename + "_" + size + extension))


def rem_file(filename):
    if os.path.exists(filename):
        os.unlink(filename)


def resize_image(image_id, filename, extension, size):
    original_name = os.path.join(config.upload_dir, filename)
    destination_name = os.path.join(config.static_dir, "i/" + filename + "_" + size + extension)
    resize(original_name, destination_name, size)
    image = db.select("documents", vars=dict(image_id=image_id),where="id=$image_id AND NOT is_deleted")[0]
    if not image.sizes: image.sizes = ""
    sizes = set(image.sizes.split(","))
    sizes.add(size)
    db.query(
        "UPDATE documents SET sizes = $new_size WHERE id=$image_id",
        vars=dict(new_size=",".join(sizes), image_id=image_id)
    )


def resize(original_name, destination, prefix):
    dst_width, dst_height, crop, sharp, watermark, quality, progressive = config.image[prefix]
    if dst_width and dst_height:
        img = Image.open(original_name)
        src_width, src_height = img.size
        src_ratio = float(src_width) / float(src_height)
        dst_ratio = float(dst_width) / float(dst_height)
        if crop:
            if dst_ratio < src_ratio:
                crop_height = src_height
                crop_width = crop_height * dst_ratio
                x_offset = float(src_width - crop_width) / 2
                y_offset = 0
            else:
                crop_width = src_width
                crop_height = crop_width / dst_ratio
                x_offset = 0
                y_offset = float(src_height - crop_height) / 3
            img = img.crop((x_offset, y_offset, x_offset+int(crop_width), y_offset+int(crop_height)))
            img = img.resize((dst_width, dst_height), Image.ANTIALIAS)
        elif src_width > dst_width and src_height > dst_height:
            if dst_ratio > src_ratio:
                img = img.resize((int((float(dst_height)*src_ratio) + 0.5), dst_height), Image.ANTIALIAS)
            else:
                img = img.resize((dst_width, int((float(dst_width)/src_ratio) + 0.5)), Image.ANTIALIAS)
        folder = os.path.dirname(destination)
        if not os.path.exists(folder): os.makedirs(folder)
        rem_file(destination)
        if destination.endswith("jpg"):
            if sharp:
                img = img.filter(ImageFilter.DETAIL)
            if watermark:
                mark = Image.open(os.path.join(config.static_dir,"/img/watermark.png"))
                w1, h1 = img.size
                w2, h2 = mark.size
                img.paste(mark, (w1-w2, h1-h2), mark)
            img.save(destination, "JPEG", quality=quality, optimize=True, progressive=progressive)
        else:
            img.save(destination)
    else:
        shutil.copy(original_name, destination)

