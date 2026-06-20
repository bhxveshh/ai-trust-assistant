// Mirrors the backend Mongoose schema exactly (see project blueprint).

export interface ScrapedData {
  title: string;
  price: string;
  rating: string;
  imageUrl: string;
  specs: Record<string, string>;
}

export type Verdict = 'Highly Trusted' | 'Exercise Caution' | 'High Risk';

export interface AiAssessment {
  trustScore: number; // 0-100
  summary: string;
  redFlags: string[];
  verdict: Verdict;
}

export interface AnalysisRecord {
  _id?: string;
  user: string;
  targetUrl: string;
  scrapedData: ScrapedData;
  aiAssessment: AiAssessment;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
