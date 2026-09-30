"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { portfoliosApi } from "@/lib/api-client";
import { PortfolioProject } from "@/types/api";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  ExternalLink,
  FolderGit2,
  Globe,
  ShieldCheck,
  Star,
  Terminal,
} from "lucide-react";

export default function PublicPortfolioPage() {
  const params = useParams();
  const username = params?.username as string;

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      loadPortfolio();
    }
  }, [username]);

  const loadPortfolio = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await portfoliosApi.listPublic(username);
      // Strictly enforce client-side safety: ensure only public items are kept
      setProjects(data.items.filter((p) => p.is_public));
    } catch (err: any) {
      setError(err.message || "Failed to load public portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading verified portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 max-w-md mx-auto shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Code2 className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Portfolio Not Found</h2>
          <p className="mt-1 text-sm text-slate-500">
            No public evidence portfolio was found for user "@{username}".
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to SkillProof</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const featured = projects.filter((p) => p.is_featured);
  const otherProjects = projects.filter((p) => !p.is_featured);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Portfolio Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Verified Student Portfolio
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              @{username}
            </h1>

            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              Demonstrated engineering competence through production capstone
              challenges, peer-reviewed architectures, and verified git evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 text-xs text-indigo-800 font-medium">
              <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
              <span>SkillProof Certified Evidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Showcase */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <FolderGit2 className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            No public projects published yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            This student has not yet published any public projects to their showcase.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Section (if any) */}
          {featured.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span>Featured Engineering Capstones</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-2xl border-2 border-indigo-200/70 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          <Terminal className="h-3.5 w-3.5" />
                          Verified Project
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(proj.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900">
                        {proj.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {proj.summary}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <a
                          href={proj.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-600"
                        >
                          <FolderGit2 className="h-4 w-4" />
                          <span>Code Repository</span>
                        </a>

                        {proj.live_demo_url && (
                          <a
                            href={proj.live_demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Live Deployment</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Projects */}
          {otherProjects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-indigo-600" />
                <span>All Verified Projects</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">
                        {new Date(proj.created_at).toLocaleDateString()}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {proj.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <a
                        href={proj.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600"
                      >
                        <FolderGit2 className="h-3.5 w-3.5" />
                        <span>Source</span>
                      </a>

                      {proj.live_demo_url && (
                        <a
                          href={proj.live_demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
