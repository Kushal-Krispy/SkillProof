"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { submissionsApi } from "@/lib/api-client";
import { Submission } from "@/types/api";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  FileCheck,
  FolderGit2,
  PlusCircle,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const data = await submissionsApi.getMy();
      setSubmissions(data.items);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load submissions");
    } finally {
      setIsLoadingData(false);
    }
  };

  if (authLoading || (!isAuthenticated && !fetchError)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Real metrics calculated directly from user data (NEVER hardcoded fake data)
  const totalSubmissions = submissions.length;
  const evaluatedSubmissions = submissions.filter((s) => s.status === "evaluated");
  const scoredSubmissions = submissions.filter((s) => s.score !== null && s.score !== undefined);
  const averageScore = scoredSubmissions.length
    ? Math.round(
        scoredSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) /
          scoredSubmissions.length
      )
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.full_name || user?.username}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user?.role.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Track your challenge submissions, verified rubric ratings, and portfolio showcase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/portfolio/${user?.username}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span>Public Portfolio</span>
          </Link>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Challenge</span>
          </Link>
        </div>
      </div>

      {fetchError && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between"
        >
          <span>{fetchError}</span>
          <button
            onClick={loadDashboardData}
            className="font-medium underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Real Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Submissions
            </span>
            <FolderGit2 className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {isLoadingData ? "..." : totalSubmissions}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Git repositories submitted
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Evaluated Solutions
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {isLoadingData ? "..." : evaluatedSubmissions.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Rubric reviews completed
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Average Score
            </span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {isLoadingData ? (
              "..."
            ) : averageScore !== null ? (
              `${averageScore}%`
            ) : (
              <span className="text-sm font-normal text-slate-400">No evaluations yet</span>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across graded capstones
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Verification Status
            </span>
            <Shield className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-indigo-600">
            Active Student
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Public evidence active
          </p>
        </div>
      </div>

      {/* Submissions Table / Empty State */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent Submissions
            </h2>
            <p className="text-xs text-slate-500">
              Live status of code submitted for rubric scoring
            </p>
          </div>
          <Link
            href="/challenges"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Find more challenges &rarr;
          </Link>
        </div>

        {isLoadingData ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-2" />
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-3">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No submissions yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              You haven't submitted any challenges. Select a challenge to begin building your verifiable evidence!
            </p>
            <div className="mt-6">
              <Link
                href="/challenges"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <span>Browse Challenges</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3">Repository</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Score</th>
                  <th scope="col" className="px-6 py-3">Submitted</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <a
                        href={sub.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 underline max-w-xs truncate"
                      >
                        <FolderGit2 className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">{sub.repository_url}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          sub.status === "evaluated"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : sub.status === "reviewing"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {sub.score !== null && sub.score !== undefined ? (
                        <span className="text-indigo-600">{sub.score}%</span>
                      ) : (
                        <span className="text-slate-400 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sub.status === "evaluated" ? (
                        <Link
                          href={`/submissions/${sub.id}/feedback`}
                          className="font-medium text-indigo-600 hover:text-indigo-700 text-xs inline-flex items-center gap-1"
                        >
                          <span>View Rubric</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">In review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
