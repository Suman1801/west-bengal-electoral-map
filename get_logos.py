import urllib.request
import urllib.parse
import json
import os
import time

parties = {
    "BJP": "File:Logo of the Bharatiya Janata Party.svg",
    "INC": "File:Indian National Congress hand logo.svg",
    "AITC": "File:All India Trinamool Congress logo.svg",
    "CPM": "File:CPI-M-flag.svg",
    "CPI_M": "File:CPI-M-flag.svg",
    "CPI": "File:Banner of the Communist Party of India.svg",
    "AAP": "File:Aam Aadmi Party Flag.svg",
    "AAM": "File:Aam Aadmi Party Flag.svg",
    "BSP": "File:Elephant Bahujan Samaj Party.svg",
    "SP": "File:Samajwadi Party Flag.svg",
    "SUCI": "File:SUCI Flag.svg",
    "AIFB": "File:All India Forward Bloc Flag.svg",
    "RSP": "File:Revolutionary Socialist Party Flag.svg",
    "IND": "File:Person icon.svg"
}

if not os.path.exists("public/logos"):
    os.makedirs("public/logos")

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

for party, file_name in parties.items():
    encoded_file = urllib.parse.quote(file_name)
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles={encoded_file}&format=json"
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
        
        pages = res['query']['pages']
        page = list(pages.values())[0]
        
        if 'imageinfo' in page:
            img_url = page['imageinfo'][0]['url']
            clean_url = img_url.split("?")[0]
            parts = clean_url.split('/')
            filename = parts[-1]
            thumb_url = clean_url.replace('/wikipedia/commons/', '/wikipedia/commons/thumb/') + f"/500px-{filename}.png"
            thumb_url = thumb_url.replace('/wikipedia/en/', '/wikipedia/en/thumb/')
            
            print(f"Downloading {party} from {thumb_url}")
            req_img = urllib.request.Request(thumb_url, headers=headers)
            with urllib.request.urlopen(req_img) as response_img:
                img_data = response_img.read()
                
            with open(f"public/logos/{party}.png", "wb") as f:
                f.write(img_data)
        else:
            print(f"No image info for {party}")
    except Exception as e:
        print(f"Failed {party}: {e}")
        
    time.sleep(1.5)

