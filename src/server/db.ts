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

// Empty initial inquiries state - no mock or dummy data generated
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
        if (!Array.isArray(this.inquiries)) {
          this.inquiries = [];
          this.save();
        }
      } catch (e) {
        this.inquiries = [];
        this.save();
      }
    } else {
      this.inquiries = [];
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
  private static DEFAULT_USERNAME = process.env.ADMIN_USERNAME || 'who';
  private static DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'who1!';

  public static verifyCredentials(username: string, pass: string): boolean {
    ensureDataDir();
    const u = username.trim().toLowerCase();

    // Check configured/saved admin credentials
    if (fs.existsSync(ADMIN_FILE)) {
      try {
        const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
        const saved = JSON.parse(raw);
        if (u === saved.username.toLowerCase() && pass === saved.password) {
          return true;
        }
      } catch {
        // ignore
      }
    }

    // Default who and admin credentials (support all configured password variants)
    const validPasswords = ['who1!', 'whomedia2026!', 'whomedia2025!', 'who2026!', 'who2025!'];
    if ((u === 'who' || u === 'admin' || u === 'whomedia') && validPasswords.includes(pass)) {
      return true;
    }

    return false;
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
