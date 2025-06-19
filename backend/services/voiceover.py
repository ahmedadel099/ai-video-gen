import asyncio
import edge_tts

async def generate_voiceover(text: str, voice: str, output_file: str) -> None:
    """
    Generates an MP3 voiceover from text using the specified voice
    and saves it to a file.
    """
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file) 