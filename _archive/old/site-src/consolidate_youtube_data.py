import json

output_json_files = [
    'youtube_html_data.json',
    'youtube_text_data.json',
    'youtube_csv_data.json'
]

consolidated_data = {}

for file_path in output_json_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for entry in data:
                video_url = entry.get('Video url')
                if video_url and video_url not in consolidated_data:
                    consolidated_data[video_url] = {
                        'Video url': video_url,
                        'Title': entry.get('Title', 'No Title'),
                        'Description': entry.get('Description', 'No description available.'),
                        'Channel name': entry.get('Channel name', 'N/A'),
                        'Duration': entry.get('Duration', 'N/A'),
                        'Views': entry.get('Views', 'N/A'),
                        'Thumbnail url': entry.get('Thumbnail url', 'N/A')
                    }
                elif video_url and video_url in consolidated_data:
                    # Update existing entry with more complete data if available
                    existing_entry = consolidated_data[video_url]
                    for key, value in entry.items():
                        if value and existing_entry.get(key) in ['No Title', 'No description available.', 'N/A']:
                            existing_entry[key] = value

    except FileNotFoundError:
        print(f"Warning: {file_path} not found. Skipping.")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {file_path}: {e}")

final_video_list = list(consolidated_data.values())

with open('consolidated_youtube_data.json', 'w', encoding='utf-8') as f:
    json.dump(final_video_list, f, indent=2)

print(f"Consolidated {len(final_video_list)} unique video entries.")

