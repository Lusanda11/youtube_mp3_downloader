# YouTube Playlist Media Downloader

This Node.js application downloads YouTube media and converts it into either **MP3 audio files** or **MP4 video files**. It supports downloading **single videos, playlists, and YouTube mix/radio links**.

The application uses `youtube-dl-exec` for downloading media and `ffmpeg` for converting audio files to MP3 format.

## Features

- Download **single YouTube videos**, **playlists**, or **mix/radio links**.
- Choose between **MP3 audio downloads** or **MP4 video downloads**.
- Automatically converts audio files to **MP3 format**.
- Stores downloaded files in a designated **downloads** directory.
- Automatically creates the downloads folder if it does not exist.

## Requirements

- Node.js (version 14 or higher recommended)
- Internet connection
- **FFmpeg installed on your system**

Example installation (Linux):

```bash
sudo pacman -S ffmpeg
```

## Installation

1. Clone the repository or download the project files.

2. Navigate to the project directory and install dependencies:

```bash
npm install
```

## Usage

### 1. Start the server

```bash
npm start
```

After starting the server you should see:

```
Server running at http://localhost:3000
```

### 2. Access the downloader

The downloader endpoint requires **two parameters**:

| Parameter | Description |
|-----------|-------------|
| `url` | The YouTube video or playlist URL |
| `type` | Determines the output format (`audio` or `video`) |

General format:

```
http://localhost:3000/download-album?url=YOUTUBE_URL&type=audio_or_video
```

## Download Examples

### Download a YouTube video as MP3 (Audio)

```
http://localhost:3000/download-album?url=https://www.youtube.com/watch?v=VIDEO_ID&type=audio
```

This will:

- Download the video
- Extract the audio
- Convert it to **MP3**
- Save it in the `downloads` folder

### Download a YouTube video as MP4 (Video)

```
http://localhost:3000/download-album?url=https://www.youtube.com/watch?v=VIDEO_ID&type=video
```

This will:

- Download the full video
- Save it in **MP4 format**
- Store it in the `downloads` directory

### Download an entire playlist as MP3

```
http://localhost:3000/download-album?url=https://www.youtube.com/playlist?list=PLAYLIST_ID&type=audio
```

Every video in the playlist will be downloaded and converted to **MP3 files**.

### Download an entire playlist as MP4

```
http://localhost:3000/download-album?url=https://www.youtube.com/playlist?list=PLAYLIST_ID&type=video
```

Each video will be downloaded in **MP4 format**.

## Important: Understanding the `type` Parameter

The `type` parameter determines **what format the downloaded media will be saved as**.

| Parameter Value | Result |
|-----------------|-------|
| `type=audio` | Converts the video into an **MP3 audio file** |
| `type=video` | Downloads the **full MP4 video** |

Example comparison:

Audio download:

```
http://localhost:3000/download-album?url=https://www.youtube.com/watch?v=mWA5E2FWIA8&type=audio
```

Video download:

```
http://localhost:3000/download-album?url=https://www.youtube.com/watch?v=mWA5E2FWIA8&type=video
```

If the `type` parameter is missing, the server will return an error:

```
Error: type must be 'audio' or 'video'
```

## Project Structure

| Path | Description |
|-----|-------------|
| `youtube-downloader/` | Project root folder |
| ├── `server.js` | Main Express server |
| ├── `downloads/` | Folder where media files are stored |
| ├── `package.json` | npm dependencies and scripts |
| └── `README.md` | Project documentation |

## Dependencies

- `express`: Web framework for handling HTTP requests.
- `youtube-dl-exec`: Downloads media from YouTube.
- `play-dl`: Retrieves YouTube playlist and video metadata.
- `ffmpeg`: Converts video audio streams into MP3 format.

## Notes

- Only download content you have permission to use.
- Large playlists may take longer to process.
- Mix/radio links will download the currently playing video.

## License

This project is licensed under the **Unlicensed** license.
