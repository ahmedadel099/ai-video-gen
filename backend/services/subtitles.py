import whisper
import os

def generate_subtitles(audio_file: str, output_dir: str) -> str:
    """
    Generates subtitles from an audio file using Whisper and saves them as an SRT file.
    Returns the path to the generated SRT file.
    """
    model = whisper.load_model("tiny")
    result = model.transcribe(audio_file, fp16=False)

    # whisper creates the srt file itself, but we need to control the name
    srt_path = os.path.join(output_dir, "subtitles.srt")
    
    with open(srt_path, "w", encoding="utf-8") as srt_file:
        # A simple SRT formatting logic
        for i, segment in enumerate(result["segments"]):
            start_time = format_timestamp(segment['start'])
            end_time = format_timestamp(segment['end'])
            text = segment['text'].strip()
            
            srt_file.write(f"{i + 1}\n")
            srt_file.write(f"{start_time} --> {end_time}\n")
            srt_file.write(f"{text}\n\n")
            
    return srt_path

def format_timestamp(seconds: float):
    """Formats time in seconds to SRT timestamp format."""
    assert seconds >= 0, "non-negative timestamp expected"
    milliseconds = round(seconds * 1000.0)

    hours = milliseconds // 3_600_000
    milliseconds %= 3_600_000

    minutes = milliseconds // 60_000
    milliseconds %= 60_000

    seconds = milliseconds // 1_000
    milliseconds %= 1_000

    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}" 