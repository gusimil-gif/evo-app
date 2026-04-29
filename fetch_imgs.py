import urllib.request
import re

try:
    html = urllib.request.urlopen('https://useevo.store/').read().decode('utf-8')
    # simple regex for src in img tags
    imgs = re.findall(r'<img.*?src="(https://[^"]+)".*?>', html)
    for img in list(set(imgs))[:20]:
        if '.png' in img or '.jpg' in img or '.webp' in img:
            print(img)
except Exception as e:
    print("Error:", e)
