import express from "express";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Cached studio images store
  let studioImagesCache: any[] = [];
  let studioCacheTimestamp = 0;
  const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache for instant GitHub reflection

  // Dynamic GitHub image sync API for whomedia01/who-new809/img
  app.get("/api/studio-images", async (_req, res) => {
    const now = Date.now();
    if (studioImagesCache.length > 0 && now - studioCacheTimestamp < CACHE_TTL_MS) {
      return res.json({ success: true, count: studioImagesCache.length, images: studioImagesCache, source: 'cache' });
    }

    try {
      const response = await fetch("https://api.github.com/repos/whomedia01/who-new809/contents/img?ref=main", {
        headers: {
          "User-Agent": "WhoMedia-Studio-Sync",
          "Accept": "application/vnd.github.v3+json"
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}`);
      }

      const contents = await response.json();
      if (Array.isArray(contents)) {
        const imageExtensions = /\.(jpe?g|png|webp|svg|gif|avif)$/i;
        const filteredImages = contents
          .filter((item: any) => item.type === "file" && imageExtensions.test(item.name))
          .map((item: any, idx: number) => ({
            id: `studio_img_${idx + 1}`,
            index: idx + 1,
            title: `후미디어 전문 스튜디오 전경 #${String(idx + 1).padStart(2, '0')}`,
            fileName: item.name,
            imageUrl: `https://cdn.jsdelivr.net/gh/whomedia01/who-new809@main/img/${encodeURIComponent(item.name)}`,
            rawUrl: item.download_url || `https://raw.githubusercontent.com/whomedia01/who-new809/main/img/${encodeURIComponent(item.name)}`,
            thumbUrl: `https://cdn.jsdelivr.net/gh/whomedia01/who-new809@main/img/${encodeURIComponent(item.name)}`,
            size: item.size,
            sha: item.sha
          }));

        if (filteredImages.length > 0) {
          studioImagesCache = filteredImages;
          studioCacheTimestamp = now;
          return res.json({ success: true, count: filteredImages.length, images: filteredImages, source: 'github_live' });
        }
      }
    } catch (err: any) {
      console.warn("Dynamic studio images fetch warning:", err?.message || err);
    }

    // Return current cached or empty list if rate limited
    return res.json({ success: true, count: studioImagesCache.length, images: studioImagesCache, source: 'fallback' });
  });

  // API endpoint for Project/Rental Inquiry Submission
  app.post("/api/inquiry", async (req, res) => {
    try {
      const { company, name, phone, category, message } = req.body;
      const createdAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

      if (!company || !name || !phone || !category || !message) {
        return res.status(400).json({ success: false, message: "필수 입력 항목이 누락되었습니다." });
      }

      console.log(`[INQUIRY RECEIVED]`, { company, name, phone, category, message, createdAt });

      return res.json({
        success: true,
        message: "문의가 성공적으로 접수되었습니다."
      });
    } catch (error) {
      console.error("Inquiry processing error:", error);
      return res.status(500).json({ success: false, message: "문의 접수 중 서버 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development / Production static serve
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
