from moviepy import VideoFileClip, concatenate_videoclips, AudioFileClip
from moviepy.video.fx.Crop import Crop
from typing import List
from utils.project_directory import get_final_video_path, get_project_dir
from models import ReelioVideoPlan
import shutil 

def generate_video(files: List[str], title: str, audio_path: str):

    # Load audio (voiceover)
    audio = AudioFileClip(audio_path)
    target_duration = audio.duration  # total video duration must match this

    print(f"[🎵] Target video duration: {target_duration:.2f}s")

    # Prepare video clips
    all_clips = []
    total_clip_duration = 0

    for file in files:
        clip = VideoFileClip(file)

        # Crop to center 1080x1920 for portrait style (Reels/Shorts)
        (w, h) = clip.size
        crop_effect = Crop(x_center=w/2, y_center=h/2, width=1080, height=h)
        cropped_clip = crop_effect.copy().apply(clip)
        final_clip = cropped_clip.resized((720, 1280))

        # Ensure no clip is unnecessarily long (limit to 15s)
        if final_clip.duration > 15:
            final_clip = final_clip.subclipped(0, 15)

        all_clips.append(final_clip)
        total_clip_duration += final_clip.duration

    print(f"[🎬] Combined clip duration before trimming: {total_clip_duration:.2f}s")

    # Concatenate all visuals
    final_clip = concatenate_videoclips(all_clips, method="compose")

    # Adjust to match audio duration (trim or loop)
    if final_clip.duration > target_duration:
        print("[✂️] Trimming video to match audio length")
        final_clip = final_clip.subclipped(0, target_duration)
    elif final_clip.duration < target_duration:
        print("[🔁] Extending visuals to match audio length")
        loops = int(target_duration // final_clip.duration) + 1
        looped = [final_clip] * loops
        final_clip = concatenate_videoclips(looped, method="compose").subclipped(0, target_duration)

    # Add voiceover
    final_with_audio = final_clip.with_audio(audio)

    # Export final video
    output_path = get_final_video_path(title)
    print(f"[💾] Saving final video to: {output_path}")
    final_with_audio.write_videofile(output_path, fps=30, codec="libx264", audio_codec="aac", preset="superfast", threads=8)

    # Cleanup
    audio.close()
    for clip in all_clips:
        clip.close()

    shutil.rmtree(get_project_dir(title))

    return output_path

def get_video(response: ReelioVideoPlan):

    selected_files = []
    for scene in response.scenes:
        selected_files.append(scene.downloaded_files[0])

    output_path = generate_video(selected_files, response.title, response.audio_path)

    response.final_video_path = output_path

    return response
