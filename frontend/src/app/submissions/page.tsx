"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { submissionsApi } from "@/lib/api-client";
import { Submission } from "@/types/api";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FolderGit2,
  Globe,
  PlusCircle,
} from "lucide-react";

export default function SubmissionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionsApi.getMy();
      setSubmissions(data.items);
    } catch (err: any) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = submissions.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Submissions & Graded Evidence
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review the status of your submitted projects and examine rubric evaluations.
          </p>
        </div>

        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit Another Challenge</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["all", "submitted", "reviewing", "evaluated"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
              filterStatus === st
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            onClick={loadSubmissions}
            className="font-medium underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FolderGit2 className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No submissions found
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {filterStatus === "all"
              ? "You haven't submitted any challenge solutions yet."
              : `You have no submissions with status '${filterStatus}'.`}
          </p>
          <div className="mt-6">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <span>Explore Challenges</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      sub.status === "evaluated"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : sub.status === "reviewing"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {sub.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Submitted: {new Date(sub.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <a
                    href={sub.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-700 underline"
                  >
                    <FolderGit2 className="h-4 w-4 text-slate-400" />
                    <span>{sub.repository_url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {sub.deployed_url && (
                    <a
                      href={sub.deployed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
                    >
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>

                {sub.notes && (
                  <p className="text-xs text-slate-500 line-clamp-1 italic">
                    "{sub.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:self-center">
                {sub.score !== null && sub.score !== undefined ? (
                  <div className="text-right">
                    <span className="text-xs uppercase font-medium text-slate-400 block">
                      Rubric Score
                    </span>
                    <span className="text-2xl font-black text-indigo-600">
                      {sub.score}%
                    </span>
                  </div>
                ) : null}

                {sub.status === "evaluated" ? (
                  <Link
                    href={`/submissions/${sub.id}/feedback`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <span>View Rubric Report</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400 font-medium px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    Awaiting Evaluation
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
