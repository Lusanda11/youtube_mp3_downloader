// ****************** server.js *********************



// Import required modules.
// ----------------------------------------------------------------------------------------------------------------------------
    const express = require("express"); // Express framework for creating a server and handling HTTP requests.
    const playdl = require("play-dl"); // Play-DL library for fetching YouTube playlist metadata.
    const youtubedl = require("youtube-dl-exec"); // youtube-dl-exec for downloading and converting YouTube videos.
    const fs = require("fs"); // Node.js File System module to handle file operations.
    const path = require("path"); // Node.js Path module to handle file paths.
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    The required modules are imported:
    express is used to create a server and handle routing.
    play-dl fetches metadata from YouTube playlists.
    youtube-dl-exec is used to download videos and convert them to audio formats.
    fs is for file and directory management.
    path helps construct file paths in a cross-platform way.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Initialize an Express application and define the port.
// ----------------------------------------------------------------------------------------------------------------------------
    const app = express(); // Creates an instance of the Express application.
    const port = 3000; // Port number where the server will listen for requests.
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    Initializes the Express app and sets the server to listen on port 3000.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Define the /download-album endpoint.
// ----------------------------------------------------------------------------------------------------------------------------
    app.get("/download-album", async (req, res) =>
    {
        const { url } = req.query; // Extracts the 'url' query parameter from the request.

        if (!url)
        {
            return res.status(400).send("Error: No URL provided"); // Returns a 400 error if URL is missing.
        }
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    Defines a GET endpoint /download-album.
    Extracts the url query parameter from the request.
    Checks if the url parameter is provided; if not, sends a 400 status error.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Fetching Playlist Information with Play-DL.
// ----------------------------------------------------------------------------------------------------------------------------
        try
        {
            const playlist = await playdl.playlist_info(url); // Fetches playlist metadata from the provided URL.
            const videoList = await playlist.all_videos(); // Retrieves an array of videos in the playlist.
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    Using play-dl, retrieves metadata of the playlist specified by the url.
    Calls all_videos() to get a list of all videos within the playlist.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Ensure 'downloads' directory exists.
// ----------------------------------------------------------------------------------------------------------------------------
            if (!fs.existsSync(path.join(__dirname, "downloads")))
            {
                fs.mkdirSync(path.join(__dirname, "downloads")); // Creates the 'downloads' directory if it doesn't already exist.
            }
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    Checks if the downloads directory exists; if not, creates it.
    This ensures that all downloaded files will have a designated folder.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Function to Download and Convert Each Video to mp3 Format.
// ----------------------------------------------------------------------------------------------------------------------------
            const downloadAndConvertToMp3 = (video) =>
            {
                return new Promise((resolve, reject) =>
                {
                    const sanitizedTitle = video.title.replace(/[^a-zA-Z0-9]/g, "_"); // Sanitizes video title for file naming.
                    const filePath = path.join(__dirname, "downloads", `${sanitizedTitle}_${video.id}.mp3`); // Defines the output path for the mp3 file.

                    youtubedl(video.url,
                    {
                        extractAudio: true,      // Only extract the audio.
                        audioFormat: "mp3",      // Convert the audio to mp3 format.
                        output: filePath,        // Specify the output path for the converted file.
                        ffmpegLocation: "/usr/bin/ffmpeg" // Path to FFmpeg executable (adjust if necessary).
                    })
                    .then(() =>
                    {
                        console.log(`Downloaded and converted: ${sanitizedTitle}`);
                        resolve(filePath); // Resolves the promise on successful download and conversion.
                    })
                    .catch((err) =>
                    {
                        console.error(`Error processing ${sanitizedTitle}:`, err.message);
                        reject(err); // Rejects the promise if an error occurs.
                    });
                });
            };
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    Defines downloadAndConvertToMp3, a helper function that downloads and converts each video.
    The sanitizedTitle variable replaces invalid characters for safe file naming.
    filePath sets the location and naming convention for each downloaded mp3 file.
    youtube-dl-exec downloads and converts each video to mp3.
    On success, the promise resolves with filePath; if an error occurs, the promise is rejected.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Initiate Download and Conversion for All Videos.
// ----------------------------------------------------------------------------------------------------------------------------
            const downloadPromises = videoList.map(video => downloadAndConvertToMp3(video)); // Maps each video to the download-and-convert function.
            await Promise.all(downloadPromises); // Waits for all download promises to complete.

            res.send("All videos downloaded and converted successfully!"); // Sends a success response to the client.
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    Maps each video in videoList to the downloadAndConvertToMp3 function, creating an array of download promises.
    Promise.all() waits for all downloads to complete before sending a success message to the client.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Error Handling for Playlist Downloading.
// ----------------------------------------------------------------------------------------------------------------------------
        }
        catch (error)
        {
             console.error("Error downloading playlist:", error.message || error); // Logs the error if playlist downloading fails.
             res.status(500).send(`Error downloading playlist: ${error.message || "Unknown error"}`); // Sends a 500 error response.
        }
    });
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    Catches any errors that occur during playlist processing and logs them.
    Sends a 500 status code response with an error message if the playlist download fails.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Start the Server.
// ----------------------------------------------------------------------------------------------------------------------------
    app.listen(port, () =>
    {
        console.log(`Server running at http://localhost:${port}`);
    });
// ----------------------------------------------------------------------------------------------------------------------------

// Explanation.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    Starts the Express server and logs a message indicating the server’s running status and URL.
\* -------------------------------------------------------------------------------------------------------------------------- */


// Summary.
/* -------------------------------------------------------------------------------------------------------------------------- *\
    This code sets up an Express server with a single endpoint /download-album to download and convert all videos in a YouTube playlist to mp3 files.
    The play-dl library fetches playlist metadata, while youtube-dl-exec handles downloading and converting each video.
    Error handling and logging are included throughout to manage issues with missing URLs or download failures.
\* -------------------------------------------------------------------------------------------------------------------------- */
