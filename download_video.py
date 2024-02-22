# download_video.py

# Import necessary libraries
import argparse    # For parsing command-line arguments
import yt_dlp      # YouTube video downloader library

# Function to get video information without downloading
def get_video_info(video_url, options):
    with yt_dlp.YoutubeDL(options) as ydl:
        result = ydl.extract_info(video_url, download=False)
        return result

# Function to download a video
def download_video(video_url, options):
    with yt_dlp.YoutubeDL(options) as ydl:
        ydl.download([video_url])

# Main function that parses command-line arguments and executes corresponding actions
def main():
    # Define command-line arguments
    parser = argparse.ArgumentParser(description='Download YouTube video or get video information with yt-dlp-like behavior')
    
    # The video URL is a required argument
    parser.add_argument('video_url', type=str, help='YouTube video URL')
    
    # -F or --format: Get available formats for the video
    parser.add_argument('-F', '--format', nargs='+', help='Get available formats for the video')
    
    # -f or --download-format: Download video with specified format
    parser.add_argument('-f', '--download-format', nargs='+', help='Download video with specified format')
    
    # -o or --output: Specify output template for downloaded videos
    parser.add_argument('-o', '--output', type=str, help='Specify output template for downloaded videos')
    
    # --get-title: Get video title
    parser.add_argument('--get-title', action='store_true', help='Get video title')
    
    # --get-duration: Get video duration
    parser.add_argument('--get-duration', action='store_true', help='Get video duration')
    
    # --get-thumbnail: Get video thumbnail URL
    parser.add_argument('--get-thumbnail', action='store_true', help='Get video thumbnail URL')
    
    # --encoding: Specify encoding for output
    parser.add_argument('--encoding', type=str, help='Specify encoding for output')

    # Parse command-line arguments
    args = parser.parse_args()

    # Default options for yt_dlp
    options = {
        'format': 'bestvideo+bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }],
    }

    # Configure output template for downloaded videos if both download format and output options are provided
    if args.download_format and args.output:
        options['outtmpl'] = args.output

    # Configure options for extracting information without downloading
    if args.get_title or args.get_duration or args.get_thumbnail or args.encoding:
        options['writesinglejson'] = True

    # Print video title, duration, or thumbnail URL if corresponding options are provided
    if args.get_title:
        print(f"Video Title: {get_video_info(args.video_url, options)['title']}")
    if args.get_duration:
        print(f"Video Duration: {get_video_info(args.video_url, options)['duration']} seconds")
    if args.get_thumbnail:
        print(f"Video Thumbnail URL: {get_video_info(args.video_url, options)['thumbnail']}")

    # Perform actions based on command-line arguments
    if not any([args.get_title, args.get_duration, args.get_thumbnail]):
        if args.format:
            # Get video information and print it
            result = get_video_info(args.video_url, options)
            print(result)
        elif args.download_format:
            # Download the video with the specified format
            options['format'] = args.download_format[0]  # Assuming only one format is specified
            download_video(args.video_url, options)

# Entry point of the script
if __name__ == "__main__":
    main()
