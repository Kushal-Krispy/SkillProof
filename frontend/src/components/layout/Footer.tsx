import React from "react";
import Link from "next/link";
import { ShieldCheck, Terminal } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-slate-900">SkillProof</span>
            <span className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Verifiable Engineering Evidence Platform.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Online
            </span>
            <Link
              href="/challenges"
              className="hover:text-indigo-600 transition-colors"
            >
              Challenges
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <Terminal className="h-3.5 w-3.5" />
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
