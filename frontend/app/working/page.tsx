const trainingSteps = [
  'Collect labeled phishing and legitimate email samples from public datasets.',
  'Clean and tokenize the text so the model can understand message structure.',
  'Fine-tune DistilBERT for binary classification: phishing vs legitimate.',
  'Add URL heuristics for domain age, HTTPS, suspicious keywords, and length.',
  'Generate explanations so suspicious phrases and links are visible to the user.',
];

const checks = [
  'Urgent wording such as “verify your account” or “click here to confirm”.',
  'Embedded links, suspicious domains, and missing HTTPS protection.',
  'Long URLs, keyword stuffing, and repeated call-to-action language.',
  'Domain age signals and basic risk heuristics for every extracted link.',
];

export default function WorkingPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-halo backdrop-blur-xl sm:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">Working</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            How PhishGuard AI works
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            This page explains how the model is trained, what it checks, and how the full phishing-detection flow
            turns an email into a risk score, a prediction, and human-readable explanations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-halo sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">About Me</p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">Portfolio snapshot</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              I am a B.Tech CSE engineering student at VIT Vellore with a CGPA of 8.38, building this project as a
              cybersecurity placement portfolio piece focused on applied AI, email safety, and practical system design.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Training pipeline</p>
              <ol className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                {trainingSteps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-halo sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">What it checks</p>
            <h2 className="mt-3 text-2xl font-black">Signals used in detection</h2>
            <div className="mt-6 space-y-4">
              {checks.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">How it decides</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                The backend tokenizes the message, scores it with DistilBERT when a trained model is available, then
                combines the output with lightweight heuristics for suspicious phrases and extracted links. If Redis is
                available, repeated checks are cached so the app stays responsive.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}