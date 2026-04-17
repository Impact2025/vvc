'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}

async function subscribeAndSave() {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return;

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub }),
  });
}

export default function PushNotificationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    navigator.serviceWorker.register('/sw.js').catch(console.error);

    const perm = Notification.permission;
    const dismissed = localStorage.getItem('push_dismissed') === 'true';

    if (perm === 'granted') {
      subscribeAndSave().catch(console.error);
    } else if (perm === 'default' && !dismissed) {
      setTimeout(() => setShow(true), 3500);
    }
  }, []);

  async function handleAllow() {
    setShow(false);
    const perm = await Notification.requestPermission();
    if (perm === 'granted') await subscribeAndSave().catch(console.error);
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem('push_dismissed', 'true');
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:left-auto md:right-5 md:max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant/20 p-4 flex gap-3">
        <div className="text-2xl leading-none mt-0.5 shrink-0">⚽</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-on-surface">Meldingen aanzetten?</p>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            Ontvang direct een melding bij doelpunten, nieuwe foto&apos;s en updates van de tour.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAllow}
              className="flex-1 bg-primary-container text-white text-xs font-bold py-2 px-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Ja, zet aan
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs font-semibold text-on-surface-variant py-2 px-3 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              Niet nu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
