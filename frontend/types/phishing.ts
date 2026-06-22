export type ExplanationItem = {
  phrase: string;
  score: number;
};

export type AnalysisResponse = {
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  risk_score: number;
  signals: Record<string, unknown>;
  explanation: ExplanationItem[];
  suspicious_phrases: Array<{ phrase: string; severity: number }>;
  suspicious_links: Array<{
    url: string;
    overall_risk: number;
    has_https: boolean;
    suspicious_keywords: string[];
    domain_age_risk: boolean;
    ssl_status: string;
    domain_mismatch: boolean;
    flagged: boolean;
  }>;
};

export type UrlAnalysisResponse = {
  url: string;
  has_https: boolean;
  url_length: number;
  suspicious_keywords: string[];
  domain_age_days: number | null;
  domain_age_risk: boolean;
  url_length_risk: boolean;
  ssl_status: string;
  domain_mismatch: boolean;
  overall_risk: number;
};
