import type { AnalysisResponse, UrlAnalysisResponse } from '@/types/phishing';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function analyzeText(text: string) {
  return postJson<AnalysisResponse>('/predict', { text });
}

export function analyzeUrl(url: string) {
  return postJson<UrlAnalysisResponse>('/analyze-url', { url });
}
