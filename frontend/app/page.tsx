'use client';

import { type FormEvent, useState } from 'react';
import { analyzeText, analyzeUrl } from '@/lib/api';
import type { AnalysisResponse, UrlAnalysisResponse } from '@/types/phishing';

const sampleText = 'Urgent action required: verify your account immediately by clicking here to confirm your password reset.';
const sampleUrl = 'https://login.example-security-check.com/verify';

export default function Page() {
  const [text, setText] = useState(sampleText);
  const [url, setUrl] = useState(sampleUrl);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [urlResult, setUrlResult] = useState<UrlAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeText(text);
      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setUrlLoading(true);
    setError(null);
    try {
      const data = await analyzeUrl(url);
      setUrlResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'URL analysis failed');
    } finally {
      setUrlLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 pb-8 pt-24 text-slate-900 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-halo backdrop-blur-xl sm:p-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">AJMAL's-PHISHING-GUARD</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Detect phishing emails and risky URLs with explainable AI.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Paste suspicious message text or a URL, get a risk score, and inspect the signals that triggered the alert.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-halo sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email / message text</label>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  className="min-h-56 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none transition focus:border-blue-400 focus:bg-white"
                  placeholder="Paste the email body here..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Analyzing...' : 'Analyze message'}
              </button>
            </form>

            {result ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Suspicious URL</p>
                {result.suspicious_links.length > 0 ? (
                  <ul className="mt-3 space-y-3 text-sm text-slate-700">
                    {result.suspicious_links.map((link) => (
                      <li key={link.url} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <span className="break-all font-medium text-slate-900">{link.url}</span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              link.flagged ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {link.flagged ? 'Flagged' : 'Checked'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Risk {(link.overall_risk * 100).toFixed(1)}% · {link.has_https ? 'HTTPS' : 'No HTTPS'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No links were found in this message.</p>
                )}
              </div>
            ) : null}

            <form onSubmit={handleUrlSubmit} className="mt-8 space-y-4 border-t border-slate-200 pt-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Suspicious URL</label>
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none transition focus:border-blue-400 focus:bg-white"
                  placeholder="https://example.com/login"
                />
              </div>
              <button
                type="submit"
                disabled={urlLoading}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {urlLoading ? 'Checking URL...' : 'Analyze URL'}
              </button>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-halo sm:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Result</p>
              {result ? (
                <>
                  <div className={`mt-4 text-4xl font-black ${result.prediction === 'phishing' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {result.prediction.toUpperCase()}
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-200">
                    <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                    <p>Risk score: {(result.risk_score * 100).toFixed(1)}%</p>
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">Explainability</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {result.explanation.map((item) => (
                        <li key={item.phrase} className="flex items-center justify-between gap-4">
                          <span>{item.phrase}</span>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold">{item.score.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">Suspicious Links</p>
                    {result.suspicious_links.length > 0 ? (
                      <ul className="mt-3 space-y-3 text-sm text-slate-200">
                        {result.suspicious_links.map((link) => (
                          <li key={link.url} className="rounded-xl border border-white/10 bg-black/10 p-3">
                            <div className="flex items-start justify-between gap-4">
                              <span className="break-all font-medium text-white">{link.url}</span>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  link.flagged ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'
                                }`}
                              >
                                {link.flagged ? 'Flagged' : 'Checked'}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-300">
                              Risk {(link.overall_risk * 100).toFixed(1)}% · {link.has_https ? 'HTTPS' : 'No HTTPS'}
                            </p>
                            {link.suspicious_keywords.length > 0 ? (
                              <p className="mt-1 text-xs text-slate-300">
                                Keywords: {link.suspicious_keywords.join(', ')}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-300">No links were found in this message.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-300">Run a message analysis to see the model output.</p>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-halo sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">URL Analysis</p>
              {urlResult ? (
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p><strong className="text-slate-950">Risk:</strong> {(urlResult.overall_risk * 100).toFixed(1)}%</p>
                  <p><strong className="text-slate-950">HTTPS:</strong> {urlResult.has_https ? 'Yes' : 'No'}</p>
                  <p><strong className="text-slate-950">Domain age risk:</strong> {urlResult.domain_age_risk ? 'Yes' : 'No'}</p>
                  <p><strong className="text-slate-950">Keywords:</strong> {urlResult.suspicious_keywords.join(', ') || 'None'}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Analyze a URL to inspect domain age and heuristic signals.</p>
              )}
            </div>
          </aside>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>
        ) : null}
      </section>
    </main>
  );
}
