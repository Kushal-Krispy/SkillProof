"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { submissionsApi } from "@/lib/api-client";
import { Feedback, Submission } from "@/types/api";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  FileCheck,
  FolderGit2,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params?.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (submissionId) {
      loadData();
    }
  }, [submissionId, authLoading, isAuthenticated, router]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [subData, fbData] = await Promise.all([
        submissionsApi.getById(submissionId),
        submissionsApi.getFeedback(submissionId),
      ]);
      setSubmission(subData);
      setFeedback(fbData);
    } catch (err: any) {
      setError(err.message || "Failed to load evaluation feedback");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading evaluation report...</p>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-rose-800">
            {error || "Feedback not found"}
          </h2>
          <p className="mt-2 text-sm text-rose-600">
            This submission may still be awaiting evaluation or you do not have permission to view it.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/submissions"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Submissions</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/submissions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Submissions</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Evaluated
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated by {feedback.evaluator_type.toUpperCase()} Reviewer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Rubric Evaluation Report
          </h1>
          {submission && (
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-slate-400" />
              <a
                href={submission.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {submission.repository_url}
              </a>
            </p>
          )}
        </div>

        {/* Score Ring / Pill */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center shrink-0 min-w-44">
          <span className="text-xs uppercase font-semibold text-indigo-700 tracking-wider">
            Overall Score
          </span>
          <div className="text-4xl font-extrabold text-indigo-600 mt-1">
            {feedback.score}%
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {feedback.score >= 80 ? "Competence Verified" : "Needs Revision"}
          </span>
        </div>
      </div>

      {/* Rubric Breakdown Grid */}
      {feedback.rubric_scores && Object.keys(feedback.rubric_scores).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <span>Rubric Dimensions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {Object.entries(feedback.rubric_scores).map(([category, score]) => (
              <div
                key={category}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block truncate">
                  {category.replace(/_/g, " ")}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">
                    {score}%
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">Passed</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Feedback Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Key Strengths & Architectural Merits</span>
          </h2>
          <div className="prose prose-sm text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
            {feedback.strengths}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <span>Recommended Improvements & Edge Cases</span>
          </h2>
          <div className="prose prose-sm text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
            {feedback.improvements}
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-indigo-600" />
          <span>Evaluator Executive Summary</span>
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {feedback.summary}
        </p>
      </div>
    </div>
  );
}
