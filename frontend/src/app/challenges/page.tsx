"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { challengesApi } from "@/lib/api-client";
import { Challenge } from "@/types/api";
import {
  ArrowRight,
  Clock,
  Code2,
  Filter,
  Search,
  Sparkles,
  Terminal,
} from "lucide-react";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadChallenges();
  }, [selectedDifficulty]);

  const loadChallenges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params =
        selectedDifficulty !== "all" ? { difficulty: selectedDifficulty } : undefined;
      const res = await challengesApi.list(params);
      setChallenges(res.items);
    } catch (err: any) {
      setError(err.message || "Failed to load challenges");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Engineering Challenges
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-3xl">
          Real-world architectural problems designed to test practical engineering
          competence. Select a challenge, implement a solution with clean tests,
          and submit your repository for rubric evaluation.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Difficulty Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "beginner", "intermediate", "advanced"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                selectedDifficulty === diff
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            onClick={loadChallenges}
            className="font-medium underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-slate-200 bg-white p-6 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-16 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mt-auto" />
            </div>
          ))}
        </div>
      ) : filteredChallenges.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Code2 className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No challenges found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search criteria or difficulty filter.
          </p>
          <button
            onClick={() => {
              setSelectedDifficulty("all");
              setSearchQuery("");
            }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Challenge Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold capitalize ${
                      challenge.difficulty === "advanced"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : challenge.difficulty === "intermediate"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    <span>~{challenge.estimated_hours}h</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  <Link
                    href={`/challenges/${challenge.slug}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {challenge.title}
                  </Link>
                </h3>

                <p className="text-sm text-slate-600 line-clamp-3 mb-6">
                  {challenge.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                  <Terminal className="h-3 w-3 text-slate-400" />
                  Engineering Spec
                </span>

                <Link
                  href={`/challenges/${challenge.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Solve Challenge</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
