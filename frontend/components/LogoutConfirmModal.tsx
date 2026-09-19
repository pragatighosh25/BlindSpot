"use client";

import React from "react";
import { Cross, SignOut, CircleAlert } from "akar-icons";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="card-candle-glow relative w-full max-w-sm p-6 bg-[#0A0A0A] border border-white/15 rounded-2xl text-white shadow-2xl space-y-4">
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E4007C] via-[#00FF9C] to-[#E4007C] rounded-t-2xl" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800/60 text-[#E4007C] flex items-center justify-center shrink-0">
              <SignOut size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white">Log Out</h3>
              <p className="text-xs text-white/50 font-mono">Confirm session termination</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Cross size={14} />
          </button>
        </div>

        <p className="text-xs font-mono text-white/70 leading-relaxed bg-[#141414] p-3 rounded-xl border border-white/5">
          Are you sure you want to log out? Your submissions telemetry and diagnostic graphs remain safely saved.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmLogout();
              onClose();
            }}
            className="px-4 py-2 text-xs font-mono font-bold bg-[#E4007C] hover:bg-[#c20069] text-white rounded-xl shadow-lg shadow-[#E4007C]/20 transition-all flex items-center gap-1.5"
          >
            <SignOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
