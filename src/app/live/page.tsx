"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { getPusherClient } from "@/lib/pusher";
import { Goal, AlertTriangle, ArrowLeftRight, MessageCircle, Wifi, WifiOff } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

type EventType = "goal" | "card" | "sub" | "message" | "kickoff" | "fulltime";

interface LiveEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  minute?: number;
  timestamp: Date;
}

const eventIcons: Record<EventType, React.ElementType> = {
  goal: Goal,
  card: AlertTriangle,
  sub: ArrowLeftRight,
  message: MessageCircle,
  kickoff: Goal,
  fulltime: Goal,
};

const eventStyles: Record<EventType, string> = {
  goal: "bg-primary-container text-white",
  card: "bg-yellow-400 text-yellow-900",
  sub: "bg-secondary/20 text-secondary",
  message: "bg-surface-container-highest text-on-surface-variant",
  kickoff: "bg-green-500 text-white",
  fulltime: "bg-inverse-surface text-inverse-on-surface",
};

type ConnectionStatus = "connecting" | "connected" | "disconnected";

export default function LivePage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) {
      setStatus("disconnected");
      return;
    }

    pusher.connection.bind("connected", () => setStatus("connected"));
    pusher.connection.bind("disconnected", () => setStatus("disconnected"));
    pusher.connection.bind("error", () => setStatus("disconnected"));

    const channel = pusher.subscribe("wedstrijden");

    channel.bind("live-event", (data: Omit<LiveEvent, "id" | "timestamp">) => {
      const newEvent: LiveEvent = {
        ...data,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };
      setEvents((prev) => [...prev, newEvent]);
    });

    // Also listen for score updates to show as events
    channel.bind(
      "score-update",
      (data: { matchId: number; homeScore: number; awayScore: number; scorer?: string }) => {
        const goalEvent: LiveEvent = {
          id: `score-${Date.now()}`,
          type: "goal",
          title: `DOELPUNT! VVC ${data.homeScore} — ${data.awayScore}`,
          description: data.scorer ? `Gescoord door ${data.scorer}` : undefined,
          timestamp: new Date(),
        };
        setEvents((prev) => [...prev, goalEvent]);
      }
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("wedstrijden");
      pusher.disconnect();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const statusConfig = {
    connecting: {
      icon: Wifi,
      label: "Verbinden...",
      className: "text-outline",
      dotClass: "bg-yellow-400",
    },
    connected: {
      icon: Wifi,
      label: "Verbonden — live updates aan",
      className: "text-green-600",
      dotClass: "bg-green-500",
    },
    disconnected: {
      icon: WifiOff,
      label: "Verbinding verbroken",
      className: "text-error",
      dotClass: "bg-error",
    },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <>
      <Header activePage="live" />
      <main className="mt-20 px-4 sm:px-6 max-w-3xl mx-auto pb-28">
        {/* Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("w-2 h-2 rounded-full", cfg.dotClass)} />
            <p className="section-label">Live Commentaar</p>
          </div>
          <h1 className="text-3xl font-black font-headline text-on-surface">
            Live <span className="text-primary-container">Updates</span>
          </h1>
        </div>

        {/* Connection status */}
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-6 text-sm font-medium",
            status === "connected"
              ? "bg-green-500/5 border-green-500/20 text-green-700"
              : status === "disconnected"
              ? "bg-error/5 border-error/20 text-error"
              : "bg-surface-container border-outline-variant/20 text-outline"
          )}
        >
          <StatusIcon size={14} />
          {cfg.label}
        </div>

        {/* Events feed */}
        {events.length === 0 ? (
          <div className="card p-16 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-xl bg-surface-container flex items-center justify-center mb-4">
              <span className="text-3xl">⚽</span>
            </div>
            <p className="font-headline font-bold text-on-surface text-lg">
              Nog geen live wedstrijd
            </p>
            <p className="text-sm text-on-surface-variant mt-2 max-w-xs mx-auto">
              Kom terug tijdens de wedstrijd voor live updates, doelpunten en meer.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => {
              const Icon = eventIcons[event.type] ?? MessageCircle;
              const style = eventStyles[event.type] ?? eventStyles.message;

              return (
                <div
                  key={event.id}
                  className={cn(
                    "flex gap-4 animate-fade-in",
                    event.type === "goal" && "scale-[1.02]"
                  )}
                >
                  {/* Minute + marker */}
                  <div className="flex flex-col items-center gap-1 w-12 flex-shrink-0">
                    {event.minute != null && (
                      <span className="text-[10px] font-black text-primary-container font-label">
                        {event.minute}&apos;
                      </span>
                    )}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        style
                      )}
                    >
                      <Icon size={14} />
                    </div>
                    {i < events.length - 1 && (
                      <div className="flex-1 w-px bg-outline-variant/20 min-h-[16px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "font-headline font-bold leading-tight",
                          event.type === "goal" ? "text-base" : "text-sm"
                        )}
                      >
                        {event.title}
                      </p>
                      <span className="text-[11px] text-on-surface-variant whitespace-nowrap">
                        {timeAgo(event.timestamp)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
