import pandas as pd
import json

csv_path_1 = 'FullNormJokes.csv'
csv_path_2 = '/home/ubuntu/upload/.recovery/NormMacdonald.csv'
csv_path_3 = 'NormMacdonald_new.csv'
output_json_path = 'youtube_csv_data.json'

all_video_data = []

def process_csv(file_path):
    df = pd.read_csv(file_path)
    video_data = []
    for index, row in df.iterrows():
        video_url = None
        title = None
        description = None
        
        # Look for 'Video url' or similar columns
        if 'Video url' in row and pd.notna(row['Video url']):
            video_url = row['Video url']
        elif 'URL' in row and pd.notna(row['URL']):
            video_url = row['URL']
        elif 'Link' in row and pd.notna(row['Link']):
            video_url = row['Link']

        # Look for 'Title' or similar columns
        if 'Title' in row and pd.notna(row['Title']):
            title = row['Title']
        elif 'Video Title' in row and pd.notna(row['Video Title']):
            title = row['Video Title']
        elif 'Name' in row and pd.notna(row['Name']):
            title = row['Name']

        # Look for 'Description' or similar columns
        if 'Description' in row and pd.notna(row['Description']):
            description = row['Description']
        elif 'Video Description' in row and pd.notna(row['Video Description']):
            description = row['Video Description']

        if video_url and ('youtube.com/watch' in video_url or 'youtu.be/' in video_url):
            all_video_data.append({
                'Video url': video_url,
                'Title': title if title else video_url,
                'Description': description if description else ''
            })

process_csv(csv_path_1)
process_csv(csv_path_2)
process_csv(csv_path_3)

with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(all_video_data, f, indent=2)

