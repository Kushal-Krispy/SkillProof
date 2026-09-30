"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { portfoliosApi, skillsApi } from "@/lib/api-client";
import { PortfolioProject, UserSkill } from "@/types/api";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FolderGit2,
  Globe,
  PlusCircle,
  ShieldCheck,
  Star,
  Trash2,
  User,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Project Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [newDemoUrl, setNewDemoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadProfileData();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadProfileData = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const [projData, skillData] = await Promise.all([
        portfoliosApi.getMy(),
        skillsApi.getMy(),
      ]);
      setProjects(projData.items);
      setUserSkills(skillData.items);
    } catch (err: any) {
      setError(err.message || "Failed to load profile projects");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!newTitle.trim() || !newSlug.trim() || !newSummary.trim() || !newRepoUrl.trim()) {
      setError("Please complete all required fields");
      return;
    }

    setIsSubmittingProject(true);
    try {
      await portfoliosApi.create({
        title: newTitle.trim(),
        slug: newSlug.trim().toLowerCase(),
        summary: newSummary.trim(),
        repository_url: newRepoUrl.trim(),
        live_demo_url: newDemoUrl.trim() || undefined,
        is_public: isPublic,
        is_featured: isFeatured,
      });

      setSuccessMessage("Portfolio project added successfully!");
      setShowAddModal(false);
      // Reset form
      setNewTitle("");
      setNewSlug("");
      setNewSummary("");
      setNewRepoUrl("");
      setNewDemoUrl("");
      loadProfileData();
    } catch (err: any) {
      setError(err.message || "Failed to add portfolio project");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to remove this project from your portfolio?")) {
      return;
    }
    try {
      await portfoliosApi.delete(id);
      setSuccessMessage("Project removed");
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    }
  };

  const handleToggleVisibility = async (project: PortfolioProject) => {
    try {
      const updated = await portfoliosApi.update(project.id, {
        is_public: !project.is_public,
      });
      setProjects(projects.map((p) => (p.id === project.id ? updated : p)));
    } catch (err: any) {
      setError(err.message || "Failed to toggle visibility");
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Profile & Portfolio Manager
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your account credentials and control what recruiters see on your public portfolio.
          </p>
        </div>

        {user && (
          <Link
            href={`/portfolio/${user.username}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span>View Public Portfolio</span>
          </Link>
        )}
      </div>

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between"
        >
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          <span>Account Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-medium">
              Full Name
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {user?.full_name}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-medium">
              Username
            </span>
            <span className="text-sm font-semibold text-slate-900">
              @{user?.username}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-medium">
              Email Address
            </span>
            <span className="text-sm font-semibold text-slate-900 truncate block">
              {user?.email}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-medium">
              Role
            </span>
            <span className="text-sm font-semibold text-indigo-600 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Showcase Projects */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-indigo-600" />
              <span>Showcase Projects on Your Public Portfolio</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only items marked as "Public" will be displayed on your shareable URL.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Showcase Project</span>
          </button>
        </div>

        {/* Add Project Form (Collapsible) */}
        {showAddModal && (
          <form
            onSubmit={handleCreateProject}
            className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900">
              New Portfolio Project
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Queue"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      );
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slug (URL path) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="distributed-task-queue"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Summary & Architecture Highlights <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="High-throughput distributed task worker with Redis and exponential backoff retry..."
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub Repository URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/username/project"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://my-app.fly.dev"
                  value={newDemoUrl}
                  onChange={(e) => setNewDemoUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Publicly visible on portfolio</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Highlight as Featured Project</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingProject}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {isSubmittingProject ? "Saving..." : "Save Project"}
              </button>
            </div>
          </form>
        )}

        {/* Existing Projects List */}
        {projects.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No showcase projects added yet. Click "Add Showcase Project" to highlight your work.
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {proj.title}
                    </h4>
                    {proj.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        Featured
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        proj.is_public
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {proj.is_public ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Public
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Private
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {proj.summary}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <a
                      href={proj.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <FolderGit2 className="h-3 w-3" />
                      Repository
                    </a>
                    {proj.live_demo_url && (
                      <a
                        href={proj.live_demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(proj)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs"
                    title={proj.is_public ? "Make Private" : "Make Public"}
                  >
                    {proj.is_public ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
