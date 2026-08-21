url = "https://upload.wikimedia.org/wikipedia/commons/7/78/Logo_of_the_Bharatiya_Janata_Party.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original"

# Strip query params
clean_url = url.split("?")[0]
parts = clean_url.split('/')
filename = parts[-1]
thumb_url = clean_url.replace('/wikipedia/commons/', '/wikipedia/commons/thumb/') + f"/500px-{filename}.png"

print(thumb_url)
