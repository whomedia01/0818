import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { InquiryDatabase, AdminAuth } from "./src/server/db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = InquiryDatabase.getInstance();

  // Enable CORS for all origins, methods, and headers so admin can access from any IP/device/network
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  }));

  // Canonical Domain 301 Redirect for legacy / hosting alias domains
  app.use((req, res, next) => {
    const host = (req.headers.host || "").toLowerCase();
    if (host.includes("whomedia1.iisweb.co.kr") || host.includes("iisweb.co.kr")) {
      return res.redirect(301, `https://www.whomedia.co.kr${req.originalUrl}`);
    }
    next();
  });

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), "public")));

  // Explicitly excluded chromakey files per user mandate
  const EXCLUDED_CHROMAKEY_FILES = new Set([
    'DSCF0058.JPG',
    'DSCF0060.JPG',
    'DSCF0090.JPG',
    'DSCF0129.JPG',
    'DSCF0142.JPG',
    'DSCF0169.JPG',
    'DSCF0173.JPG',
    'DSCF0183.JPG',
    'DSCF0191.JPG',
    'DSCF0196.JPG',
    'DSCF0233.JPG',
    'DSCF0240.JPG',
    'DSCF0254.JPG',
    'DSCF0257.JPG',
    'KakaoTalk_20240125_151732483_01.jpg',
    'KakaoTalk_20240126_151923014_05.jpg',
    'KakaoTalk_20240523_150928871.jpg',
    'KakaoTalk_20240523_150928871_02.jpg',
    'studio_chromakey.svg',
    'studio_white_horizont.svg'
  ]);

  // Verified authentic studio facility photos (White Horizont, Electronic Blackboard, Control Room, Equipment)
  const VERIFIED_CLEAN_STUDIO_METADATA: Record<string, string> = {
    'KakaoTalk_20260917_003738719.jpg': '후미디어 대형 화이트 호리존트 와이드 전경',
    'KakaoTalk_20260917_003738719_01.jpg': '후미디어 대형 화이트 호리존트 와이드 전경',
    'KakaoTalk_20260917_003738719_04.jpg': '화이트 호리존트 특수 조명 & 멀티 앵글 세팅',
    'KakaoTalk_20260917_003738719_06.jpg': '무이음 화이트 호리존트 인터랙티브 연출 환경',
    'KakaoTalk_20260917_003738719_07.jpg': '화이트 호리존트 4K 멀티캠 촬영 시스템',
    'KakaoTalk_20240124_151422660_01.jpg': '후미디어 대형 무이음 화이트 호리존트 세트',
    'DSCF0043.JPG': '후미디어 부조정실 메인 콘솔 시스템',
    'DSCF0045.JPG': '스튜디오 실시간 모니터링 디스플레이',
    'DSCF0046.JPG': '전자칠판 및 방송 제작 데스크',
    'DSCF0048.JPG': '전문 스튜디오 종합 영상 제작 환경',
    'DSCF0049.JPG': '라이브 스트리밍 및 영상 송출 제어실',
    'DSCF0050.JPG': '부조정실 멀티뷰 모니터링 시스템',
    'DSCF0057.JPG': '후미디어 스튜디오 촬영 입구 전경',
    'DSCF0100.JPG': '후미디어 스튜디오 종합 제작 환경',
    'DSCF0103.JPG': '스마트 전자칠판 전용 스튜디오 세트',
    'DSCF0104.JPG': '전자칠판 인터랙티브 강의 촬영 세트',
    'DSCF0105.JPG': '이러닝 및 멀티미디어 강의 녹화 시스템',
    'DSCF0106.JPG': '프리미엄 강의 제작 전용 스튜디오',
    'DSCF0107.JPG': '화이트 스튜디오 강의 및 촬영 전경',
    'DSCF0219.JPG': '스튜디오 방송용 카메라 및 전문 조명 세팅'
  };

  const DEFAULT_CLEAN_STUDIO_ORDER = [
    'KakaoTalk_20260917_003738719.jpg',
    'KakaoTalk_20260917_003738719_04.jpg',
    'KakaoTalk_20260917_003738719_06.jpg',
    'KakaoTalk_20260917_003738719_07.jpg',
    'KakaoTalk_20240124_151422660_01.jpg',
    'DSCF0043.JPG',
    'DSCF0045.JPG',
    'DSCF0046.JPG',
    'DSCF0048.JPG',
    'DSCF0049.JPG',
    'DSCF0050.JPG',
    'DSCF0057.JPG',
    'DSCF0100.JPG',
    'DSCF0103.JPG',
    'DSCF0104.JPG',
    'DSCF0105.JPG',
    'DSCF0106.JPG',
    'DSCF0107.JPG',
    'DSCF0219.JPG'
  ];

  const STUDIO_IMAGE_DETAILS: Record<string, { category: string; categoryName: string; spec: string }> = {
    'KakaoTalk_20260917_003738719.jpg': { category: 'white_horizont', categoryName: '화이트 호리존트', spec: '대형 와이드 화이트 호리존 세트 전경 · 특수 탑라이트' },
    'KakaoTalk_20260917_003738719_01.jpg': { category: 'white_horizont', categoryName: '화이트 호리존트', spec: '대형 와이드 화이트 호리존 세트 전경 · 특수 탑라이트' },
    'KakaoTalk_20260917_003738719_04.jpg': { category: 'white_horizont', categoryName: '화이트 호리존트', spec: '무이음 곡면 라운드 처리 · 정밀 캘리브레이션 조명' },
    'KakaoTalk_20260917_003738719_06.jpg': { category: 'white_horizont', categoryName: '화이트 호리존트', spec: '인터랙티브 모션 & 멀티 앵글 실시간 촬영 환경' },
    'KakaoTalk_20260917_003738719_07.jpg': { category: 'white_horizont', categoryName: '화이트 호리존트', spec: '4K UHD 고해상도 시네마 카메라 & 소프트박스 조명' },
    'KakaoTalk_20240124_151422660_01.jpg': { category: 'white_horizont', categoryName: '화이트 호리존트', spec: '무이음 대형 호리존 · 4K 멀티캠 촬영 · 균일 확산 조명' },
    'DSCF0103.JPG': { category: 'smart_board', categoryName: '전자칠판 스튜디오', spec: '86인치 4K UHD 전자 판서 모니터 · 이러닝 특화' },
    'DSCF0104.JPG': { category: 'smart_board', categoryName: '전자칠판 스튜디오', spec: '인터랙티브 교수설계 강의 녹화 및 라이브 솔루션' },
    'DSCF0105.JPG': { category: 'smart_board', categoryName: '전자칠판 스튜디오', spec: '고감도 터치 센서 & 실시간 판서 녹화 시스템' },
    'DSCF0106.JPG': { category: 'smart_board', categoryName: '전자칠판 스튜디오', spec: '프리미엄 강의 제작 전용 독립 방음 스튜디오' },
    'DSCF0043.JPG': { category: 'control_room', categoryName: '주·부조정실', spec: 'Blackmagic ATEM 다채널 스위쳐 & 오디오 믹싱 콘솔' },
    'DSCF0045.JPG': { category: 'control_room', categoryName: '주·부조정실', spec: '실시간 멀티뷰 모니터링 & 레코딩 스테이션' },
    'DSCF0046.JPG': { category: 'control_room', categoryName: '주·부조정실', spec: '방송 송출 엔지니어링 데스크 & 실시간 인터콤' },
    'DSCF0048.JPG': { category: 'control_room', categoryName: '주·부조정실', spec: 'UHD 고화질 실시간 인코딩 및 마스터링 시스템' },
    'DSCF0049.JPG': { category: 'control_room', categoryName: '주·부조정실', spec: '원격 라이브 스트리밍 및 다중 플랫폼 동시 송출' },
    'DSCF0050.JPG': { category: 'control_room', categoryName: '주·부조정실', spec: '부조정실 전문 마스터 모니터링 환경' },
    'DSCF0057.JPG': { category: 'large_studio', categoryName: '대형 스튜디오', spec: '160평 규모 복합 이러닝 제작 센터 메인 엔트런스' },
    'DSCF0100.JPG': { category: 'large_studio', categoryName: '대형 스튜디오', spec: '6개 전용 스튜디오 인프라 & 종합 방송 연출 공간' },
    'DSCF0107.JPG': { category: 'large_studio', categoryName: '대형 스튜디오', spec: '화이트 스튜디오 연출 공간 및 다목적 촬영 세트' },
    'DSCF0219.JPG': { category: 'large_studio', categoryName: '대형 스튜디오', spec: '방송용 전문 카메라 리그 & 천장 조명 바텐 시스템' }
  };

  function buildCleanStudioList(githubFiles?: any[]): any[] {
    const list: any[] = [];
    const localDir = path.join(process.cwd(), 'public', 'img', 'studio');

    // Use default clean order
    DEFAULT_CLEAN_STUDIO_ORDER.forEach((fileName, idx) => {
      const ghItem = githubFiles?.find(f => f.name === fileName);
      const title = VERIFIED_CLEAN_STUDIO_METADATA[fileName] || `후미디어 전문 스튜디오 전경 #${String(idx + 1).padStart(2, '0')}`;
      const details = STUDIO_IMAGE_DETAILS[fileName] || {
        category: 'large_studio',
        categoryName: '스튜디오 전경',
        spec: '160평 규모 최첨단 스튜디오 시설'
      };
      const localExists = fs.existsSync(path.join(localDir, fileName));
      const localUrl = `/img/studio/${fileName}`;
      const raw = ghItem?.download_url || `https://raw.githubusercontent.com/whomedia01/who-new809/main/img/${encodeURIComponent(fileName)}`;
      const cdnUrl = `https://cdn.jsdelivr.net/gh/whomedia01/who-new809@main/img/${encodeURIComponent(fileName)}`;
      const primaryUrl = localExists ? localUrl : cdnUrl;

      list.push({
        id: `studio_img_${idx + 1}`,
        index: idx + 1,
        title,
        fileName,
        category: details.category,
        categoryName: details.categoryName,
        spec: details.spec,
        imageUrl: primaryUrl,
        rawUrl: raw,
        cdnUrl,
        thumbUrl: primaryUrl,
        size: ghItem?.size || 400000,
        sha: ghItem?.sha || ''
      });
    });

    return list;
  }

  // Cached studio images store
  let studioImagesCache: any[] = [];
  let studioCacheTimestamp = 0;
  const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache for instant GitHub reflection

  // Dynamic GitHub image sync API for whomedia01/who-new809/img (Strict Chromakey Filtered)
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

      if (response.ok) {
        const contents = await response.json();
        if (Array.isArray(contents)) {
          // Strictly filter out any chromakey or excluded files
          const safeGithubFiles = contents.filter((item: any) => 
            item.type === "file" && 
            !EXCLUDED_CHROMAKEY_FILES.has(item.name) &&
            !/chroma|green/i.test(item.name)
          );

          const allImages = buildCleanStudioList(safeGithubFiles);
          if (allImages.length > 0) {
            studioImagesCache = allImages;
            studioCacheTimestamp = now;
            return res.json({ success: true, count: allImages.length, images: allImages, source: 'github_live' });
          }
        }
      }
    } catch (err: any) {
      console.warn("Dynamic studio images fetch warning:", err?.message || err);
    }

    // Default clean list fallback
    const fallbackList = buildCleanStudioList();
    studioImagesCache = fallbackList;
    studioCacheTimestamp = now;
    return res.json({ success: true, count: fallbackList.length, images: fallbackList, source: 'clean_local' });
  });

  // ==========================================
  // Public Customer Inquiry Submission API
  // ==========================================
  const handleInquirySubmission = (req: express.Request, res: express.Response) => {
    try {
      const { id, company, name, phone, email, category, message, status, adminNote, createdAt } = req.body;

      if (!name || !phone || !category || !message) {
        return res.status(400).json({ success: false, message: "필수 입력 항목(성함, 연락처, 문의유형, 내용)이 누락되었습니다." });
      }

      const newInquiry = db.create({
        id,
        company,
        name,
        phone,
        email,
        category,
        message,
        status,
        adminNote,
        createdAt
      });

      console.log(`[INQUIRY SAVED TO DB - ID: ${newInquiry.id}]`, {
        name: newInquiry.name,
        company: newInquiry.company,
        phone: newInquiry.phone,
        email: newInquiry.email,
        category: newInquiry.category,
        time: newInquiry.formattedDate
      });

      // Background ntfy.sh push notification backup
      try {
        const clientLabel = newInquiry.company ? `${newInquiry.name} (${newInquiry.company})` : newInquiry.name;
        const ntfyBody = [
          `[고객명/회사명] ${clientLabel}`,
          `[연락처] ${newInquiry.phone}`,
          `[관심 분야] ${newInquiry.category}`,
          `[이메일] ${newInquiry.email || '미입력'}`,
          ``,
          `[문의 내용]`,
          newInquiry.message,
          ``,
          `접수일시: ${newInquiry.formattedDate}`
        ].join('\n');

        const encodedTitle = '=?UTF-8?B?' + Buffer.from('[후미디어 신규 문의 접수]').toString('base64') + '?=';

        fetch('https://ntfy.sh/whomedia_inquiry_alert_2026', {
          method: 'POST',
          headers: {
            'Title': encodedTitle,
            'Priority': 'urgent',
            'Tags': 'bell,incoming_envelope'
          },
          body: ntfyBody
        }).catch((err) => {
          console.warn('[ntfy server forward notice]', err);
        });
      } catch (pushErr) {
        console.warn('[ntfy push forward error]', pushErr);
      }

      return res.status(201).json({
        success: true,
        message: "문의가 성공적으로 접수되어 데이터베이스에 안전하게 기록되었습니다.",
        inquiry: newInquiry
      });
    } catch (error) {
      console.error("Inquiry processing error:", error);
      return res.status(500).json({ success: false, message: "문의 접수 중 서버 오류가 발생했습니다." });
    }
  };

  app.post("/api/inquiry", handleInquirySubmission);
  app.post("/api/inquiries", handleInquirySubmission);

  // ==========================================
  // Admin Authentication & Protected Endpoints
  // ==========================================

  // Admin Auth Middleware
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (typeof req.query.token === "string" && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "관리자 로그인이 필요합니다." });
    }

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

    // Development Adm route
    app.get(/^\/adm(\/.*)?$/, async (_req, res, next) => {
      try {
        const admHtmlPath = path.join(process.cwd(), "adm.html");
        if (fs.existsSync(admHtmlPath)) {
          const rawHtml = fs.readFileSync(admHtmlPath, "utf-8");
          try {
            const html = await vite.transformIndexHtml("/adm.html", rawHtml);
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

    // Production Adm route
    app.get(/^\/adm(\/.*)?$/, (_req, res) => {
      const admDistPath = path.join(distPath, "adm.html");
      if (fs.existsSync(admDistPath)) {
        return res.sendFile(admDistPath);
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
    console.log(`[WHO MEDIA] Admin Center available at http://localhost:${PORT}/adm`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
});
