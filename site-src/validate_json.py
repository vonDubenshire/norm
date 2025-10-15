import json

try:
    with open("/home/ubuntu/norm-macdonald-website/public/consolidated_youtube_data.json", "r") as f:
        data = json.load(f)
    print(f"JSON file contains {len(data)} entries.")
except json.JSONDecodeError as e:
    print(f"JSON decoding error: {e}")
except FileNotFoundError:
    print("File not found.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
