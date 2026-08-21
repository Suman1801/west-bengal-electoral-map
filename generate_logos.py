import json
import os
import subprocess

with open('public/party_colors.json', 'r') as f:
    colors = json.load(f)

# List of all parties we want to ensure have logos
parties = ["AITC", "CPM", "INC", "BJP", "RSP", "AIFB", "FBL", "IND", "CPI", "WBSP", "GOJAM", "GNLF", "DSP(P)", "RSSCMJP", "SP", "SUCI", "RJD", "JKP(N)"]

for party in parties:
    logo_path = f"public/logos/{party}.png"
    # If the file exists and is larger than 3000 bytes (meaning it's not our 400 error page or a tiny broken file), skip
    if os.path.exists(logo_path) and os.path.getsize(logo_path) > 3000:
        continue
    
    # We need to generate one
    color = colors.get(party, "#808080")
    
    # Run ImageMagick command
    # -size 200x200 canvas:{color} -gravity center -fill white -pointsize 40 -annotate 0 "{party}" public/logos/{party}.png
    cmd = [
        "convert",
        "-size", "200x200",
        f"canvas:{color}",
        "-gravity", "center",
        "-fill", "white",
        "-font", "Ubuntu",  # usually present
        "-pointsize", "40",
        "-annotate", "0", party,
        logo_path
    ]
    subprocess.run(cmd)
    
