import PIL.Image

if not hasattr(PIL.Image, 'Resampling'):
    PIL.Image.Resampling = PIL.Image
# Monkey patch for Pillow 10.0.0 and moviepy
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS

from moviepy.editor import (
    VideoFileClip, AudioFileClip, CompositeVideoClip,
    TextClip, concatenate_videoclips
)
from moviepy.video.tools.subtitles import SubtitlesClip

def burn_subtitles(video_path: str, srt_path: str, output_path: str):
    """
    Burns subtitles onto a video file.
    """
    video_clip = VideoFileClip(video_path)
    
    # Improved text styling
    generator = lambda txt: TextClip(
        txt,
        font='Impact',
        fontsize=52,
        color='white',
        stroke_color='black',
        stroke_width=3
    )

    subtitles = SubtitlesClip(srt_path, generator)
    
    # Position subtitles at 70% of the video height (more padding from bottom)
    positioned_subtitles = subtitles.set_position(("center", 0.70), relative=True)
    
    result = CompositeVideoClip([video_clip, positioned_subtitles])
    
    result.write_videofile(output_path, codec="libx264", audio_codec="aac")
    video_clip.close()
    result.close()


def concatenate_videos(video_paths: list[str], output_path: str):
    """
    Concatenates multiple video clips into one.
    """
    clips = [VideoFileClip(path) for path in video_paths]
    final_clip = concatenate_videoclips(clips)
    final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
    for clip in clips:
        clip.close()
    final_clip.close()


def compose_video(video_path: str, audio_path: str, output_path: str):
    """
    Composes the final video by combining the video clip with the new audio.
    Resizes the video to a 9:16 aspect ratio (1080x1920).
    """
    video_clip = VideoFileClip(video_path)
    audio_clip = AudioFileClip(audio_path)

    # Set the audio of the video clip to the new audio
    final_clip = video_clip.set_audio(audio_clip)

    # Resize to 1080x1920 for vertical video
    final_clip_resized = final_clip.resize(height=1920)
    final_clip_resized = final_clip_resized.crop(x_center=final_clip_resized.w/2, width=1080)


    # Ensure the duration matches the audio
    if final_clip_resized.duration > audio_clip.duration:
        final_clip_resized = final_clip_resized.subclip(0, audio_clip.duration)

    final_clip_resized.write_videofile(output_path, codec="libx264", audio_codec="aac")
    
    video_clip.close()
    audio_clip.close()
    final_clip.close()
    final_clip_resized.close() 