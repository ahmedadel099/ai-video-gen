import os
import uuid
import tempfile
import shutil
import json
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from moviepy.editor import AudioFileClip

from services.voiceover import generate_voiceover
from services.subtitles import generate_subtitles
from services.video_composition import compose_video, burn_subtitles, concatenate_videos
from services.pexels import search_videos
import httpx

load_dotenv()

app = FastAPI()

# Ensure the output directory exists
os.makedirs("backend/outputs", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def download_file(url: str, dest_folder: str):
    local_filename = os.path.join(dest_folder, os.path.basename(url))
    timeout = httpx.Timeout(60.0, connect=5.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url)
        response.raise_for_status()
        with open(local_filename, 'wb') as f:
            f.write(response.content)
    return local_filename

@app.post("/api/v1/generate")
async def generate_video_stream(
    script: str = Form(...),
    voice: str = Form(...),
    video_query: str = Form(None),
    video_file: UploadFile = File(None)
):
    if not video_query and not video_file:
        raise HTTPException(status_code=400, detail="Either a video query or a video file must be provided.")

    async def event_generator():
        temp_dir = tempfile.mkdtemp()
        try:
            yield f"data: {json.dumps({'status': 'Generating voiceover...', 'progress': 10})}\n\n"
            audio_path = os.path.join(temp_dir, "voice.mp3")
            await generate_voiceover(script, voice, audio_path)
            
            # Get audio duration
            audio_clip = AudioFileClip(audio_path)
            audio_duration = audio_clip.duration
            audio_clip.close()

            yield f"data: {json.dumps({'status': 'Finding background video...', 'progress': 30})}\n\n"
            if video_file:
                background_video_path = os.path.join(temp_dir, "background.mp4")
                with open(background_video_path, "wb") as buffer:
                    shutil.copyfileobj(video_file.file, buffer)
            else:
                video_links = await search_videos(video_query, audio_duration)
                if not video_links:
                    raise HTTPException(status_code=404, detail="No videos found for that query.")
                
                yield f"data: {json.dumps({'status': 'Downloading background videos...', 'progress': 40})}\n\n"
                download_tasks = [download_file(link, temp_dir) for link in video_links]
                video_paths = await asyncio.gather(*download_tasks)

                yield f"data: {json.dumps({'status': 'Combining background videos...', 'progress': 50})}\n\n"
                background_video_path = os.path.join(temp_dir, "background.mp4")
                concatenate_videos(video_paths, background_video_path)

            yield f"data: {json.dumps({'status': 'Generating subtitles...', 'progress': 60})}\n\n"
            srt_path = generate_subtitles(audio_path, temp_dir)

            yield f"data: {json.dumps({'status': 'Composing video... this may take a moment.', 'progress': 80})}\n\n"
            composed_video_path = os.path.join(temp_dir, "composed.mp4")
            compose_video(background_video_path, audio_path, composed_video_path)

            yield f"data: {json.dumps({'status': 'Adding subtitles to video...', 'progress': 90})}\n\n"
            final_video_name = f"{uuid.uuid4()}.mp4"
            final_video_path = os.path.join("backend/outputs", final_video_name)
            burn_subtitles(composed_video_path, srt_path, final_video_path)
            
            yield f"data: {json.dumps({'status': 'Done', 'progress': 100, 'videoId': final_video_name})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            shutil.rmtree(temp_dir)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/v1/videos/{video_id}")
async def get_video(video_id: str):
    video_path = os.path.join("backend/outputs", video_id)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found.")
    return FileResponse(video_path, media_type="video/mp4")

@app.get("/")
def read_root():
    return {"Hello": "World"} 