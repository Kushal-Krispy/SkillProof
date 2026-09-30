"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { challengesApi } from "@/lib/api-client";
import { Challenge } from "@/types/api";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  FolderGit2,
  Layers,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export default function ChallengeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadChallenge();
    }
  }, [slug]);

  const loadChallenge = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await challengesApi.getBySlug(slug);
      setChallenge(data);
    } catch (err: any) {
      setError(err.message || "Failed to load challenge specifications");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-rose-800">
            {error || "Challenge not found"}
          </h2>
          <p className="mt-2 text-sm text-rose-600">
            The requested engineering challenge could not be loaded.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Challenges</span>
            </Link>
            <button
              onClick={loadChallenge}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/challenges"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Challenges</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  challenge.difficulty === "advanced"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : challenge.difficulty === "intermediate"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {challenge.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Estimated: {challenge.estimated_hours} hours</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {challenge.title}
            </h1>

            <p className="text-base text-slate-600 max-w-3xl">
              {challenge.summary}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href={`/challenges/${challenge.slug}/submit`}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all"
            >
              <span>Submit Solution</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Spec + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Technical Specifications & Rubric
              </h2>
            </div>

            {/* Markdown rendered view */}
            <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-transparent p-0 border-0">
                {challenge.description_markdown}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Submission Guidelines Sidebar */}
        <div className="space-y-6">
          {/* Deliverables Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <span>Deliverable Requirements</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Public Git repository with complete commit history.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Automated tests demonstrating edge cases & error handling.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Reproducible setup instructions or Dockerfile in README.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>(Optional) Live deployment URL demonstrating API responsiveness.</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href={`/challenges/${challenge.slug}/submit`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
              >
                <span>Ready? Submit Solution</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3 text-xs text-slate-600">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
              How it is Graded
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>Functional Correctness</span>
                <span className="text-slate-900">35%</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>System Architecture & Patterns</span>
                <span className="text-slate-900">25%</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Testing & Edge Case Coverage</span>
                <span className="text-slate-900">20%</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Security & Idempotency</span>
                <span className="text-slate-900">20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
