"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { challengesApi, submissionsApi } from "@/lib/api-client";
import { Challenge } from "@/types/api";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FolderGit2,
  Globe,
  Lock,
  ShieldCheck,
} from "lucide-react";

export default function SubmitChallengePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);

  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/challenges/${slug}/submit`);
      return;
    }

    if (slug) {
      challengesApi
        .getBySlug(slug)
        .then((data) => setChallenge(data))
        .catch(() => setServerError("Failed to fetch challenge details"))
        .finally(() => setIsLoadingChallenge(false));
    }
  }, [slug, authLoading, isAuthenticated, router]);

  const validate = () => {
    const errors: Record<string, string> = {};
    const urlPattern = /^https?:\/\/.+/i;

    if (!repositoryUrl.trim()) {
      errors.repositoryUrl = "Repository URL is required";
    } else if (!urlPattern.test(repositoryUrl.trim())) {
      errors.repositoryUrl = "Must be a valid HTTP or HTTPS URL (e.g., https://github.com/your-username/project)";
    }

    if (deployedUrl.trim() && !urlPattern.test(deployedUrl.trim())) {
      errors.deployedUrl = "Deployed URL must be a valid HTTP or HTTPS URL";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!challenge) {
      setServerError("Challenge not loaded");
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submissionsApi.create({
        challenge_id: challenge.id,
        repository_url: repositoryUrl.trim(),
        deployed_url: deployedUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/submissions");
      }, 1500);
    } catch (err: any) {
      setServerError(err.message || "Failed to submit challenge solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingChallenge) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href={`/challenges/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Challenge Specification</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Submit Solution
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {challenge?.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Submit your GitHub repository containing the working implementation and automated tests.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm"
          >
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold">Submission Received!</h3>
            <p className="text-sm text-emerald-700">
              Your solution has been queued for evaluation. Redirecting to your submissions history...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Repository URL */}
            <div>
              <label
                htmlFor="repository_url"
                className="block text-sm font-medium text-slate-700"
              >
                Git Repository URL <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FolderGit2 className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="repository_url"
                  name="repository_url"
                  type="url"
                  required
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/your-username/my-capstone-solution"
                  className={`block w-full rounded-lg border pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:leading-6 ${
                    fieldErrors.repositoryUrl
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-slate-300"
                  }`}
                  aria-invalid={!!fieldErrors.repositoryUrl}
                  aria-describedby={
                    fieldErrors.repositoryUrl ? "repo-error" : undefined
                  }
                />
              </div>
              {fieldErrors.repositoryUrl && (
                <p id="repo-error" className="mt-1 text-xs text-rose-600">
                  {fieldErrors.repositoryUrl}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Repository should be publicly accessible or shared with faculty reviewers.
              </p>
            </div>

            {/* Deployed Demo URL */}
            <div>
              <label
                htmlFor="deployed_url"
                className="block text-sm font-medium text-slate-700"
              >
                Live Deployed Demo URL (Optional)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Globe className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="deployed_url"
                  name="deployed_url"
                  type="url"
                  value={deployedUrl}
                  onChange={(e) => setDeployedUrl(e.target.value)}
                  placeholder="https://my-service.fly.dev or https://my-service.onrender.com"
                  className={`block w-full rounded-lg border pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:leading-6 ${
                    fieldErrors.deployedUrl
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-slate-300"
                  }`}
                />
              </div>
              {fieldErrors.deployedUrl && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.deployedUrl}
                </p>
              )}
            </div>

            {/* Architecture Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-700"
              >
                Architecture Notes & Instructions for Reviewer
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention key trade-offs, how you handled race conditions, or specific instructions to run your test suite..."
                className="mt-1 block w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:leading-6"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href={`/challenges/${slug}`}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Evaluation</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
