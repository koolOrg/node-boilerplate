# Use the latest Python image
FROM python:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Install yt-dlp
RUN pip install -U yt-dlp

# Copy the Python wrapper script into the container
COPY yt_dlp_wrapper.py .

# Set the entry point to the Python script
ENTRYPOINT ["python", "yt_dlp_wrapper.py"]
