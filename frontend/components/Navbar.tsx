"use client";

import React from "react";
import { Sparkles, Database, RefreshCw, Layers, ShieldCheck } from "lucide-react";

interface NavbarProps {
  onSync: () => void;
  isSyncing: boolean;
  onOpenIngest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSync, isSyncing, onOpenIngest }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#070b12]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white">BlindSpot</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                AI Coach
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Data Ingestion &bull; OpenSearch &bull; Spaced Repetition
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>OpenSearch Synced (37 Submissions)</span>
          </div>

          <button
            onClick={onOpenIngest}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Test Ingestion</span>
          </button>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Analyzing..." : "Re-Analyze"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
