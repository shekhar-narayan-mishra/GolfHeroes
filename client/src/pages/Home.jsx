import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } },
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } },
  };

  return (
    <div className="bg-[#0f172a] min-h-screen text-slate-300 font-sans overflow-x-hidden selection:bg-brand-500/30">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full bg-success/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-warning/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Digital Heroes</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/charities" className="hidden md:block text-slate-400 hover:text-white transition-colors">Supported Charities</Link>
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors">Log in</Link>
          <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md">
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-4xl pt-10"
        >
          <motion.div variants={fadeLeft} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Play with Purpose
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
            Your golf scores. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-success to-brand-600">
              Real world impact.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            Join the only golf club where your weekly Stableford round fuels massive monthly prize draws and automatically donates to causes you care about.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold tracking-wide shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
              Start Your Journey
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link to="/charities" className="px-8 py-4 rounded-2xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center">
              Explore Charities
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Decorative Graphic */}
        <motion.div 
          initial={{ opacity: 0, rotate: 10, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="hidden lg:block absolute right-0 top-10 pointer-events-none"
        >
          <div className="relative w-[500px] h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-success/20 rounded-full blur-[80px]" />
            <div className="absolute inset-10 bg-[#0f172a] rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-5 gap-4 opacity-30 rotate-12 scale-150">
                {Array.from({length: 25}).map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg bg-brand-500/30 flex items-center justify-center">
                    <span className="text-white font-bold">{Math.floor(Math.random() * 45) + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating Element */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-10 top-1/3 glass p-4 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md"
            >
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Prize Draw</p>
              <p className="text-2xl font-black text-white tabular-nums">£24,500</p>
              <p className="text-xs text-success font-semibold mt-1">Next draw in 14 days</p>
            </motion.div>
            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-0 bottom-1/4 glass p-4 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md"
            >
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Donated</p>
              <p className="text-2xl font-black text-brand-400 tabular-nums">£12,050</p>
              <p className="text-xs text-slate-300 font-medium mt-1">To Mind Charity</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How it Works / Workflow */}
      <section className="relative z-10 py-24 bg-surface-100/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How Digital Heroes Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">A seamless cycle of playing the game you love, winning massive prizes, and transforming lives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Track Your Scores',
                desc: 'Upload up to 5 Stableford scores from any affiliated golf course. We keep your latest 5 rounds automatically.',
                color: 'text-brand-400'
              },
              {
                step: '02',
                title: 'Monthly Prize Draw',
                desc: 'At the end of the month, 5 numbers are drawn. Match your Stableford scores to the drawn numbers to win large cash prizes.',
                color: 'text-warning'
              },
              {
                step: '03',
                title: 'Fund Your Charity',
                desc: 'A minimum of 10% of your subscription goes directly to a registered charity of your choice. You can increase this anytime.',
                color: 'text-success'
              }
            ].map((item, idx) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.2, type: 'spring' }}
                className="glass rounded-3xl p-8 relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 text-8xl font-black opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                  {item.step}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${item.color}`}>{item.title}</h3>
                <p className="text-slate-400 leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-[3rem] p-12 md:p-20 border border-brand-500/20 bg-brand-950/20 shadow-2xl shadow-brand-900/20"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">Ready to become a Hero?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
              Join thousands of golfers turning their weekend rounds into life-changing charity donations and massive prize pools. Just £19.99/month.
            </p>
            <Link to="/signup" className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-brand-950 font-black text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-white/10">
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Digital Heroes. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/charities" className="hover:text-white transition-colors">Charities</Link>
            <Link to="/login" className="hover:text-white transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
