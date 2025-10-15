import json
import re

input_txt_path = '/home/ubuntu/upload/.recovery/NormMacdonald.txt'
output_json_path = 'youtube_text_data.json'

video_data = []

with open(input_txt_path, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

for line in lines:
    line = line.strip()
    if not line:
        continue

    youtube_match = re.search(r'(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})(?:[&?].*)?)', line)
    
    if youtube_match:
        url = youtube_match.group(0)
        # Use the rest of the line as a potential title/description
        text_around_url = line.replace(url, '').strip()
        title = text_around_url if text_around_url else url
        video_data.append({'Video url': url, 'Title': title, 'Description': text_around_url})

with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(video_data, f, indent=2)

