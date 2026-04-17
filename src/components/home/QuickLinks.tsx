import Link from "next/link";
import { Calendar, Image, Star, Heart } from "lucide-react";

const links = [
  { href: "/schema", label: "Schema", icon: Calendar },
  { href: "/fotos", label: "Foto's", icon: Image },
  { href: "/kids", label: "Kids", icon: Star },
  { href: "/doneren", label: "Doneren", icon: Heart },
];

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center justify-center gap-2.5 p-4 bg-surface-container-low hover:bg-surface-container border border-transparent hover:border-outline-variant/20 rounded-xl transition-all duration-200 group"
        >
          <Icon
            size={22}
            className="text-secondary group-hover:text-primary-container transition-colors duration-150"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors duration-150">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
