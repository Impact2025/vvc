import { Goal, Image, Heart, MessageCircle, MapPin } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

export type ActivityType = "goal" | "photo" | "comment" | "donation" | "checkin";

export interface Activity {
  id: string | number;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date | string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap: Record<ActivityType, React.ElementType> = {
  goal: Goal,
  photo: Image,
  comment: MessageCircle,
  donation: Heart,
  checkin: MapPin,
};

const markerStyles: Record<ActivityType, string> = {
  goal: "bg-primary-container text-white",
  photo: "bg-secondary text-white",
  comment: "bg-surface-container-highest text-on-surface-variant",
  donation: "bg-red-500 text-white",
  checkin: "bg-tertiary text-white",
};

function ActivityItem({ activity }: { activity: Activity }) {
  const Icon = iconMap[activity.type];
  const marker = markerStyles[activity.type];

  return (
    <div className="flex gap-4 animate-fade-in">
      {/* Timeline marker */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            marker
          )}
        >
          <Icon size={14} />
        </div>
        <div className="w-px flex-1 bg-outline-variant/20 mt-2" />
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-on-surface leading-tight">{activity.title}</p>
          <span className="text-[11px] text-on-surface-variant whitespace-nowrap flex-shrink-0 mt-0.5">
            {timeAgo(activity.timestamp)}
          </span>
        </div>
        {activity.description && (
          <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div>
      <p className="section-label mb-4">Wedstrijd Activiteit</p>
      {activities.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-on-surface-variant text-sm">
            Nog geen activiteit — kom terug tijdens de tour!
          </p>
        </div>
      ) : (
        <div className="card p-6">
          {activities.map((activity, i) => (
            <div
              key={activity.id}
              className={cn(i === activities.length - 1 && "[&_.flex-1.bg-outline-variant\\/20]:hidden")}
            >
              <ActivityItem activity={activity} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
