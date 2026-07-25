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
  AlertCircle,
  Compass
} from 'lucide-react';

interface GuidePageProps {
  guides: GuideArticle[];
  onOpenCurrencyConverter: () => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ guides, onOpenCurrencyConverter }) => {
  const { t, language } = useLanguage();
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
      <div className="bg-[#134E4A] text-white p-6 sm:p-8 rounded-3xl border border-[#F5C542]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5C542] uppercase tracking-[0.25em]">
            <BookOpen className="w-4 h-4 text-[#F5C542]" />
            <span>{t('touristTip')}</span>
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white mt-1">
            {t('guideTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#F2EDE4]/80 mt-1 max-w-xl">
            {t('guideDesc')}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs text-[#F5C542] space-y-1 hidden md:block">
          <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-xs">
            <Compass className="w-4 h-4 text-[#F5C542]" />
            <span>{t('essentialTouristAdvice')}</span>
          </div>
          <p className="text-xs text-[#F2EDE4]/80">{t('learnPhrasesDesc')}</p>
        </div>

        <button
          onClick={onOpenCurrencyConverter}
          className="bg-[#FF914D] hover:bg-[#F07A33] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shrink-0 shadow-md"
        >
          {t('openConverter')} ➔
        </button>
      </div>

      {/* Main Guide Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-[#E8DEC8] shadow-xs space-y-2">
          <div className="text-xs font-bold text-[#FF914D] uppercase tracking-[0.2em] px-3 py-1">{t('navGuide')}</div>
          {guides.map((guide) => {
            const isActive = guide.id === activeTabId;
            return (
              <button
                key={guide.id}
                onClick={() => setActiveTabId(guide.id)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-3 ${
                  isActive
                    ? 'bg-[#FF914D] text-white shadow-xs font-bold'
                    : 'bg-[#F2EDE4] text-[#2D2926] hover:bg-[#E8DEC8]'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-[#134E4A]/10 text-[#134E4A]'}`}>
                  {categoryIcons[guide.id] || <BookOpen className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-sans leading-tight">{language === 'kh' ? (guide.titleKh || guide.title) : guide.title}</div>
                  <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-[#8C7A70]'}`}>
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
              <span className="bg-[#FF914D]/10 text-[#FF914D] text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-widest">
                {activeGuide.category}
              </span>
              <span className="text-xs text-[#8C7A70]">{activeGuide.readTime}</span>
            </div>

            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-[#134E4A] leading-tight">
              {language === 'kh' ? (activeGuide.titleKh || activeGuide.title) : activeGuide.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4D44] mt-2 italic border-l-2 border-[#FF914D] pl-3 py-0.5">
              "{language === 'kh' ? (activeGuide.summaryKh || activeGuide.summary) : activeGuide.summary}"
            </p>
          </div>

          {/* Key Tips Summary Box */}
          <div className="bg-[#F2EDE4] p-5 rounded-2xl border border-[#134E4A]/10 space-y-3">
            <h3 className="font-sans font-bold text-base text-[#134E4A] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#134E4A]" />
              {t('keyAuthenticityTips')}
            </h3>
            <ul className="space-y-2 text-xs text-[#2D2926]">
              {(language === 'kh' && activeGuide.keyTipsKh ? activeGuide.keyTipsKh : activeGuide.keyTips).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#134E4A] shrink-0 mt-1.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content Paragraphs */}
          <div className="space-y-4">
            {(language === 'kh' && activeGuide.contentKh ? activeGuide.contentKh : activeGuide.content).map((paragraph, idx) => (
              <p key={idx} className="text-sm text-[#5C4D44] leading-relaxed">
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
                    <Smile className="w-5 h-5 text-[#FF914D]" />
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
                            ? 'bg-[#FF914D] text-white animate-pulse'
                            : 'bg-[#F2EDE4] text-[#134E4A] hover:bg-[#FF914D] hover:text-white'
                        }`}
                        title="Listen to Khmer audio"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-base font-sans text-[#FF914D] font-semibold">{phrase.khmer}</div>
                    <div className="text-xs font-mono text-[#134E4A] font-bold">{phrase.phonetic}</div>
                    <div className="text-xs text-[#8C7A70] italic">{phrase.context}</div>
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

