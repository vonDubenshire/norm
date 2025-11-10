from bs4 import BeautifulSoup
import json

html_path = '/home/ubuntu/upload/.recovery/NormMacdonald.html'
output_json_path = 'youtube_html_data.json'

video_data = []

with open(html_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

for link in soup.find_all('a'):
    href = link.get('href')
    title = link.get('title')
    if href and ('youtube.com/watch' in href or 'youtu.be/' in href):
        video_data.append({'Video url': href, 'Title': title or link.text})

with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(video_data, f, indent=2)

