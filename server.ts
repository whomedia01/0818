import express from "express";
import path from "path";
import fs from "fs";
import { InquiryDatabase, AdminAuth } from "./src/server/db";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = InquiryDatabase.getInstance();

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), "public")));

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

  // ==========================================
  // Public Customer Inquiry Submission API
  // ==========================================
  app.post("/api/inquiry", (req, res) => {
    try {
      const { company, name, phone, category, message } = req.body;

      if (!name || !phone || !category || !message) {
        return res.status(400).json({ success: false, message: "필수 입력 항목(성함, 연락처, 문의유형, 내용)이 누락되었습니다." });
      }

      const newInquiry = db.create({
        company,
        name,
        phone,
        category,
        message
      });

      console.log(`[INQUIRY SAVED TO DB - ID: ${newInquiry.id}]`, {
        name: newInquiry.name,
        company: newInquiry.company,
        phone: newInquiry.phone,
        category: newInquiry.category,
        time: newInquiry.formattedDate
      });

      return res.status(201).json({
        success: true,
        message: "문의가 성공적으로 접수되어 데이터베이스에 안전하게 기록되었습니다.",
        inquiry: newInquiry
      });
    } catch (error) {
      console.error("Inquiry processing error:", error);
      return res.status(500).json({ success: false, message: "문의 접수 중 서버 오류가 발생했습니다." });
    }
  });

  // ==========================================
  // Admin Authentication & Protected Endpoints
  // ==========================================

  // Admin Auth Middleware
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "관리자 로그인이 필요합니다." });
    }

    const token = authHeader.substring(7);
    const authResult = AdminAuth.verifyToken(token);
    if (!authResult.valid) {
      return res.status(401).json({ success: false, message: "세션이 만료되었거나 유효하지 않은 인증 토큰입니다. 다시 로그인해 주세요." });
    }

    (req as any).adminUser = authResult.username;
    next();
  };

  // 1. Admin Login API
  app.post("/api/admin/login", (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: "아이디와 비밀번호를 모두 입력해 주세요." });
      }

      const isValid = AdminAuth.verifyCredentials(username, password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }

      const token = AdminAuth.generateToken(username);
      return res.json({
        success: true,
        message: "관리자로 성공적으로 로그인되었습니다.",
        token,
        user: {
          username,
          role: "super_admin",
          loginTime: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error("Admin login error:", err);
      return res.status(500).json({ success: false, message: "로그인 처리 중 서버 오류가 발생했습니다." });
    }
  });

  // 2. Admin Check Auth Token API
  app.get("/api/admin/check-auth", requireAdmin, (req, res) => {
    return res.json({
      success: true,
      user: {
        username: (req as any).adminUser,
        role: "super_admin"
      }
    });
  });

  // 3. Admin Dashboard Statistics API
  app.get("/api/admin/stats", requireAdmin, (_req, res) => {
    const stats = db.getStats();
    return res.json({ success: true, stats });
  });

  // 4. Admin Inquiries List API (with Filter, Search)
  app.get("/api/admin/inquiries", requireAdmin, (req, res) => {
    const { status, category, search } = req.query;
    const inquiries = db.getAll({
      status: typeof status === "string" ? status : undefined,
      category: typeof category === "string" ? category : undefined,
      search: typeof search === "string" ? search : undefined
    });
    const stats = db.getStats();

    return res.json({
      success: true,
      count: inquiries.length,
      stats,
      inquiries
    });
  });

  // 5. Admin Single Inquiry Detail API
  app.get("/api/admin/inquiries/:id", requireAdmin, (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const inquiry = db.getById(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "해당 문의 내역을 찾을 수 없습니다." });
    }
    return res.json({ success: true, inquiry });
  });

  // 6. Admin Update Inquiry Status & Note API
  app.patch("/api/admin/inquiries/:id", requireAdmin, (req, res) => {
    const { status, adminNote } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (status && !["대기", "확인중", "답변완료"].includes(status)) {
      return res.status(400).json({ success: false, message: "유효하지 않은 상태값입니다. ('대기', '확인중', '답변완료' 중 선택)" });
    }

    const updated = db.updateStatus(id, status as any, adminNote);
    if (!updated) {
      return res.status(404).json({ success: false, message: "해당 문의 건을 찾을 수 없습니다." });
    }

    return res.json({
      success: true,
      message: `문의 상태가 '${updated.status}'(으)로 업데이트되었습니다.`,
      inquiry: updated,
      stats: db.getStats()
    });
  });

  // 7. Admin Delete Inquiry API
  app.delete("/api/admin/inquiries/:id", requireAdmin, (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = db.delete(id);
    if (!success) {
      return res.status(404).json({ success: false, message: "삭제할 문의 내역을 찾을 수 없습니다." });
    }
    return res.json({
      success: true,
      message: "문의 내역이 영구적으로 삭제되었습니다.",
      stats: db.getStats()
    });
  });

  // ==========================================
  // Client & Admin UI Routing Handler
  // ==========================================
  let vite: any = null;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    // Development Admin route
    app.get(/^\/admin(\/.*)?$/, async (_req, res, next) => {
      try {
        const adminHtmlPath = path.join(process.cwd(), "admin.html");
        if (fs.existsSync(adminHtmlPath)) {
          const rawHtml = fs.readFileSync(adminHtmlPath, "utf-8");
          try {
            const html = await vite.transformIndexHtml("/admin.html", rawHtml);
            return res.status(200).set({ "Content-Type": "text/html" }).end(html);
          } catch {
            return res.status(200).set({ "Content-Type": "text/html" }).end(rawHtml);
          }
        }
        next();
      } catch (e) {
        next(e);
      }
    });

    // Development Main Landing fallback route
    app.use(async (req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.originalUrl.startsWith("/api/")) return next();
      try {
        const indexHtmlPath = path.join(process.cwd(), "index.html");
        const rawHtml = fs.readFileSync(indexHtmlPath, "utf-8");
        try {
          const url = req.originalUrl.replace(/[?#].*$/, '') || '/';
          const html = await vite.transformIndexHtml(url, rawHtml);
          return res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch {
          return res.status(200).set({ "Content-Type": "text/html" }).end(rawHtml);
        }
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Production Admin route
    app.get(/^\/admin(\/.*)?$/, (_req, res) => {
      const adminDistPath = path.join(distPath, "admin.html");
      if (fs.existsSync(adminDistPath)) {
        return res.sendFile(adminDistPath);
      }
      return res.sendFile(path.join(distPath, "index.html"));
    });

    // Production fallback
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.originalUrl.startsWith("/api/")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WHO MEDIA] Server running on http://localhost:${PORT}`);
    console.log(`[WHO MEDIA] Admin Dashboard available at http://localhost:${PORT}/admin`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
});
