import React from 'react';
import { Shop } from '../types';
import { Phone, Mail, Globe, Send, MessageCircle, AtSign } from 'lucide-react';

/** Normalize a handle/number/URL into an outbound link for a given channel. */
function buildHref(kind: string, raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const handle = v.replace(/^@/, '');
  const isUrl = /^https?:\/\//i.test(v);
  const digits = v.replace(/[^\d]/g, '');
  switch (kind) {
    case 'phone':
      return `tel:${v.replace(/\s+/g, '')}`;
    case 'email':
      return `mailto:${v}`;
    case 'website':
      return isUrl ? v : `https://${v}`;
    case 'telegram':
      return isUrl ? v : `https://t.me/${handle}`;
    case 'whatsapp':
      return isUrl ? v : `https://wa.me/${digits}`;
    case 'messenger':
      return isUrl ? v : `https://m.me/${handle}`;
    case 'instagram':
      return isUrl ? v : `https://instagram.com/${handle}`;
    case 'facebook':
      return isUrl ? v : `https://facebook.com/${handle}`;
    case 'tiktok':
      return isUrl ? v : `https://tiktok.com/@${handle}`;
    case 'wechat':
      return null; // WeChat IDs aren't linkable — show as copyable text
    default:
      return null;
  }
}

interface Channel {
  kind: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

function channelsFor(shop: Shop): Channel[] {
  const defs: Omit<Channel, 'value'>[] = [
    { kind: 'phone', label: 'Phone', icon: Phone },
    { kind: 'telegram', label: 'Telegram', icon: Send },
    { kind: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { kind: 'messenger', label: 'Messenger', icon: MessageCircle },
    { kind: 'instagram', label: 'Instagram', icon: AtSign },
    { kind: 'facebook', label: 'Facebook', icon: AtSign },
    { kind: 'tiktok', label: 'TikTok', icon: AtSign },
    { kind: 'wechat', label: 'WeChat', icon: MessageCircle },
    { kind: 'website', label: 'Website', icon: Globe },
    { kind: 'email', label: 'Email', icon: Mail },
  ];
  const map: Record<string, string | undefined> = {
    phone: shop.phone,
    telegram: shop.telegram,
    whatsapp: shop.whatsapp,
    messenger: shop.messenger,
    instagram: shop.instagram,
    facebook: shop.facebook,
    tiktok: shop.tiktok,
    wechat: shop.wechat,
    website: shop.website,
    email: shop.email,
  };
  return defs
    .map((d) => ({ ...d, value: (map[d.kind] ?? '').trim() }))
    .filter((c) => c.value);
}

/** True if the shop has at least one contact channel filled in. */
export function hasContactChannels(shop: Shop): boolean {
  return channelsFor(shop).length > 0;
}

interface Props {
  shop: Shop;
  variant?: 'compact' | 'full';
}

/**
 * Renders a shop's contact/social channels as outbound links.
 * `compact` = small icon pills (shop cards). `full` = labeled rows (store page).
 */
export const ContactLinks: React.FC<Props> = ({ shop, variant = 'compact' }) => {
  const channels = channelsFor(shop);
  if (channels.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {channels.map((c) => {
          const href = buildHref(c.kind, c.value);
          const Icon = c.icon;
          const inner = (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E4A] bg-[#F2EDE4] hover:bg-[#FF914D]/15 border border-[#E8DEC8] rounded-full px-2.5 py-1 transition-colors">
              <Icon className="w-3 h-3 text-[#FF914D]" />
              {c.label}
            </span>
          );
          return href ? (
            <a key={c.kind} href={href} target="_blank" rel="noopener noreferrer nofollow" onClick={(e) => e.stopPropagation()}>
              {inner}
            </a>
          ) : (
            <span key={c.kind} title={c.value}>{inner}</span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-2.5">
      {channels.map((c) => {
        const href = buildHref(c.kind, c.value);
        const Icon = c.icon;
        const inner = (
          <span className="flex items-center gap-3 w-full bg-white hover:bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-2.5 transition-colors">
            <span className="w-8 h-8 rounded-lg bg-[#FF914D]/12 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[#FF914D]" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-[#8C7A70] uppercase tracking-wide">{c.label}</span>
              <span className="block text-sm font-semibold text-[#134E4A] truncate">{c.value.replace(/^https?:\/\//, '')}</span>
            </span>
          </span>
        );
        return href ? (
          <a key={c.kind} href={href} target="_blank" rel="noopener noreferrer nofollow" className="block">
            {inner}
          </a>
        ) : (
          <span key={c.kind} className="block">{inner}</span>
        );
      })}
    </div>
  );
};
