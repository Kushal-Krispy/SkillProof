import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FileCheck,
  Layers,
  Shield,
  Sparkles,
  Terminal,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verifiable Engineering Portfolio Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Proof of Competence for{" "}
              <span className="text-indigo-600">Software Engineers</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              Replace algorithmic trivia with production-grade engineering evidence.
              Solve real backend challenges, receive rubric-driven evaluation,
              and build an undeniable portfolio.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <span>Start Solving Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/challenges"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
              >
                <Code2 className="h-4 w-4" />
                <span>Explore Challenges</span>
              </Link>
            </div>

            {/* Architecture Highlights Pill List */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Real Git Repositories</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Multi-dimensional Rubrics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Public Shareable Portfolios</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Realistic Capstone Preview Section */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Production Challenges, Not LeetCode Riddles
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Every challenge models real distributed systems patterns, database
              migrations, and resilience requirements expected in tech companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Intermediate
                  </span>
                  <span className="text-xs text-slate-400 font-mono">4 hours</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Idempotent Webhook Consumer
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  Design an HTTP receiver that processes payment webhooks reliably,
                  handling duplicate deliveries, concurrent retries, and HMAC signatures.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded">FastAPI & AsyncIO</span>
                <Link
                  href="/challenges/idempotent-payment-webhook-consumer"
                  className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View Spec &rarr;
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Advanced
                  </span>
                  <span className="text-xs text-slate-400 font-mono">5 hours</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Token Bucket Rate Limiting
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  Construct an ASGI middleware that throttles traffic using token
                  bucket algorithms, sliding windows, and RFC 6585 compliance.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded">Distributed Systems</span>
                <Link
                  href="/challenges/token-bucket-rate-limiting-middleware"
                  className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View Spec &rarr;
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Advanced
                  </span>
                  <span className="text-xs text-slate-400 font-mono">6 hours</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Zero-Downtime DB Evolution
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  Execute expand-and-contract migrations to split large schema tables
                  under continuous production traffic without database downtime.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded">PostgreSQL & Alembic</span>
                <Link
                  href="/challenges/zero-downtime-database-migration"
                  className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View Spec &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              The Path to Verifiable Skill
            </h2>
            <p className="mt-3 text-base text-slate-600">
              How computer science students turn practical coursework and projects into hiring-ready proof.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Select a Challenge
              </h3>
              <p className="text-sm text-slate-600">
                Pick from real engineering briefs containing functional specs, edge cases, and architectural constraints.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Build in Your Environment
              </h3>
              <p className="text-sm text-slate-600">
                Write idiomatic code, write automated tests, and push your commits to GitHub with deployment evidence.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Rubric Evaluation
              </h3>
              <p className="text-sm text-slate-600">
                Receive standardized feedback across correctness, architecture, security, and performance.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 font-bold text-lg">
                4
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Publish Your Proof
              </h3>
              <p className="text-sm text-slate-600">
                Turn verified submissions into a public, recruiter-accessible portfolio showcasing live code.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
            >
              <span>Build Your Verified Portfolio Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
