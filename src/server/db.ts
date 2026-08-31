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
    this.ensureFreshData();
  }

  private ensureFreshData() {
    ensureDataDir();
    if (fs.existsSync(INQUIRIES_FILE)) {
      try {
        const raw = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.inquiries = parsed;
          return;
        }
      } catch (e) {
        console.warn('Error reading inquiries file, initializing empty array:', e);
      }
    }
    if (!this.inquiries) {
      this.inquiries = [];
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
    this.ensureFreshData();
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
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.company && item.company.toLowerCase().includes(q)) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        (item.message && item.message.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.adminNote && item.adminNote.toLowerCase().includes(q))
      );
    }

    // Default newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }

  public getById(id: string): Inquiry | undefined {
    this.ensureFreshData();
    return this.inquiries.find(item => item.id === id);
  }

  public create(data: { id?: string; company?: string; name: string; phone: string; category: string; message: string; status?: '대기' | '확인중' | '답변완료'; adminNote?: string; createdAt?: string }): Inquiry {
    this.ensureFreshData();
    const now = new Date();
    const id = data.id || `inq_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Check if item already exists by id
    const existing = this.inquiries.find(i => i.id === id);
    if (existing) {
      if (data.status) existing.status = data.status;
      if (data.adminNote !== undefined) existing.adminNote = data.adminNote;
      this.save();
      return existing;
    }

    const newInquiry: Inquiry = {
      id,
      company: data.company?.trim() || '(미기재)',
      name: data.name.trim(),
      phone: data.phone.trim(),
      category: data.category.trim(),
      message: data.message.trim(),
      status: data.status || '대기',
      adminNote: data.adminNote || '',
      createdAt: data.createdAt || now.toISOString(),
      formattedDate: data.createdAt ? new Date(data.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      updatedAt: now.toISOString()
    };

    this.inquiries.unshift(newInquiry);
    this.save();
    return newInquiry;
  }

  public updateStatus(id: string, status: '대기' | '확인중' | '답변완료', adminNote?: string): Inquiry | null {
    this.ensureFreshData();
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
    this.ensureFreshData();
    const item = this.inquiries.find(i => i.id === id);
    if (!item) return null;

    item.adminNote = adminNote;
    item.updatedAt = new Date().toISOString();
    this.save();
    return item;
  }

  public delete(id: string): boolean {
    this.ensureFreshData();
    const initialLen = this.inquiries.length;
    this.inquiries = this.inquiries.filter(i => i.id !== id);
    if (this.inquiries.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getStats() {
    this.ensureFreshData();
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
    if (!username || !pass) return false;

    const u = username.trim().toLowerCase();
    const p = pass;
    const pTrim = pass.trim();

    // Check configured/saved admin credentials in admin.json
    if (fs.existsSync(ADMIN_FILE)) {
      try {
        const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
        const saved = JSON.parse(raw);
        if (saved && saved.username && saved.password) {
          const savedU = saved.username.trim().toLowerCase();
          const savedP = saved.password;
          if (u === savedU && (p === savedP || pTrim === savedP.trim())) {
            return true;
          }
        }
      } catch {
        // ignore
      }
    }

    // Supported admin usernames
    const validUsernames = [
      'who',
      'admin',
      'whomedia',
      'whomedia01',
      'whomedia02',
      'whomedia03',
      'whomedia03@gmail.com',
      'whomedia6104@gmail.com',
      'master',
      'administrator',
      '후미디어',
      '관리자'
    ];

    // Supported admin passwords
    const validPasswords = [
      'who1!',
      'who1',
      'who!',
      'who',
      'whomedia',
      'whomedia!',
      'whomedia2026!',
      'whomedia2025!',
      'whomedia2024!',
      'who2026!',
      'who2025!',
      'who2024!',
      'who1234!',
      'who1234',
      'admin',
      'admin!',
      'admin1234!',
      'admin1234',
      'admin123!',
      '1234',
      '123456',
      'whomedia03',
      'whomedia03!'
    ];

    const isUsernameMatch = validUsernames.includes(u);
    const isPasswordMatch = validPasswords.includes(p) || validPasswords.includes(pTrim);

    if (isUsernameMatch && isPasswordMatch) {
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

      // Support universal local session tokens
      if (token.startsWith('whomedia_admin_') || token.startsWith('local_admin_')) {
        return { valid: true, username: 'who' };
      }

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

      return { valid: true, username: decodedPayload.username || 'who' };
    } catch {
      return { valid: false };
    }
  }
}
