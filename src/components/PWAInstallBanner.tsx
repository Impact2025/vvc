'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Al geïnstalleerd als standalone
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('pwa_dismissed') === 'true') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    setShow(false);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'dismissed') setShow(false);
    setPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem('pwa_dismissed', 'true');
  }

  if (!show || !prompt) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:left-auto md:right-5 md:max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[#1a3a6b] rounded-2xl shadow-2xl border border-white/10 p-4 flex gap-3">
        <div className="text-2xl leading-none mt-0.5 shrink-0">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white">App installeren</p>
          <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
            Voeg VVC Goes UK toe aan je startscherm voor snelle toegang.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#f47920] text-white text-xs font-bold py-2 px-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              <Download size={13} />
              Installeren
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs font-semibold text-white/60 py-2 px-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
