import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2, XCircle, Flag, Gavel } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { Footer } from '../components/Footer';

// Bilingual content kept local so the policy reads well in both languages
// without scattering dozens of one-off keys through the dictionaries.
const SECTIONS: {
  icon: React.ComponentType<{ className?: string }>;
  en: { title: string; items: string[] };
  kh: { title: string; items: string[] };
}[] = [
  {
    icon: CheckCircle2,
    en: {
      title: 'What you can list',
      items: [
        'Authentic, handmade or locally-produced Cambodian crafts, food and goods you are allowed to sell.',
        'Your own photos, or photos you have the right to use.',
        'Accurate prices, descriptions, materials and shop location.',
      ],
    },
    kh: {
      title: 'អ្វីដែលអ្នកអាចដាក់លក់',
      items: [
        'សិប្បកម្ម អាហារ និងទំនិញខ្មែរដែលផលិតដោយដៃ ឬក្នុងស្រុក ដែលអ្នកមានសិទ្ធិលក់។',
        'រូបថតផ្ទាល់ខ្លួនរបស់អ្នក ឬរូបថតដែលអ្នកមានសិទ្ធិប្រើ។',
        'តម្លៃ ការពិពណ៌នា សម្ភារៈ និងទីតាំងហាងត្រឹមត្រូវ។',
      ],
    },
  },
  {
    icon: XCircle,
    en: {
      title: 'Not allowed',
      items: [
        'Nudity, sexual, violent, hateful or otherwise inappropriate images.',
        'Counterfeit, stolen, illegal, or protected wildlife/antiquities.',
        'Misleading claims, spam, or someone else’s photos and brand without permission.',
      ],
    },
    kh: {
      title: 'អ្វីដែលមិនអនុញ្ញាត',
      items: [
        'រូបភាពអាសអាភាស ហិង្សា ស្អប់ខ្ពើម ឬមិនសមរម្យ។',
        'ទំនិញក្លែងក្លាយ លួច ខុសច្បាប់ ឬសត្វព្រៃ/វត្ថុបុរាណដែលការពារ។',
        'ការអះអាងបំភាន់ សារឥតបានការ ឬរូបភាព/ម៉ាករបស់អ្នកដទៃដោយគ្មានការអនុញ្ញាត។',
      ],
    },
  },
  {
    icon: ShieldCheck,
    en: {
      title: 'How we keep the marketplace safe',
      items: [
        'Every listing you submit must confirm it follows these guidelines.',
        'Uploaded images can be screened automatically; anything flagged is held for review.',
        'A listing that collects multiple reports is automatically hidden until our team checks it.',
      ],
    },
    kh: {
      title: 'របៀបយើងរក្សាទីផ្សារឱ្យមានសុវត្ថិភាព',
      items: [
        'រាល់បញ្ជីដែលអ្នកដាក់ស្នើ ត្រូវបញ្ជាក់ថាអនុលោមតាមគោលការណ៍ណែនាំនេះ។',
        'រូបភាពដែលបានផ្ទុកឡើងអាចត្រូវបានពិនិត្យស្វ័យប្រវត្តិ អ្វីដែលសង្ស័យត្រូវរង់ចាំការត្រួតពិនិត្យ។',
        'បញ្ជីដែលទទួលបានការរាយការណ៍ច្រើន នឹងត្រូវលាក់ស្វ័យប្រវត្តិ រហូតដល់ក្រុមការងារពិនិត្យ។',
      ],
    },
  },
  {
    icon: Flag,
    en: {
      title: 'Reporting',
      items: [
        'Anyone can report a product or shop using the flag button — no account needed.',
        'Tell us what’s wrong; our team reviews reports and takes action.',
      ],
    },
    kh: {
      title: 'ការរាយការណ៍',
      items: [
        'នរណាម្នាក់អាចរាយការណ៍ផលិតផល ឬហាង ដោយប្រើប៊ូតុងទង់ — មិនចាំបាច់មានគណនី។',
        'ប្រាប់យើងពីអ្វីដែលខុស ក្រុមការងារនឹងពិនិត្យ និងចាត់វិធានការ។',
      ],
    },
  },
  {
    icon: Gavel,
    en: {
      title: 'Enforcement',
      items: [
        'We may hide or remove content, and suspend repeat offenders.',
        'Serious or illegal content may be reported to the relevant authorities.',
      ],
    },
    kh: {
      title: 'ការអនុវត្ត',
      items: [
        'យើងអាចលាក់ ឬលុបខ្លឹមសារ និងផ្អាកអ្នកបំពានម្តងហើយម្តងទៀត។',
        'ខ្លឹមសារធ្ងន់ធ្ងរ ឬខុសច្បាប់ អាចត្រូវរាយការណ៍ទៅអាជ្ញាធរពាក់ព័ន្ធ។',
      ],
    },
  },
];

export const ContentPolicyPage: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8DEC8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AngkorCraft" className="w-9 h-9 object-contain" />
            <span className="font-sans font-extrabold text-[#134E4A] text-lg tracking-tight">AngkorCraft</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#8C7A70] hover:text-[#FF914D] mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('backToMarketplace')}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-[#FF914D]/12 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#FF914D]" />
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#134E4A]">{t('guidelinesLink')}</h1>
        </div>
        <p className="text-sm text-[#5C4D44] mb-8 max-w-2xl">
          {language === 'kh'
            ? 'គោលការណ៍ទាំងនេះរក្សា AngkorCraft ឱ្យមានសុវត្ថិភាព និងជឿទុកចិត្តសម្រាប់អ្នកទិញ និងអ្នកលក់។'
            : 'These guidelines keep AngkorCraft safe and trustworthy for both buyers and sellers.'}
        </p>

        <div className="space-y-4">
          {SECTIONS.map((s, i) => {
            const c = language === 'kh' ? s.kh : s.en;
            const Icon = s.icon;
            return (
              <section key={i} className="bg-white rounded-2xl border border-[#E8DEC8] p-5 sm:p-6">
                <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-[#134E4A] mb-3">
                  <Icon className="w-5 h-5 text-[#FF914D]" /> {c.title}
                </h2>
                <ul className="space-y-2">
                  {c.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#5C4D44]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF914D] mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>

      <Footer onNavigate={(page) => window.location.assign(`/#${page}`)} onOpenCurrencyConverter={() => window.location.assign('/')} />
    </div>
  );
};
