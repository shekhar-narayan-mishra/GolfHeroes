import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';

const glassCardStyle = {
  background: 'rgba(255,255,255,0.45)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.78)',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
};

function IconStar({ className = 'w-4 h-4', stroke = '#2d7020' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l2.1 4.26 4.7.68-3.4 3.32.8 4.69L12 14.9l-4.2 2.2.8-4.69-3.4-3.32 4.7-.68L12 3.75z" />
    </svg>
  );
}

function IconMonitor({ className = 'w-4 h-4', stroke = '#5a7a4e' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.7" aria-hidden="true">
      <rect x="4.5" y="5.5" width="15" height="10" rx="1.8" />
      <path strokeLinecap="round" d="M9 19h6M12 15.8V19" />
    </svg>
  );
}

function IconHeart({ className = 'w-4 h-4', stroke = '#5a7a4e' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-4.8-7-10a4 4 0 0 1 7-2.3A4 4 0 0 1 19 10c0 5.2-7 10-7 10z" />
    </svg>
  );
}

function IconPulse({ className = 'w-4 h-4', stroke = '#5a7a4e' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-4 4 8 2-4h6" />
    </svg>
  );
}

function IconMedal({ className = 'w-4 h-4', stroke = '#4169e1' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8l-1.8 5H9.8L8 3z" />
      <circle cx="12" cy="14.5" r="4" />
      <path strokeLinecap="round" d="M10.8 14.5l.9.9 1.5-1.8" />
    </svg>
  );
}

function IconUser({ className = 'w-4 h-4', stroke = '#a0522d' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="9" r="3" />
      <path strokeLinecap="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function IconClock({ className = 'w-4 h-4', stroke = '#7a9a6e' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="M12 8.5V12l2.7 1.9" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7m0 0l-7 7m7-7H4" />
    </svg>
  );
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const existing = document.getElementById('digital-heroes-fonts');
    if (existing) return;

    const link = document.createElement('link');
    link.id = 'digital-heroes-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const introItems = [
    { key: 'eyebrow', delay: 0.08 },
    { key: 'title', delay: 0.18 },
    { key: 'subtitle', delay: 0.28 },
    { key: 'cta', delay: 0.38 },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: '#ffffff',
        fontFamily: 'DM Sans, system-ui, sans-serif',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.90) 18%, rgba(255,255,255,0.55) 36%, rgba(255,255,255,0.08) 55%, transparent 70%), url(https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        className="absolute inset-x-0 top-0 h-[62%] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a3d0a 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          opacity: 0.04,
        }}
      />

      <div className="relative z-10">
  <header className="relative max-w-[1140px] mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Golf Heroes Home">
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center"
              style={{ backgroundColor: '#0f2409' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.5l1.9 3.86 4.26.62-3.08 2.99.72 4.23L11 13.3l-3.8 1.9.73-4.23-3.09-2.99 4.27-.62L11 3.5z" />
                <path strokeLinecap="round" d="M11 13.3V21" />
              </svg>
            </div>
            <span
              style={{
                color: '#0f2409',
                fontWeight: 500,
                fontSize: '17px',
                letterSpacing: '-0.2px',
              }}
            >
              Golf Heroes
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Home', to: '/' },
              { label: 'Charities', to: '/charities' },
              { label: 'How it works', to: '/draws' },
              { label: 'Pricing', to: '/subscribe' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                style={{
                  color: '#3a5a2e',
                  fontSize: '13px',
                  fontWeight: 400,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/login" style={{ color: '#0f2409', fontSize: '13px', fontWeight: 400 }}>
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center"
              style={{
                backgroundColor: '#0f2409',
                color: '#e8f5e3',
                borderRadius: '100px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Sign up
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-[10px]"
            style={{ border: '1px solid rgba(15,36,9,0.2)', color: '#0f2409' }}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <AnimatePresence>
            {isMobileMenuOpen ? (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full right-5 sm:right-8 mt-2 md:hidden w-[228px] p-2.5 rounded-[16px] z-40"
                style={{
                  background: 'rgba(255,255,255,0.70)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 10px 30px rgba(8, 22, 7, 0.08)',
                }}
              >
                <div className="flex flex-col">
                  {[
                    { label: 'Home', to: '/' },
                    { label: 'Charities', to: '/charities' },
                    { label: 'How it works', to: '/draws' },
                    { label: 'Pricing', to: '/subscribe' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-[10px]"
                      style={{ color: '#3a5a2e', fontSize: '13px', fontWeight: 400 }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-1.5 pt-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(58,90,46,0.12)' }}>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center flex-1"
                    style={{ color: '#0f2409', fontSize: '13px', fontWeight: 400, minHeight: '36px' }}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center"
                    style={{
                      backgroundColor: '#0f2409',
                      color: '#e8f5e3',
                      borderRadius: '100px',
                      padding: '9px 14px',
                      fontSize: '12.5px',
                      fontWeight: 500,
                    }}
                  >
                    Sign up
                  </Link>
                </div>
              </Motion.div>
            ) : null}
          </AnimatePresence>
        </header>

        <section className="relative max-w-[1140px] mx-auto px-5 sm:px-8 pb-16 md:pb-24 pt-8 md:pt-12 min-h-[calc(100vh-92px)] flex items-start justify-center">
          <div className="w-full flex flex-col items-center text-center relative z-20 pt-2 md:pt-8">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: introItems[0].delay, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.70)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.9)',
                color: '#2d5a20',
                fontSize: '11px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              <Motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#2d7020' }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
              />
              Play with Purpose
            </Motion.div>

            <Motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: introItems[1].delay, ease: 'easeOut' }}
              className="mt-6 leading-[0.95] text-[48px] md:text-[68px]"
              style={{
                color: '#0b1a08',
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
                letterSpacing: '-1px',
              }}
            >
              <span className="block md:inline">Your golf scores,</span>
              <span
                className="block mt-2 md:mt-1 text-[42px] md:text-[60px]"
                style={{
                  color: '#3d6b28',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  letterSpacing: '-0.5px',
                }}
              >
                real world impact.
              </span>
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: introItems[2].delay, ease: 'easeOut' }}
              className="mt-6"
              style={{
                color: '#4a5e3e',
                maxWidth: '400px',
                lineHeight: 1.7,
                fontWeight: 300,
                fontSize: '14.5px',
              }}
            >
              The only golf club where your Stableford scores fuel monthly prize draws and automatically donate to causes you love.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: introItems[3].delay, ease: 'easeOut' }}
              className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-[470px]"
            >
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 w-full"
                style={{
                  backgroundColor: '#0f2409',
                  color: '#e8f5e3',
                  borderRadius: '100px',
                  padding: '13px 30px',
                  fontWeight: 500,
                  fontSize: '13.5px',
                }}
              >
                Start your journey
                <ArrowRightIcon />
              </Link>
              <Link
                to="/charities"
                className="inline-flex items-center justify-center w-full"
                style={{
                  background: 'rgba(255,255,255,0.60)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  color: '#0f2409',
                  borderRadius: '100px',
                  padding: '13px 30px',
                  fontWeight: 500,
                  fontSize: '13.5px',
                }}
              >
                Explore charities
              </Link>
            </Motion.div>

            <div className="md:hidden mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[370px]">
              <div
                className="w-full text-center px-4 py-2.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  color: '#2d5a20',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                £24,500 Prize Pool
              </div>
              <div
                className="w-full text-center px-4 py-2.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  color: '#1d4ed8',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                £12,050 Donated
              </div>
            </div>
          </div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.52 }}
            className="hidden md:block absolute left-[3%] top-[28%]"
          >
            <Motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="p-4"
              style={{ ...glassCardStyle, width: '188px', rotate: '-2.5deg' }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <IconMonitor className="w-[11px] h-[11px]" stroke="#5a7a4e" />
                <span style={{ fontSize: '10px', color: '#5a7a4e', letterSpacing: '1px', fontWeight: 500 }}>PRIZE DRAW</span>
              </div>
              <p
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  color: '#0b1a08',
                  fontSize: '40px',
                  lineHeight: 1,
                  letterSpacing: '-1px',
                  fontWeight: 600,
                }}
              >
                £24,500
              </p>
              <p style={{ color: '#7a9a6e', fontSize: '11px', fontWeight: 300, marginTop: '3px' }}>Total jackpot pool</p>
              <div
                className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(74,158,48,0.10)',
                  border: '1px solid rgba(74,158,48,0.20)',
                  color: '#2d7020',
                  fontSize: '10.5px',
                  fontWeight: 500,
                }}
              >
                <Motion.span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#2d7020' }}
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                Draw in 14 days
              </div>
            </Motion.div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.67 }}
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-[24%]"
          >
            <Motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-3 p-3.5"
              style={{ ...glassCardStyle, width: '270px' }}
            >
              <div
                className="shrink-0 w-[38px] h-[38px] rounded-[10px] flex items-center justify-center"
                style={{ background: 'rgba(74,158,48,0.10)', border: '1px solid rgba(74,158,48,0.20)' }}
              >
                <IconStar className="w-4 h-4" stroke="#2d7020" />
              </div>
              <div>
                <p style={{ fontSize: '12.5px', color: '#0b1a08', fontWeight: 500 }}>5-number jackpot winner confirmed</p>
                <p style={{ fontSize: '11px', color: '#7a9a6e', fontWeight: 300, marginTop: '2px' }}>Draw completed · March 2026</p>
              </div>
            </Motion.div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.82 }}
            className="hidden md:block absolute right-[3%] top-[30%]"
          >
            <Motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
              className="p-4"
              style={{ ...glassCardStyle, width: '182px', rotate: '2deg' }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <IconHeart className="w-[11px] h-[11px]" stroke="#5a7a4e" />
                <span style={{ fontSize: '10px', color: '#5a7a4e', letterSpacing: '1px', fontWeight: 500 }}>DONATED</span>
              </div>
              <p
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  color: '#0b1a08',
                  fontSize: '40px',
                  lineHeight: 1,
                  letterSpacing: '-1px',
                  fontWeight: 600,
                }}
              >
                £12,050
              </p>
              <p style={{ color: '#7a9a6e', fontSize: '11px', fontWeight: 300, marginTop: '3px' }}>This month</p>
              <div
                className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(37,99,235,0.08)',
                  border: '1px solid rgba(37,99,235,0.18)',
                  color: '#1d4ed8',
                  fontSize: '10.5px',
                  fontWeight: 500,
                }}
              >
                <Motion.span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#1d4ed8' }}
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                Mind Charity
              </div>
            </Motion.div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.97 }}
            className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-[6%]"
          >
            <Motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
              className="p-4"
              style={{ ...glassCardStyle, width: '318px' }}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <IconPulse className="w-[11px] h-[11px]" stroke="#5a7a4e" />
                <span style={{ fontSize: '10px', color: '#5a7a4e', letterSpacing: '1px', fontWeight: 500 }}>RECENT DRAW RESULTS</span>
              </div>

              {[
                {
                  id: 1,
                  name: 'Sarah M.',
                  match: '5-match',
                  amount: '£9,800',
                  amountColor: '#2d7020',
                  iconBox: { bg: 'rgba(218,165,32,0.14)', border: '#d8b24f' },
                  icon: <IconStar className="w-3.5 h-3.5" stroke="#b8860b" />,
                },
                {
                  id: 2,
                  name: 'James T.',
                  match: '4-match',
                  amount: '£8,575',
                  amountColor: '#2d7020',
                  iconBox: { bg: 'rgba(100,149,237,0.14)', border: '#6b90e9' },
                  icon: <IconMedal className="w-3.5 h-3.5" stroke="#4169e1" />,
                },
                {
                  id: 3,
                  name: 'Priya K.',
                  match: '3-match',
                  amount: '£6,125',
                  amountColor: '#2d7020',
                  iconBox: { bg: 'rgba(180,100,50,0.14)', border: '#bc7f5f' },
                  icon: <IconUser className="w-3.5 h-3.5" stroke="#a0522d" />,
                },
                {
                  id: 4,
                  name: 'Next draw closes in',
                  match: '14 days',
                  amount: '—',
                  amountColor: '#7a9a6e',
                  iconBox: { bg: 'rgba(143,143,143,0.12)', border: '#a5a5a5' },
                  icon: <IconClock className="w-3.5 h-3.5" stroke="#7a9a6e" />,
                },
              ].map((row, index) => (
                <div
                  key={row.id}
                  className="py-2 flex items-center gap-2.5"
                  style={{ borderBottom: index === 3 ? 'none' : '1px solid rgba(255,255,255,0.55)' }}
                >
                  <div
                    className="w-7 h-7 rounded-[7px] flex items-center justify-center"
                    style={{ background: row.iconBox.bg, border: `1px solid ${row.iconBox.border}` }}
                  >
                    {row.icon}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p style={{ color: '#0b1a08', fontSize: '12px', fontWeight: 500, lineHeight: 1.2 }}>{row.name}</p>
                    <p style={{ color: '#7a9a6e', fontSize: '10.5px', fontWeight: 300, marginTop: '1px' }}>{row.match}</p>
                  </div>
                  <p style={{ color: row.amountColor, fontSize: '12px', fontWeight: 500 }}>{row.amount}</p>
                </div>
              ))}
            </Motion.div>
          </Motion.div>
        </section>

        <section className="max-w-[1140px] mx-auto px-5 sm:px-8 pb-14 md:pb-20">
          <div className="text-center mb-8 md:mb-10">
            <p
              className="text-[11px] uppercase tracking-[1.4px] mb-3"
              style={{ color: '#6a8160', fontWeight: 500 }}
            >
              Smart golf giving
            </p>
            <h2
              className="leading-[0.95] text-[42px] md:text-[58px]"
              style={{
                color: '#0b1a08',
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
                letterSpacing: '-0.8px',
              }}
            >
              Upgrade your golf routine
              <span className="block italic" style={{ color: '#3d6b28', fontWeight: 300 }}>
                into monthly impact.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                title: 'Submit rounds',
                copy: 'Upload Stableford scores from your usual course each month with one-tap entry.',
              },
              {
                title: 'Enter draw pool',
                copy: 'Your scores automatically enter you in transparent monthly prize draws.',
              },
              {
                title: 'Fund your cause',
                copy: 'A built-in contribution supports registered charities you can pick and change anytime.',
              },
            ].map((item) => (
              <div key={item.title} className="glass p-5 md:p-6 rounded-[20px]">
                <h3 style={{ color: '#0b1a08', fontSize: '18px', fontWeight: 500 }}>{item.title}</h3>
                <p className="mt-2" style={{ color: '#4d6641', fontSize: '13px', lineHeight: 1.7 }}>
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1140px] mx-auto px-5 sm:px-8 pb-20 md:pb-24">
          <div className="glass rounded-[24px] p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3
                  className="text-[34px] md:text-[46px] leading-[0.95]"
                  style={{
                    color: '#0b1a08',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: 600,
                    letterSpacing: '-0.7px',
                  }}
                >
                  A transparent membership
                  <span className="block italic" style={{ color: '#3d6b28', fontWeight: 300 }}>
                    for modern golfers.
                  </span>
                </h3>
                <p className="mt-3" style={{ color: '#4d6641', fontSize: '14px', lineHeight: 1.75 }}>
                  Every round, draw result, and donation is tracked in your dashboard so you can see your gameplay and impact grow together.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: '£24,500', v: 'Current prize pool' },
                  { k: '£12,050', v: 'Donated this month' },
                  { k: '14 Days', v: 'Until draw closes' },
                  { k: '5 Scores', v: 'Needed to enter' },
                ].map((stat) => (
                  <div key={stat.v} className="rounded-[16px] p-4" style={{ background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.86)' }}>
                    <p style={{ color: '#0b1a08', fontSize: '22px', fontWeight: 600 }}>{stat.k}</p>
                    <p className="mt-1" style={{ color: '#5f7253', fontSize: '11.5px' }}>{stat.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
