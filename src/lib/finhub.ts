export interface FinhubBrand {
  id: string;
  name: string;
  logo: string; // SVG or emoji representation
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  darkBgColor?: string;
  darkTextColor?: string;
  accentColor: string;
  tagline: string;
  receiptBg: string;
  receiptText: string;
  amountColor: string;
  successColor: string;
  labelColor: string;
  borderColor: string;
}

export interface FinhubField {
  label: string;
  key: string;
  type: 'text' | 'name' | 'account' | 'phone' | 'date' | 'amount' | 'status' | 'badge';
}

export interface FinhubReceiptConfig {
  brand: FinhubBrand;
  layout: 'light' | 'dark' | 'pure-white' | 'pure-black';
  fields: FinhubField[];
  showWatermark?: boolean;
  watermarkText?: string;
  showLogo: boolean;
  logoPosition: 'center' | 'top-left' | 'top-right';
  amountPrefix: string;
  showStatus: boolean;
  statusPosition: 'inline' | 'badge' | 'header';
  showFee: boolean;
  showTimeline?: boolean;
  senderFormat: 'name+bank+acct' | 'name+phone';
  receiverFormat: 'name+bank+acct' | 'name+phone';
  showSender: boolean;
  showReceiver: boolean;
  shareButtons: ('image' | 'pdf' | 'report' | 'transfer' | 'records')[];
  legalFooter?: string;
  ctaBox?: { icon: string; text: string };
}

export type FinhubAppId = 'opay' | 'kuda';

export function getRandomAccount(): string {
  let num = '';
  for (let i = 0; i < 10; i++) num += Math.floor(Math.random() * 10);
  return num;
}

export function getRandomPhone(): string {
  const prefix = '80' + Math.floor(Math.random() * 10);
  let rest = '';
  for (let i = 0; i < 8; i++) rest += Math.floor(Math.random() * 10);
  return prefix + rest;
}

export function formatPhone(phone: string): string {
  const p = phone.replace(/\D/g, '');
  if (p.length >= 7) return `${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 10)}`;
  return p;
}

export function maskPhoneMiddle(phone: string): string {
  const p = phone.replace(/\D/g, '');
  if (p.length >= 10) return `${p.slice(0, 3)} *** ${p.slice(6, 10)}`;
  return p;
}

export function formatAccount(acct: string): string {
  const a = acct.replace(/\D/g, '');
  if (a.length >= 10) return `${a.slice(0, 3)} ${a.slice(3, 6)} ${a.slice(6, 10)}`;
  return a;
}

export function generateTxId(app: FinhubAppId): string {
  const now = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(2);
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  const hh = pad2(now.getHours());
  const min = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());
  const rand12 = () => {
    let r = '';
    for (let i = 0; i < 12; i++) r += Math.floor(Math.random() * 10);
    return r;
  };
  const rand10 = () => {
    let r = '';
    for (let i = 0; i < 10; i++) r += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)];
    return r;
  };

  switch (app) {
    case 'opay':
      return `${yy}${mm}${dd}${hh}${min}${ss}${rand12()}`;
    case 'kuda':
      return `${pad2(Math.floor(Math.random() * 99))}${yy}${mm}${dd}${hh}${min}${ss}${rand10()}`;
  }
}

export function formatDate(app: FinhubAppId, date?: Date): string {
  const d = date || new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const min = pad2(d.getMinutes());
  const sec = pad2(d.getSeconds());
  const day = d.getDate();

  const ordinal = (n: number) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  };

  switch (app) {
    case 'opay':
      return `${months[d.getMonth()]} ${ordinal(day)}, ${d.getFullYear()} ${pad2(d.getHours())}:${min}:${sec}`;
    case 'kuda':
      return `${months[d.getMonth()]} ${pad2(day)}, ${d.getFullYear()}`;
  }
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(val);
}

// A set of realistic Nigerian names
const FIRST_NAMES = [
  'Emmanuel', 'Chinwe', 'Oluwaseun', 'Blessing', 'Chukwudi', 'Ngozi', 'Segun', 'Folake',
  'Kehinde', 'Ayodeji', 'Funmilayo', 'Tunde', 'Yetunde', 'Kayode', 'Abimbola', 'Rotimi',
  'Obinna', 'Chioma', 'Uchenna', 'Adaobi', 'Nnamdi', 'Ifeanyi', 'Chidiebere', 'Ezinne',
  'Tolulope', 'Opeyemi', 'Olawale', 'Bolanle', 'Adebayo', 'Modupe', 'Ejiro', 'Okiemute'
];

const LAST_NAMES = [
  'Okonkwo', 'Okafor', 'Nwachukwu', 'Ogundipe', 'Balogun', 'Adebayo', 'Eze', 'Ibrahim',
  'Ogunlade', 'Akinwande', 'Olawale', 'Fashina', 'Afolabi', 'Olasunkanmi', 'Adeleke',
  'Ogunleye', 'Chukwuma', 'Nwosu', 'Eneh', 'Onyema', 'Mbang', 'Effiong', 'Uduak',
  'Okon', 'Akpan', 'Ukpong', 'Etim', 'Bassey', 'Offiong', 'James', 'Peter', 'John',
  'Philip', 'Musa', 'Yakubu', 'Aliyu', 'Suleiman', 'Danladi', 'Lawan', 'Usman'
];

export function randomNigerianName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`.toUpperCase();
}

export const APP_NAMES: Record<FinhubAppId, string> = {
  opay: 'OPay',
  kuda: 'Kuda',
};

export const BRAND_COLORS: Record<FinhubAppId, { primary: string; accent: string; bg: string; text: string; amount: string; success: string; label: string; border: string }> = {
  opay: {
    primary: '#00C5A3',
    accent: '#00A389',
    bg: '#F5F5F5',
    text: '#1A1A1A',
    amount: '#1A1A1A',
    success: '#00C5A3',
    label: '#666666',
    border: '#E5E5E5',
  },
  kuda: {
    primary: '#000000',
    accent: '#000000',
    bg: '#FFFFFF',
    text: '#000000',
    amount: '#000000',
    success: '#000000',
    label: '#666666',
    border: '#CCCCCC',
  },
};
