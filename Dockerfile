# FROM ubuntu:20.04

# ENV DEBIAN_FRONTEND=noninteractive

# # Set work directory
# WORKDIR /app

# # Install Node.js, ffmpeg, and fonts
# RUN apt-get update && \
#     apt-get install -y curl ffmpeg python3 python3-pip git fonts-roboto && \
#     curl -fsSL https://deb.nodesource.com/setup_14.x | bash - && \
#     apt-get install -y nodejs && \
#     rm -rf /var/lib/apt/lists/*

# # Install Python packages for subtitles
# RUN pip install git+https://github.com/m1guelpf/auto-subtitle.git ffmpeg-python
# # Copy only the package.json and package-lock.json (or yarn.lock)
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the application files
# COPY . .

# # Replace the auto-subtitle CLI script
# COPY cli.py /usr/local/lib/python3.8/dist-packages/auto_subtitle/cli.py
# # Find Python site-packages directory and copy the cli.py file
# # RUN PYTHON_SITE_PACKAGES_DIR=$(python3 -m site --user-site | sed 's|/site-packages$||') && \
# #     cp cli.py ${PYTHON_SITE_PACKAGES_DIR}/dist-packages/auto_subtitle/cli.py

# # Ensure npm and node are installed
# RUN node -v
# RUN npm -v

# # Ensure the fonts are registered
# RUN fc-cache -fv

# # Install Node.js dependencies
# # RUN npm install

# # Set environment variable for ffprobe path
# ENV FFPROBE_PATH /app/node_modules/ffprobe-static/bin/ffprobe

# # Expose port 3000
# EXPOSE 3000

# # Map volumes for input and output directories
# VOLUME ["/app/src/input", "/app/src/output"]

# # Use an environment variable to choose between 'dev' and 'prod' modes
# ARG ENV_MODE=prod

# # Use a conditional statement to set the command based on the environment mode
# CMD if [ "$ENV_MODE" = "dev" ]; then npm run dev; else npm start; fi

# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Set the working directory
WORKDIR /app

# Install Node.js, ffmpeg, Python, and fonts
RUN apt-get update && \
    apt-get install -y curl  ffmpeg python3 python3-pip git fonts-roboto && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Python packages for subtitles
RUN pip3 install git+https://github.com/m1guelpf/auto-subtitle.git ffmpeg-python

# Copy only the package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install
RUN pip install -U yt-dlp

# Copy the application files
COPY . .

# Replace the auto-subtitle CLI script
COPY cli.py /usr/local/lib/python3.10/dist-packages/auto_subtitle/cli.py

# Ensure npm and node are installed
RUN node -v
RUN npm -v

# Ensure the fonts are registered
RUN fc-cache -fv

# Set environment variable for ffprobe path
ENV FFPROBE_PATH /app/node_modules/ffprobe-static/bin/ffprobe

# Expose port 3000
EXPOSE 3000

# Map volumes for input and output directories
VOLUME ["/app/src/input", "/app/src/output"]

# Use an environment variable to choose between 'dev' and 'prod' modes
ARG ENV_MODE=prod

# Use a conditional statement to set the command based on the environment mode
CMD if [ "$ENV_MODE" = "dev" ]; then npm run dev; else npm start; fi



# docker ps -q | % { docker stop $_ }  
# docker build -t contentidea-backend .

#for prod
# docker run -p 3000:3000 -v $(pwd)/src/input:/app/src/input -v $(pwd)/src/output:/app/src/output contentidea-backend

#docker run -p 3000:3000 -v "$(pwd)/src/input:/app/src/input" -v "$(pwd)/src/output:/app/src/output" -e ENV_MODE=dev contentidea-backend

#detached mode
# docker run -d -p 3000:3000 -v "$(pwd)/src/input:/app/src/input" -v "$(pwd)/src/output:/app/src/output" -e ENV_MODE=dev contentidea-backend
# docker run -d --name contentidea-backend-container -p 3000:3000 -v "$(pwd)/src/input:/app/src/input" -v "$(pwd)/src/output:/app/src/output" -e ENV_MODE=dev contentidea-backend

#for dev
# docker run -p 3000:3000 -v $(pwd)/src/input:/app/src/input -v $(pwd)/src/output:/app/src/output -e ENV_MODE=dev contentidea-backend 


# @stop all docker container
# docker ps -q | % { docker stop $_ }

## This is to expose the Ffmpeg file to the container
# docker run -p 3000:3000 -v "$(pwd)/src/input:/app/src/input" -v "$(pwd)/src/output:/app/src/output" -v "$(pwd)/src/utils/:/app/src/utils" -e ENV_MODE=dev contentidea-backend




# docker build -t contentidea-backend:1.0.0 -t contentidea-backend:latest .
# docker run -p 3000:3000 -v "$(pwd)/src/input:/app/src/input" -v "$(pwd)/src/output:/app/src/output" -v "$(pwd)/src/utils:/app/src/utils" -e ENV_MODE=dev --name contentidea-backend-container --restart unless-stopped contentidea-backend


#separate docker container
## apt-get update && apt-get install -y ffmpeg python3 python3-pip git
# pip install git+https://github.com/m1guelpf/auto-subtitle.git
# pip install ffmpeg-python
# https://github.com/m1guelpf/auto-subtitle


## add these to auto_subtitle 's cli.py file line 65'
#     ffmpeg.concat(
#   video.filter('subtitles', srt_path, force_style="Fontsize=10,MarginV=10,Alignment=2,OutlineColour=&H40000000,BorderStyle=3"), audio, v=1, a=1
#   ).output(out_path).run(quiet=True, overwrite_output=True)



# // youtube_dl download music
# pip install -U yt-dlp
# yt-dlp -x --audio-format mp3 --audio-quality 0 "https://www.youtube.com/watch?v=X9y5ka70Qto"
