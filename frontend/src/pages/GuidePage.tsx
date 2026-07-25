import React, { useState } from 'react';
import { GuideArticle } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, 
  ShoppingBag, 
  ShieldCheck, 
  CreditCard, 
  PlaneTakeoff, 
  Volume2, 
  Smile, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface GuidePageProps {
  guides: GuideArticle[];
  onOpenCurrencyConverter: () => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ guides, onOpenCurrencyConverter }) => {
  const { t } = useLanguage();
  const [activeTabId, setActiveTabId] = useState<string>('bargaining-etiquette');
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  const activeGuide = guides.find(g => g.id === activeTabId) || guides[0];

  // Web Speech Synthesis for Khmer audio pronunciation
  const playKhmerAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'km-KH'; // Khmer language tag
      utterance.rate = 0.85; // Slightly slower for clear learning
      
      utterance.onstart = () => setPlayingPhrase(text);
      utterance.onend = () => setPlayingPhrase(null);
      utterance.onerror = () => setPlayingPhrase(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  const categoryIcons: { [key: string]: React.ReactNode } = {
    'bargaining-etiquette': <ShoppingBag className="w-4 h-4" />,
    'authenticity-guide': <ShieldCheck className="w-4 h-4" />,
    'currency-and-aba-pay': <CreditCard className="w-4 h-4" />,
    'customs-and-export': <PlaneTakeoff className="w-4 h-4" />,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#134E4A] text-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.25em] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('touristTip')}</span>
          </span>
          <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white mt-1">
            {t('buyingGuideTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#F2EDE4]/80 mt-1 max-w-xl">
            {t('buyingGuideDesc')}
          </p>
        </div>

        <button
          onClick={onOpenCurrencyConverter}
          className="bg-[#BF5A36] hover:bg-[#a34b2c] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shrink-0 shadow-md"
        >
          {t('openConverter')} ➔
        </button>
      </div>

      {/* Main Guide Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-[#E8DEC8] shadow-xs space-y-2">
          <div className="text-[10px] font-bold text-[#BF5A36] uppercase tracking-[0.2em] px-3 py-1">{t('navGuide')}</div>
          {guides.map((guide) => {
            const isActive = guide.id === activeTabId;
            return (
              <button
                key={guide.id}
                onClick={() => setActiveTabId(guide.id)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-3 ${
                  isActive
                    ? 'bg-[#BF5A36] text-white shadow-xs font-bold'
                    : 'bg-[#F2EDE4] text-[#2D2926] hover:bg-[#E8DEC8]'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-[#134E4A]/10 text-[#134E4A]'}`}>
                  {categoryIcons[guide.id] || <BookOpen className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-sans leading-tight">{guide.title}</div>
                  <div className={`text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'text-[#8C7A70]'}`}>
                    {guide.readTime} • {guide.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Article Reader Container */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC8] shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#BF5A36]/10 text-[#BF5A36] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest">
                {activeGuide.category}
              </span>
              <span className="text-xs text-[#8C7A70]">{activeGuide.readTime}</span>
            </div>

            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-[#134E4A] leading-tight">
              {activeGuide.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4D44] mt-2 italic border-l-2 border-[#BF5A36] pl-3 py-0.5">
              "{activeGuide.summary}"
            </p>
          </div>

          {/* Key Tips Summary Box */}
          <div className="bg-[#F2EDE4] p-5 rounded-2xl border border-[#134E4A]/10 space-y-3">
            <h3 className="font-sans font-bold text-base text-[#134E4A] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#134E4A]" />
              {t('keyAuthenticityTips')}
            </h3>
            <ul className="space-y-2 text-xs text-[#2D2926]">
              {activeGuide.keyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#134E4A] shrink-0 mt-1.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Article Body Content Paragraphs */}
          <div className="space-y-4 text-xs sm:text-sm text-[#2D2926] leading-relaxed">
            {activeGuide.content.map((paragraph, idx) => (
              <p key={idx} className="bg-[#FDF8F3] p-4 rounded-xl border border-[#134E4A]/10">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Interactive Khmer Phrasebook (if available in guide) */}
          {activeGuide.phrases && activeGuide.phrases.length > 0 && (
            <div className="bg-[#F2EDE4] p-6 rounded-2xl border border-[#134E4A]/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-lg text-[#134E4A] flex items-center gap-2">
                    <Smile className="w-5 h-5 text-[#BF5A36]" />
                    {t('politeKhmerPhrases')}
                  </h3>
                  <p className="text-xs text-[#5C4D44]">{t('listenAudioNote')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeGuide.phrases.map((phrase, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#E8DEC8] space-y-1.5 shadow-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-[#2D2926]">{phrase.english}</span>
                      <button
                        onClick={() => playKhmerAudio(phrase.khmer)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          playingPhrase === phrase.khmer
                            ? 'bg-[#BF5A36] text-white animate-pulse'
                            : 'bg-[#F2EDE4] text-[#134E4A] hover:bg-[#BF5A36] hover:text-white'
                        }`}
                        title="Listen to Khmer audio"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-base font-sans text-[#BF5A36] font-semibold">{phrase.khmer}</div>
                    <div className="text-xs font-mono text-[#134E4A] font-bold">{phrase.phonetic}</div>
                    <div className="text-[10px] text-[#8C7A70] italic">{phrase.context}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

