import logging
from moviepy.editor import VideoFileClip, ImageClip, TextClip, CompositeVideoClip, ColorClip
import moviepy
import moviepy.editor as mp

def add_logo_and_title(video_path, logo_path, title, final_output_path, filetype, character, channel):
    try:
        logging.info(f'add_logo_and_title - videoPath: {video_path}, logoPath: {logo_path}, title: {title}, finalOutputPath: {final_output_path}, channel: {channel}, filetype: {filetype}, character: {character}')
        
        # Print MoviePy version
        logging.info(f'MoviePy version: {moviepy.__version__}')

        # Convert Path objects to strings
        video_path = str(video_path)
        logo_path = str(logo_path)
        final_output_path = str(final_output_path)

        video = VideoFileClip(video_path)

        # Create black background clips
        top_background = ColorClip(size=(video.w, 400), color=(0, 0, 0)).set_duration(video.duration)
        bottom_background = ColorClip(size=(video.w, 200), color=(0, 0, 0)).set_duration(video.duration).set_position(("bottom"))

        # Load and resize the logo
        logo = (ImageClip(logo_path)
                .set_duration(video.duration)
                .resize(height=200)
                .set_pos(("right", "top")))

        # Create the title text clip
        text_clip = (TextClip(title, fontsize=40 if channel == 'StorySynth' else 25, color='#F3E778', font="Roboto-Bold")
                     .set_duration(video.duration)
                     .set_pos(('center', 200))
                     .set_start(0))

        # Composite the video with the black backgrounds, logo, and text
        video = CompositeVideoClip([video, top_background, bottom_background, logo, text_clip])
        video.write_videofile(final_output_path, codec='libx264')
        logging.info(f'Final video with logo and title added successfully: {final_output_path}')
    except Exception as e:
        logging.error(f'Error adding logo and title to video: {e}')
        raise

# Define the parameters
video_path = "/app/src/output/video/CityCostCruise/662e867299407f00320adbad/662e867299407f00320adbad-final-Vonly.mp4"
logo_path = "/app/src/input/image/CityCostCruise/logo.png"
title = "Test"
final_output_path = "/app/src/output/video/CityCostCruise/662e867299407f00320adbad/662e867299407f00320adbad-final.mp4"
channel = "CityCostCruise"
filetype = "png"
character = "Test1"

# Call the function
add_logo_and_title(video_path, logo_path, title, final_output_path, filetype, character, channel)

