import os
import httpx
from dotenv import load_dotenv
import math

PEXELS_API_URL = "https://api.pexels.com/videos/search"
AVG_VIDEO_DURATION = 8  # A reasonable average duration for stock videos

async def search_videos(query: str, total_duration: int):
    """
    Searches for videos using the Pexels API and returns a list of video links.
    """
    load_dotenv()  # Load environment variables here
    api_key = os.getenv("PEXELS_API_KEY")

    if not api_key:
        raise ValueError("PEXELS_API_KEY not set")

    num_videos = math.ceil(total_duration / AVG_VIDEO_DURATION)
    
    headers = {"Authorization": api_key}
    params = {
        "query": query,
        "per_page": num_videos,
        "orientation": "portrait"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(PEXELS_API_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            video_links = []
            if 'videos' in data:
                for video in data['videos']:
                    # Find a high-quality vertical video link
                    for file in sorted(video['video_files'], key=lambda x: x['quality'], reverse=True):
                        if file['width'] >= 1080 and file['height'] >= 1920:
                            video_links.append(file['link'])
                            break
            
            return video_links

        except httpx.HTTPStatusError as e:
            # Log or handle the error appropriately
            print(f"HTTP error occurred: {e}")
            return []
        except Exception as e:
            print(f"An error occurred: {e}")
            return [] 