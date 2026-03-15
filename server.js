// ****************** server.js *********************


// Import required modules.
// ----------------------------------------------------------------------------------------------------------------------------
    const express = require("express");          // Express framework for building the server and API endpoints.
    const playdl = require("play-dl");           // Library used to retrieve YouTube video or playlist metadata.
    const youtubedl = require("youtube-dl-exec"); // Wrapper for yt-dlp / youtube-dl used to download media files.
    const fs = require("fs");                    // Node.js File System module for working with files and directories.
    const path = require("path");                // Node.js Path module to safely construct system file paths.
// ----------------------------------------------------------------------------------------------------------------------------


// Initialize Express and configure server port.
// ----------------------------------------------------------------------------------------------------------------------------
    const app = express();   // Creates an Express application instance.
    const port = 3000;       // Defines the port the server will run on.
// ----------------------------------------------------------------------------------------------------------------------------


// Define the /download endpoint.
// ----------------------------------------------------------------------------------------------------------------------------
    app.get("/download-album", async (req, res) =>
    {
        const { url, type } = req.query;
        // Extracts two query parameters from the request:
        // url  → YouTube link (playlist, mix, or single video)
        // type → Determines whether we download "audio" or "video"


// Validate request parameters.
// ------------------------------------------------------------------------------------------------------------------------
        if (!url)
        {
            return res.status(400).send("Error: No URL provided");
        }

        if (!type || (type !== "audio" && type !== "video"))
        {
            return res.status(400).send("Error: type must be 'audio' or 'video'");
        }
// ------------------------------------------------------------------------------------------------------------------------


        try
        {
            let videoList = [];

// Smart detection of playlist vs single video.
// --------------------------------------------------------------------------------------------------------------------
            try
            {
                // Attempt to treat the URL as a playlist first.
                const playlist = await playdl.playlist_info(url, { incomplete: true });

                // Retrieve all videos from the playlist.
                videoList = await playlist.all_videos();

                console.log("Detected: PLAYLIST");
            }
            catch
            {
                // If playlist detection fails, treat it as a single video or YouTube mix.
                const video = await playdl.video_basic_info(url);

                videoList = [{
                    title: video.video_details.title,
                    id: video.video_details.id,
                    url: `https://www.youtube.com/watch?v=${video.video_details.id}`
                }];

                console.log("Detected: SINGLE VIDEO or MIX");
            }
// --------------------------------------------------------------------------------------------------------------------


// Ensure the downloads directory exists.
// --------------------------------------------------------------------------------------------------------------------
            const downloadsDir = path.join(__dirname, "downloads");

            if (!fs.existsSync(downloadsDir))
            {
                fs.mkdirSync(downloadsDir);
            }
// --------------------------------------------------------------------------------------------------------------------


// Function responsible for downloading media files.
// --------------------------------------------------------------------------------------------------------------------
            const downloadMedia = (video) =>
            {
                return new Promise((resolve, reject) =>
                {
                    // Sanitize the video title to avoid illegal file name characters.
                    const sanitizedTitle = video.title.replace(/[^a-zA-Z0-9]/g, "_");

                    // Determine output format depending on request type.
                    const extension = type === "audio" ? "mp3" : "mp4";

                    // Construct the full file path.
                    const filePath = path.join(downloadsDir, `${sanitizedTitle}_${video.id}.${extension}`);


// Configuration object for youtube-dl-exec.
// ------------------------------------------------------------------------------------------------------------
                    const options =
                    {
                        output: filePath,
                        ffmpegLocation: "/usr/bin/ffmpeg"
                    };

                    // If audio download is requested, extract audio and convert to mp3.
                    if (type === "audio")
                    {
                        options.extractAudio = true;
                        options.audioFormat = "mp3";
                    }

                    // If video download is requested, ensure mp4 format.
                    if (type === "video")
                    {
                        options.format = "mp4";
                    }
// ------------------------------------------------------------------------------------------------------------


// Execute the download process.
// ------------------------------------------------------------------------------------------------------------
                    youtubedl(video.url, options)
                    .then(() =>
                    {
                        console.log(`Downloaded successfully: ${sanitizedTitle}`);
                        resolve(filePath);
                    })
                    .catch((err) =>
                    {
                        console.error(`Error processing ${sanitizedTitle}:`, err.message);
                        reject(err);
                    });
// ------------------------------------------------------------------------------------------------------------
                });
            };
// --------------------------------------------------------------------------------------------------------------------


// Download all videos detected from the playlist or single video.
// --------------------------------------------------------------------------------------------------------------------
            const downloadPromises = videoList.map(video => downloadMedia(video));

            // Wait until all downloads finish.
            await Promise.all(downloadPromises);

            // Send response to the client after completion.
            res.send("Download completed successfully!");
// --------------------------------------------------------------------------------------------------------------------


        }
        catch (error)
        {
            // Global error handler for the endpoint.
            console.error("Error downloading media:", error.message || error);

            res.status(500).send(`Error downloading media: ${error.message || "Unknown error"}`);
        }
    });
// ----------------------------------------------------------------------------------------------------------------------------


// Start the Express server.
// ----------------------------------------------------------------------------------------------------------------------------
    app.listen(port, () =>
    {
        console.log(`Server running at http://localhost:${port}`);
    });
// ----------------------------------------------------------------------------------------------------------------------------



// Summary.
/* -------------------------------------------------------------------------------------------------------------------------- *\
This server exposes a /download-album API endpoint that can download media from YouTube.

Features implemented:

1. Supports multiple YouTube URL types:
   - Single videos
   - Playlists
   - YouTube Mix / Radio links

2. Allows the client to choose the download format:
   - type=audio → downloads MP3
   - type=video → downloads MP4

3. Automatically creates a "downloads" directory if it does not exist.

4. Uses play-dl to fetch metadata and youtube-dl-exec to perform the download and conversion.

5. Processes multiple videos in parallel using Promise.all().

Example requests:

Download audio:
http://localhost:3000/download-album?url=YOUTUBE_URL&type=audio

Download video:
http://localhost:3000/download-album?url=YOUTUBE_URL&type=video
\* -------------------------------------------------------------------------------------------------------------------------- */
