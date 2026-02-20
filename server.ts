import express from "express";
import { createServer as createViteServer } from "vite";
import ytdl from "@distube/ytdl-core";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API to get video info
  app.get("/api/info", async (req, res) => {
    const videoURL = req.query.url as string;
    if (!videoURL) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      if (!ytdl.validateURL(videoURL)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      const info = await ytdl.getInfo(videoURL);
      
      const formats = info.formats
        .filter(f => f.hasVideo && f.hasAudio)
        .map(f => ({
          quality: f.qualityLabel,
          container: f.container,
          url: f.url,
          hasVideo: f.hasVideo,
          hasAudio: f.hasAudio,
          itag: f.itag
        }));

      res.json({
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        duration: info.videoDetails.lengthSeconds,
        author: info.videoDetails.author.name,
        formats: formats
      });
    } catch (error) {
      console.error("Error fetching info:", error);
      res.status(500).json({ error: "Failed to fetch video info. YouTube might be blocking the request." });
    }
  });

  // API to download/stream video
  app.get("/api/download", async (req, res) => {
    const videoURL = req.query.url as string;
    const itag = req.query.itag as string;

    if (!videoURL) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const info = await ytdl.getInfo(videoURL);
      const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
      
      res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
      
      ytdl(videoURL, {
        format: 'mp4',
        quality: itag ? parseInt(itag) : 'highest'
      } as any).pipe(res);

    } catch (error) {
      console.error("Error downloading:", error);
      res.status(500).json({ error: "Download failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
