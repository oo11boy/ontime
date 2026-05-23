import { Instagram, Send, MessageCircle, Phone, Globe, AtSign, Share2 } from "lucide-react";

interface SocialMediaProps {
  socialMedia: {
    instagram?: string;
    telegram?: string;
    rubika?: string;
    whatsapp?: string;
    eitaa?: string;
    bale?: string;
    soroush?: string;
  };
}

export function SocialMedia({ socialMedia }: SocialMediaProps) {
  const socials = [
    {
      name: "اینستاگرام",
      icon: Instagram,
      iconColor: "text-pink-600",
      username: socialMedia?.instagram,
      url: `https://instagram.com/${socialMedia?.instagram}`,
    },
    {
      name: "تلگرام",
      icon: Send,
      iconColor: "text-blue-500",
      username: socialMedia?.telegram,
      url: `https://t.me/${socialMedia?.telegram}`,
    },
    {
      name: "روبیکا",
      icon: MessageCircle,
      iconColor: "text-green-500",
      username: socialMedia?.rubika,
      url: `https://rubika.ir/${socialMedia?.rubika}`,
    },
    {
      name: "واتساپ",
      icon: Phone,
      iconColor: "text-green-600",
      username: socialMedia?.whatsapp,
      url: `https://wa.me/${socialMedia?.whatsapp?.replace(/[^0-9]/g, "")}`,
    },
    {
      name: "ایتا",
      icon: Globe,
      iconColor: "text-purple-500",
      username: socialMedia?.eitaa,
      url: `https://eitaa.com/${socialMedia?.eitaa}`,
    },
    {
      name: "بله",
      icon: AtSign,
      iconColor: "text-amber-500",
      username: socialMedia?.bale,
      url: `https://bale.ai/${socialMedia?.bale}`,
    },
    {
      name: "سروش",
      icon: MessageCircle,
      iconColor: "text-indigo-500",
      username: socialMedia?.soroush,
      url: `https://soroush.ai/${socialMedia?.soroush}`,
    },
  ].filter((s) => s.username && s.username.trim() !== "");

  if (socials.length === 0) return null;

  return (
    <div>
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <Share2 size={18} className="text-emerald-400" /> شبکه‌های اجتماعی
      </h3>
      <div className="flex flex-wrap gap-3">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[100px] bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-3 border border-white/10 text-center hover:bg-emerald-500/10 transition-all group"
          >
            <social.icon className={`w-6 h-6 mx-auto mb-1 transition-all group-hover:scale-110 ${social.iconColor}`} />
            <p className="text-xs text-gray-300">{social.name}</p>
            <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[80px] mx-auto">
              @{social.username}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}