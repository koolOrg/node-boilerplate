import sys
import subprocess
import logging

def main():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    try:
        # Command line arguments passed to the Python script
        output_path = sys.argv[1]
        url = sys.argv[2]

        # Build the yt-dlp command
        command = ['yt-dlp', '-o', output_path, url]

        # Run yt-dlp
        subprocess.run(command, check=True)
        logging.info("Download completed successfully.")
    except Exception as e:
        logging.error(f"Error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python yt_dlp_wrapper.py <output_path> <url>")
        sys.exit(1)
    main()
