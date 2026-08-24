import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Inquiry {
  id: string;
  company: string;
  name: string;
  phone: string;
  category: string;
  message: string;
  status: '대기' | '확인중' | '답변완료';
  adminNote: string;
  createdAt: string; // ISO String
  formattedDate: string; // Korean localized string
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Ensure directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial realistic seed data for instant verification
const INITIAL_SEEDS: Inquiry[] = [
  {
    id: 'inq_20260310_01',
    company: '(주)한국교육개발원',
    name: '김태훈 팀장',
    phone: '010-4829-1920',
    category: '이러닝 콘텐츠 개발',
    message: '2026년 하반기 공공기관 임직원 대상 직무역량 강화 마이크로러닝 20차시 개발 견적 및 제작 일정 문의드립니다. 표준 SCORM 패키징 및 모바일 반응형 뷰어 지원이 필요합니다.',
    status: '대기',
    adminNote: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 min ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 25).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'inq_20260310_02',
    company: '미래에듀테크',
    name: '이지연 이사',
    phone: '010-9938-2041',
    category: '스마트 스튜디오 대여',
    message: '다음 주 목요일(오전 9시 ~ 오후 6시) 대형 전자칠판 1호 스튜디오 및 4K 프롬프터 장비 대관 가능 여부와 1일 렌탈 견적 문의드립니다. 강사 2인 동시 촬영 예정입니다.',
    status: '확인중',
    adminNote: '3/10 14:15 1호 스튜디오 일정 확인 중. 잔여 타임 조율 후 유선 연락 예정.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 180).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 'inq_20260309_03',
    company: '세종사이버대학교 산학협력단',
    name: '박성준 교수',
    phone: '010-3382-7719',
    category: '블렌디드 러닝 & 오프라인 교육',
    message: 'AI 융합 교육과정 온·오프라인 하이브리드 강의 콘텐츠 기획 및 160평 스튜디오 실습 촬영 연계 견적 요청드립니다.',
    status: '답변완료',
    adminNote: '3/9 16:30 상세 제안서 및 견적서 이메일 발송 완료. 3/12 미팅 조율 완료.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  },
  {
    id: 'inq_20260308_04',
    company: '글로벌에듀케이션',
    name: '최민서 대리',
    phone: '010-7712-4091',
    category: '공공·기업 영상 제작 & 홍보',
    message: '창립 15주년 기업 비전 홍보영상 및 4K 시네마틱 인터뷰 영상 올인원 제작 견적 및 포트폴리오 레퍼런스 요청드립니다.',
    status: '답변완료',
    adminNote: '후미디어 포트폴리오 영상 링크 및 제작 단가표 전달 완료.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString()
  }
];

export class InquiryDatabase {
  private static instance: InquiryDatabase;
  private inquiries: Inquiry[] = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): InquiryDatabase {
    if (!InquiryDatabase.instance) {
      InquiryDatabase.instance = new InquiryDatabase();
    }
    return InquiryDatabase.instance;
  }

  private init() {
    ensureDataDir();
    if (fs.existsSync(INQUIRIES_FILE)) {
      try {
        const raw = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
        this.inquiries = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse inquiries.json, using seeds:', e);
        this.inquiries = [...INITIAL_SEEDS];
        this.save();
      }
    } else {
      this.inquiries = [...INITIAL_SEEDS];
      this.save();
    }
  }

  private save() {
    try {
      ensureDataDir();
      const tempPath = `${INQUIRIES_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.inquiries, null, 2), 'utf-8');
      fs.renameSync(tempPath, INQUIRIES_FILE);
    } catch (e) {
      console.error('Failed to save inquiries to file:', e);
    }
  }

  public getAll(filter?: { status?: string; search?: string; category?: string }): Inquiry[] {
    let result = [...this.inquiries];

    if (filter?.status && filter.status !== 'all') {
      result = result.filter(item => item.status === filter.status);
    }

    if (filter?.category && filter.category !== 'all') {
      result = result.filter(item => item.category === filter.category);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.company && item.company.toLowerCase().includes(q)) ||
        item.phone.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    // Default newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }

  public getById(id: string): Inquiry | undefined {
    return this.inquiries.find(item => item.id === id);
  }

  public create(data: { company?: string; name: string; phone: string; category: string; message: string }): Inquiry {
    const now = new Date();
    const id = `inq_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newInquiry: Inquiry = {
      id,
      company: data.company?.trim() || '(미기재)',
      name: data.name.trim(),
      phone: data.phone.trim(),
      category: data.category.trim(),
      message: data.message.trim(),
      status: '대기',
      adminNote: '',
      createdAt: now.toISOString(),
      formattedDate: now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      updatedAt: now.toISOString()
    };

    this.inquiries.unshift(newInquiry);
    this.save();
    return newInquiry;
  }

  public updateStatus(id: string, status: '대기' | '확인중' | '답변완료', adminNote?: string): Inquiry | null {
    const item = this.inquiries.find(i => i.id === id);
    if (!item) return null;

    item.status = status;
    if (adminNote !== undefined) {
      item.adminNote = adminNote;
    }
    item.updatedAt = new Date().toISOString();
    this.save();
    return item;
  }

  public updateNote(id: string, adminNote: string): Inquiry | null {
    const item = this.inquiries.find(i => i.id === id);
    if (!item) return null;

    item.adminNote = adminNote;
    item.updatedAt = new Date().toISOString();
    this.save();
    return item;
  }

  public delete(id: string): boolean {
    const initialLen = this.inquiries.length;
    this.inquiries = this.inquiries.filter(i => i.id !== id);
    if (this.inquiries.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getStats() {
    const total = this.inquiries.length;
    const pending = this.inquiries.filter(i => i.status === '대기').length;
    const inProgress = this.inquiries.filter(i => i.status === '확인중').length;
    const completed = this.inquiries.filter(i => i.status === '답변완료').length;
    
    // Today inquiries
    const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
    const todayCount = this.inquiries.filter(i => {
      const itemDate = new Date(i.createdAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
      return itemDate === today;
    }).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      todayCount
    };
  }
}

// ==========================================
// Admin Authentication Manager
// ==========================================
export class AdminAuth {
  private static SECRET = process.env.ADMIN_JWT_SECRET || 'whomedia-secure-secret-key-2026-auth';
  private static DEFAULT_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  private static DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'whomedia2026!';

  public static verifyCredentials(username: string, pass: string): boolean {
    ensureDataDir();
    let currentAdmin = {
      username: this.DEFAULT_USERNAME,
      password: this.DEFAULT_PASSWORD
    };

    if (fs.existsSync(ADMIN_FILE)) {
      try {
        const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
        currentAdmin = JSON.parse(raw);
      } catch {
        // use default
      }
    }

    return (
      username.trim().toLowerCase() === currentAdmin.username.toLowerCase() &&
      pass === currentAdmin.password
    );
  }

  public static generateToken(username: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
    const payload = Buffer.from(JSON.stringify({ username, role: 'admin', exp })).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  public static verifyToken(token: string): { valid: boolean; username?: string } {
    try {
      if (!token || typeof token !== 'string') return { valid: false };
      const parts = token.split('.');
      if (parts.length !== 3) return { valid: false };

      const [header, payload, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', this.SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return { valid: false };
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false }; // Expired
      }

      return { valid: true, username: decodedPayload.username };
    } catch {
      return { valid: false };
    }
  }
}
