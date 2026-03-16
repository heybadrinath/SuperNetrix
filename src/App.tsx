import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

/* ═══════════════════════ HOOKS ═══════════════════════ */
function useReveal(cls = 'reveal-up', threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.classList.add(cls)
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [cls, threshold])
  return ref
}

function useCounter(end: number, dur = 2000, suffix = '') {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const ran = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true; const t0 = performance.now()
        const tick = (now: number) => { const p = Math.min((now - t0) / dur, 1); setVal(Math.floor((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) requestAnimationFrame(tick) }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    obs.observe(el); return () => obs.disconnect()
  }, [end, dur])
  return { ref, display: `${val}${suffix}` }
}

/* ═══════════════════════ CUSTOM CURSOR ═══════════════════════ */
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY } }
    const onEnter = () => { dotRef.current?.classList.add('hovering'); ringRef.current?.classList.add('hovering') }
    const onLeave = () => { dotRef.current?.classList.remove('hovering'); ringRef.current?.classList.remove('hovering') }

    window.addEventListener('mousemove', onMove)
    const interactives = document.querySelectorAll('a, button, [data-hover]')
    const addListeners = () => {
      document.querySelectorAll('a, button, [data-hover]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    addListeners()
    const mo = new MutationObserver(addListeners)
    mo.observe(document.body, { childList: true, subtree: true })

    let raf: number
    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12
      if (dotRef.current) { dotRef.current.style.left = pos.current.x + 'px'; dotRef.current.style.top = pos.current.y + 'px' }
      if (ringRef.current) { ringRef.current.style.left = ringPos.current.x + 'px'; ringRef.current.style.top = ringPos.current.y + 'px' }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); mo.disconnect() }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block" />
      <div ref={ringRef} className="cursor-ring hidden md:block" />
    </>
  )
}

/* ═══════════════════════ MARQUEE ═══════════════════════ */
function Marquee({ items, reverse = false, className = '', speed = '' }: { items: string[], reverse?: boolean, className?: string, speed?: string }) {
  const text = items.join(' \u2022 ') + ' \u2022 '
  const anim = speed || (reverse ? 'marquee-right' : 'marquee-left')
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className={`inline-flex ${anim}`}>
        {[0,1,2,3].map(i => <span key={i} className="inline-block pr-8">{text}</span>)}
      </div>
    </div>
  )
}

/* ═══════════════════════ WORD REVEAL ═══════════════════════ */
function WordReveal({ children, className = '' }: { children: string, className?: string }) {
  const ref = useReveal('word-reveal', 0.2)
  return <div ref={ref} className={className}>{children.split(' ').map((w, i) => <span key={i} className="word">{w}</span>)}</div>
}

/* ═══════════════════════ NAVBAR ═══════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 60); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn) }, [])
  const links = [{ l: 'About', h: '#about' }, { l: 'Services', h: '#services' }, { l: 'Work', h: '#work' }, { l: 'Process', h: '#process' }, { l: 'FAQ', h: '#faq' }, { l: 'Contact', h: '#contact' }]
  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'bg-transparent'}`}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 h-14 md:h-20 flex items-center justify-between">
        <a href="#" className="text-lg font-bold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Space Grotesk' }}>super<span className="text-[#00c853]">netrix</span>.io</a>
        <div className="hidden lg:flex items-center gap-8">
          {links.map(l => <a key={l.h} href={l.h} className="text-[13px] font-medium text-[#666] hover:text-[#0b0b0b] transition-colors duration-300">{l.l}</a>)}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <a href="https://www.linkedin.com/company/supernetrix" target="_blank" rel="noopener" className="w-9 h-9 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#888] hover:text-[#0b0b0b] hover:border-[#0b0b0b] transition-all"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <a href="#contact" data-hover className="magnetic-btn text-[13px] font-semibold bg-[#0b0b0b] text-white px-5 py-2.5 rounded-full hover:bg-[#00c853] transition-all duration-300">Start Your Project</a>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden flex flex-col gap-[5px] p-2 z-50">
          <span className={`block w-6 h-[2px] bg-[#0b0b0b] transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-[2px] bg-[#0b0b0b] transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-[2px] bg-[#0b0b0b] transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>
      <div className={`lg:hidden fixed inset-0 bg-white z-40 transition-all duration-500 flex flex-col items-center justify-center gap-6 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {links.map(l => <a key={l.h} href={l.h} onClick={() => setOpen(false)} className="text-2xl font-semibold text-[#0b0b0b] hover:text-[#00c853] transition-colors">{l.l}</a>)}
        <a href="#contact" onClick={() => setOpen(false)} className="mt-4 text-base font-semibold bg-[#0b0b0b] text-white px-8 py-3 rounded-full">Start Your Project</a>
      </div>
    </nav>
  )
}

/* ═══════════════════════ BLUR WORD COMPONENT ═══════════════════════ */
function BlurRevealText({ children, delay = 0, className = '' }: { children: string, delay?: number, className?: string }) {
  const words = children.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="blur-word" style={{ animationDelay: `${delay + i * 0.08}s` }}>{word}</span>
      ))}
    </span>
  )
}

/* ═══════════════════════ HERO ═══════════════════════ */
function Hero() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setTimeout(() => setLoaded(true), 100) }, [])

  return (
    <section className="relative w-full bg-white min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16 md:pb-20 px-4 md:px-6">
      {/* Animated gradient blobs */}
      <div className="absolute top-20 -left-40 w-[600px] h-[600px] rounded-full bg-[#00c853]/[0.05] blur-[120px] blob pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] rounded-full bg-[#00c853]/[0.04] blur-[100px] blob-2 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[#6366f1]/[0.03] blur-[80px] blob pointer-events-none" />

      {/* Subtle noise grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0b0b0b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Decorative lines */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-[#e5e5e5] to-transparent opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-[#e5e5e5] to-transparent opacity-30 pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`absolute rounded-full bg-[#00c853] ${i % 2 === 0 ? 'float-anim' : i % 3 === 0 ? 'float-anim-d1' : 'float-anim-d2'}`}
            style={{ width: `${3 + (i % 3) * 2}px`, height: `${3 + (i % 3) * 2}px`, opacity: 0.15 + (i % 4) * 0.05, left: `${8 + i * 11}%`, top: `${15 + (i * 13) % 65}%` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-[#e5e5e5] bg-white/70 backdrop-blur-sm mb-8 md:mb-12 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="w-2 h-2 rounded-full bg-[#00c853] pulse-dot shrink-0" />
          <span className="text-[10px] md:text-[11px] font-semibold text-[#666] uppercase tracking-[0.1em] md:tracking-[0.15em]">Available for Projects &mdash; 2 Spots Left</span>
        </div>

        {/* Heading with BLUR REVEAL effect */}
        {loaded && (
          <h1 className="mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            <span className="block text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-[#0b0b0b]">
              <BlurRevealText delay={0.2}>Outcome Driven</BlurRevealText>
            </span>
            <span className="block text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-[#0b0b0b] mt-1">
              <BlurRevealText delay={0.5}>Engineering for</BlurRevealText>
            </span>
            <span className="block text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] mt-1">
              <BlurRevealText delay={0.8} className="text-[#00c853]">Solid Startups</BlurRevealText>
            </span>
          </h1>
        )}

        {/* Sub - also blur reveals */}
        {loaded && (
          <p className="text-[#666] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            <BlurRevealText delay={1.2}>We craft production-grade apps, AI systems, and scalable platforms that help startups and SMEs move faster and grow smarter.</BlurRevealText>
          </p>
        )}

        {/* CTA */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-[1800ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <a href="#contact" data-hover className="group inline-flex items-center gap-3 bg-[#0b0b0b] text-white font-semibold px-6 md:px-8 py-3.5 md:py-4 rounded-full hover:bg-[#00c853] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,200,83,0.3)] text-sm md:text-[15px]">
            Start Your Project
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
          <a href="#work" data-hover className="inline-flex items-center gap-2 text-sm md:text-[15px] font-semibold border border-[#d5d5d5] text-[#0b0b0b] px-6 md:px-7 py-3.5 md:py-4 rounded-full hover:border-[#0b0b0b] transition-all duration-300">
            View Our Work
          </a>
        </div>

        {/* Trusted by strip */}
        <div className={`mt-10 md:mt-16 flex flex-col items-center gap-3 transition-all duration-1000 delay-[2200ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="text-[11px] font-semibold text-[#bbb] uppercase tracking-[0.15em]">Trusted by Leaders</span>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10 text-[#0b0b0b]/20">
            {['VoiceGuard AI', 'Cesari London', 'Future Sportler', 'Graphite'].map((name, i) => (
              <span key={i} className="text-[10px] md:text-sm font-bold tracking-wider uppercase whitespace-nowrap">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-[2500ms] ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-5 h-9 rounded-full border border-[#ccc] flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 rounded-full bg-[#00c853] animate-bounce" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════ CLIENT MARQUEE ═══════════════════════ */
function ClientMarquee() {
  return (
    <div className="w-full border-y border-[#e5e5e5] bg-[#fafafa] py-5">
      <Marquee items={['VOICEGUARD AI', 'CESARI LONDON', 'FUTURE SPORTLER', 'DIGITAL TWIN', 'GRAPHITE']}
        className="text-sm font-bold tracking-[0.2em] text-[#0b0b0b]/25 uppercase" />
    </div>
  )
}

/* ═══════════════════════ ABOUT (sujalbuild.in style word-by-word reveal) ═══════════════════════ */
function About() {
  const text = "We're SuperNetrix, a strategic technology partner that ships. Every quarter, we build production-grade systems for clients, startups, and enterprises. We blend research, design, and engineering to turn ideas into impactful digital products that move metrics."
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const words = container.querySelectorAll('.about-word')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          obs.unobserve(el)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    words.forEach(w => obs.observe(w))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="about" className="max-w-[1600px] mx-auto px-4 md:px-12 py-20 md:py-40 bg-white">
      <div className="reveal-up" ref={useReveal()}>
        <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold tracking-tight leading-[1.05] text-[#0b0b0b] mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          MORE THAN <span className="italic text-[#00c853] relative">code<svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 100 6" fill="none"><path d="M0 5C25 1 75 1 100 5" stroke="#00c853" strokeWidth="2" strokeLinecap="round"/></svg></span>
        </h2>
      </div>
      <div className="flex gap-3 mb-14">
        <span className="reveal-up text-xs font-semibold uppercase tracking-[0.15em] text-[#888] border border-[#e5e5e5] px-3 py-1 rounded-full" ref={useReveal()}>About Us</span>
        <span className="reveal-up text-xs font-semibold uppercase tracking-[0.15em] text-[#888] border border-[#e5e5e5] px-3 py-1 rounded-full" ref={useReveal()}>The Vision</span>
      </div>
      <div ref={containerRef} className="text-[clamp(1.3rem,3vw,2.2rem)] font-medium leading-[1.55] text-[#0b0b0b] max-w-4xl" style={{ perspective: '600px' }}>
        {text.split(' ').map((word, i) => (
          <span key={i} className="about-word inline-block mr-[0.28em]" style={{
            opacity: 0,
            transform: 'translateY(100px)',
            transition: `all 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.03}s`
          }}>{word}</span>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════ STATS ═══════════════════════ */
function Stats() {
  const c1 = useCounter(25, 2000, '+'); const c2 = useCounter(100, 2000, '%'); const c3 = useCounter(5, 1500, '+'); const c4 = useCounter(10, 1500, 'x')
  const stats = [
    { r: c1, label: 'Projects Shipped', icon: '🚀' },
    { r: c2, label: 'Client Retention', icon: '🤝' },
    { r: c3, label: 'Years Building', icon: '⚡' },
    { r: c4, label: 'Faster Delivery', icon: '🏎️' },
  ]
  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-12 py-12 md:py-16 bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`reveal-up group relative rounded-2xl border border-[#e5e5e5] p-4 md:p-8 hover:border-[#00c853] transition-all duration-500 overflow-hidden`} ref={useReveal()}>
            <div className="absolute top-3 right-3 text-xl md:text-2xl opacity-20 group-hover:opacity-50 transition-opacity">{s.icon}</div>
            <span ref={s.r.ref} className="text-3xl md:text-5xl font-extrabold text-[#0b0b0b] block mb-1 group-hover:text-[#00c853] transition-colors duration-300" style={{ fontFamily: 'Space Grotesk' }}>{s.r.display}</span>
            <span className="text-[10px] md:text-xs font-semibold text-[#888] uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════ WHAT WE BUILD (replaces Building For) ═══════════════════════ */
function WhatWeBuild() {
  const items = [
    { label: 'SaaS Platforms', desc: 'Multi-tenant, scalable', icon: '◆' },
    { label: 'AI Systems', desc: 'LLMs, agents, automation', icon: '◈' },
    { label: 'Web Applications', desc: 'React, Next.js, MERN', icon: '◇' },
    { label: 'Mobile Apps', desc: 'Cross-platform native', icon: '○' },
    { label: 'Data Platforms', desc: 'Visualization & analytics', icon: '△' },
    { label: 'API Systems', desc: 'Microservices & integrations', icon: '□' },
  ]
  return (
    <section className="w-full bg-[#0b0b0b] py-20 md:py-28 px-4 md:px-12 overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="reveal-up mb-10 md:mb-16" ref={useReveal()}>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#00c853] block mb-3">What We Build</span>
          <h2 className="text-[clamp(1.75rem,4.5vw,3.5rem)] font-extrabold text-white tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Everything Ships <span className="italic text-[#00c853]">Production-Grade</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {items.map((item, i) => {
            const ref = useReveal('reveal-scale', 0.1)
            return (
              <div key={i} ref={ref} data-hover className="group relative rounded-2xl border border-[#222] p-5 md:p-8 hover:border-[#00c853] transition-all duration-500 hover:bg-[#111] overflow-hidden">
                <div className="absolute top-4 right-4 text-3xl md:text-4xl text-[#00c853]/10 group-hover:text-[#00c853]/30 transition-all duration-500 group-hover:scale-125">{item.icon}</div>
                <h3 className="text-base md:text-xl font-bold text-white mb-1 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Space Grotesk' }}>{item.label}</h3>
                <p className="text-sm text-[#666] group-hover:text-[#888] transition-colors">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════ TRIPLE MARQUEE ═══════════════════════ */
function TripleMarquee() {
  return (
    <section className="relative w-full py-8 md:py-12 bg-white overflow-hidden -rotate-1">
      <Marquee items={['BUILD THE FUTURE', '✦', 'SHIP FAST', '✦', 'SCALE GLOBALLY']} className="text-[clamp(2rem,5vw,4rem)] font-extrabold text-[#0b0b0b] tracking-tight mb-3" />
      <Marquee items={['PRODUCT ENGINEERING', '✦', 'AI INTEGRATION', '✦', 'WEB PLATFORMS']} reverse className="text-[clamp(2rem,5vw,4rem)] font-extrabold text-[#0b0b0b]/[0.06] tracking-tight mb-3" />
      <Marquee items={['SUPERNETRIX', '≈', 'MASTERS AT WORK', '≈', 'ENGINEER THE OUTCOME']} className="text-[clamp(1rem,2.5vw,1.6rem)] font-bold text-[#00c853]/50 tracking-[0.05em]" speed="marquee-slow" />
    </section>
  )
}

/* ═══════════════════════ PROJECTS ═══════════════════════ */
function Projects() {
  const projects = [
    { name: 'VoiceGuard AI', cat: 'AI / Call Analytics', desc: 'Smart call monitoring platform processing thousands of calls daily, extracting insights that improve sales performance.', color: '#00c853', url: 'https://voiceguardai.co' },
    { name: 'Cesari London', cat: 'Luxury E-Commerce', desc: 'Premium fashion e-commerce engineered for speed and conversion. A full digital storefront built for scale.', color: '#6366f1', url: 'https://cesarilondon.com' },
    { name: 'Future Sportler', cat: 'Sports Platform', desc: 'Connecting athletes, coaches, and clubs. Real-time updates, massive concurrency, clean UX.', color: '#f59e0b', url: 'https://futuresportler.com' },
    { name: 'Digital Twin', cat: 'Enterprise Data Viz', desc: 'Complex datasets turned into actionable visual intelligence for enterprise decision-makers.', color: '#8b5cf6', url: 'https://dtwin.evenbetter.in' },
    { name: 'Graphite', cat: 'B2B Collaboration', desc: 'Real-time sync, role-based access, clean API integrations. Built for teams that move fast.', color: '#ec4899', url: 'https://graphite.io' },
  ]

  return (
    <section id="work" className="max-w-[1600px] mx-auto px-4 md:px-12 py-20 md:py-28 bg-white">
      <div className="flex items-end justify-between mb-10 md:mb-14">
        <div className="reveal-up" ref={useReveal()}>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#888] block mb-3">Our Work</span>
          <h2 className="text-[clamp(1.75rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Featured Projects</h2>
        </div>
      </div>

      {/* Horizontal scroll project cards */}
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 snap-x snap-mandatory -mx-2 px-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {projects.map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noopener" data-hover
            className="tilt-card snap-start flex-shrink-0 w-[280px] sm:w-[340px] md:w-[420px] rounded-3xl border border-[#e5e5e5] overflow-hidden bg-white group hover:border-[#00c853] transition-all duration-500">
            {/* Visual header */}
            <div className="relative h-[180px] sm:h-[220px] md:h-[260px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.color}15, ${p.color}08)` }}>
              {/* Large letter */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[120px] md:text-[160px] font-black leading-none opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-700" style={{ color: p.color, fontFamily: 'Space Grotesk' }}>{p.name.charAt(0)}</span>
              </div>
              {/* Floating badge */}
              <div className="absolute top-5 left-5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md" style={{ background: p.color + '20', color: p.color }}>{p.cat}</div>
              {/* Number */}
              <div className="absolute bottom-5 right-5 text-[80px] font-black leading-none opacity-[0.04]" style={{ fontFamily: 'Space Grotesk' }}>{String(i + 1).padStart(2, '0')}</div>
              {/* Arrow */}
              <div className="absolute bottom-5 left-5 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <svg className="w-4 h-4 text-[#0b0b0b] -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </div>
            {/* Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#0b0b0b] mb-2 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>{p.name}</h3>
              <p className="text-sm text-[#666] leading-relaxed">{p.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="flex items-center gap-2 mt-4 text-xs text-[#ccc]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        <span>Scroll to explore</span>
      </div>
    </section>
  )
}

/* ═══════════════════════ TECH ICONS ═══════════════════════ */
const techIcons: Record<string, JSX.Element> = {
  React: <svg viewBox="0 0 256 228" className="w-full h-full"><circle cx="128" cy="114" r="20" fill="currentColor"/><g fill="none" stroke="currentColor" strokeWidth="8"><ellipse cx="128" cy="114" rx="100" ry="38"/><ellipse cx="128" cy="114" rx="100" ry="38" transform="rotate(60 128 114)"/><ellipse cx="128" cy="114" rx="100" ry="38" transform="rotate(120 128 114)"/></g></svg>,
  'Node.js': <svg viewBox="0 0 256 292" className="w-full h-full"><path d="M128 0L256 73.9v146.2L128 292 0 220.1V73.9z" fill="currentColor" opacity="0.15"/><path d="M128 32l96 55.4v110.8L128 253.6 32 198.2V87.4z" fill="none" stroke="currentColor" strokeWidth="8"/><text x="128" y="160" textAnchor="middle" fill="currentColor" fontSize="80" fontFamily="Space Grotesk" fontWeight="700">N</text></svg>,
  'Next.js': <svg viewBox="0 0 256 256" className="w-full h-full"><circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="8"/><path d="M106 88v80M106 88l80 100" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none"/><circle cx="168" cy="88" r="6" fill="currentColor"/></svg>,
  TypeScript: <svg viewBox="0 0 256 256" className="w-full h-full"><rect x="8" y="8" width="240" height="240" rx="24" fill="currentColor" opacity="0.12"/><rect x="8" y="8" width="240" height="240" rx="24" fill="none" stroke="currentColor" strokeWidth="8"/><text x="128" y="170" textAnchor="middle" fill="currentColor" fontSize="120" fontFamily="Space Grotesk" fontWeight="800">TS</text></svg>,
  AWS: <svg viewBox="0 0 256 256" className="w-full h-full"><path d="M44 160c28 28 72 40 112 28" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none"/><path d="M180 100c-8-36-44-60-80-52s-56 44-48 80" stroke="currentColor" strokeWidth="8" fill="none"/><path d="M160 188l32-12-12-32" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  MongoDB: <svg viewBox="0 0 256 256" className="w-full h-full"><path d="M128 24c-12 40-48 68-48 108 0 44 24 76 48 100 24-24 48-56 48-100 0-40-36-68-48-108z" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="6"/><line x1="128" y1="60" x2="128" y2="220" stroke="currentColor" strokeWidth="4" strokeDasharray="8 6"/></svg>,
  Docker: <svg viewBox="0 0 256 256" className="w-full h-full"><rect x="48" y="100" width="160" height="96" rx="12" fill="none" stroke="currentColor" strokeWidth="7"/>{[0,1,2,3,4].map(i=><rect key={i} x={56+i*30} y={108} width={24} height={20} rx={3} fill="currentColor" opacity={0.2} stroke="currentColor" strokeWidth={2}/>)}{[0,1,2].map(i=><rect key={i+5} x={86+i*30} y={80} width={24} height={20} rx={3} fill="currentColor" opacity={0.15} stroke="currentColor" strokeWidth={2}/>)}<path d="M28 148c-8-4-12-12-8-20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/></svg>,
  PostgreSQL: <svg viewBox="0 0 256 256" className="w-full h-full"><ellipse cx="128" cy="80" rx="72" ry="40" fill="none" stroke="currentColor" strokeWidth="7"/><path d="M56 80v96c0 22 32 40 72 40s72-18 72-40V80" fill="none" stroke="currentColor" strokeWidth="7"/><path d="M56 128c0 22 32 40 72 40s72-18 72-40" fill="none" stroke="currentColor" strokeWidth="5" opacity="0.4"/></svg>,
}

/* ═══════════════════════ TECH STACK ═══════════════════════ */
function TechStack() {
  const [hovered, setHovered] = useState<number | null>(null)
  const techs = [
    { name: 'React', color: '#61dafb', desc: 'UI Library' },
    { name: 'Node.js', color: '#339933', desc: 'Runtime' },
    { name: 'Next.js', color: '#0b0b0b', desc: 'Framework' },
    { name: 'TypeScript', color: '#3178c6', desc: 'Language' },
    { name: 'AWS', color: '#ff9900', desc: 'Cloud Infra' },
    { name: 'MongoDB', color: '#47a248', desc: 'NoSQL DB' },
    { name: 'Docker', color: '#2496ed', desc: 'Containers' },
    { name: 'PostgreSQL', color: '#336791', desc: 'SQL DB' },
  ]

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-12 py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="reveal-up mb-10 md:mb-16" ref={useReveal()}>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#888] block mb-3">Our Stack</span>
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Technology <span className="italic text-[#00c853]">We Work</span> with.
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
        {techs.map((t, i) => {
          const ref = useReveal('reveal-scale', 0.05)
          const isActive = hovered === i
          return (
            <div key={i} ref={ref} data-hover
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              className="group relative rounded-2xl md:rounded-3xl border border-[#e5e5e5] bg-white p-5 md:p-8 flex flex-col items-center text-center transition-all duration-500 hover:border-transparent hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden">

              {/* Colored glow background on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 40%, ${t.color}15, transparent 70%)` }} />

              {/* Floating ring decoration */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border opacity-0 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110" style={{ borderColor: t.color }} />

              {/* Icon */}
              <div className={`relative z-10 w-14 h-14 md:w-20 md:h-20 mb-4 md:mb-5 transition-all duration-500 ${isActive ? 'scale-110' : ''}`} style={{ color: t.color }}>
                {techIcons[t.name]}
              </div>

              {/* Name */}
              <h3 className="relative z-10 text-base md:text-lg font-bold text-[#0b0b0b] mb-1 transition-colors duration-300 group-hover:text-[#0b0b0b]" style={{ fontFamily: 'Space Grotesk' }}>{t.name}</h3>

              {/* Desc - slides up on hover */}
              <span className="relative z-10 text-[11px] md:text-xs font-semibold uppercase tracking-widest transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" style={{ color: t.color }}>{t.desc}</span>

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-0 group-hover:w-2/3 transition-all duration-500 rounded-full" style={{ background: t.color }} />
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ═══════════════════════ MILESTONES (sujalbuild.in Awards style) ═══════════════════════ */
function Milestones() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const items = [
    { year: '2026', title: 'Scaling to 25+ Active Clients', desc: 'Expanding the team and infrastructure to handle enterprise-grade concurrent partnerships. Building dedicated squads for each vertical.' },
    { year: '2025', title: 'VoiceGuard AI — Built & Scaled', desc: 'AI call analytics platform processing thousands of calls daily, extracting insights that improve sales performance. From zero to production in 8 weeks.' },
    { year: '2025', title: '100% Client Retention Rate', desc: 'Every single client chose to continue working with us. That\'s the Masters at Work difference. We don\'t just deliver projects, we deliver outcomes.' },
    { year: '2024', title: 'SuperNetrix Founded', desc: 'Launched with a mission: engineer the outcome, not just the feature. Started with 3 founding engineers and a vision to build differently.' },
  ]
  return (
    <section className="w-full bg-[#0b0b0b] py-20 md:py-28 px-4 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Two-column: heading left, items right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24">
          {/* Left - heading */}
          <div className="reveal-up" ref={useReveal()}>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold text-white tracking-tight leading-[1.1]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              TRACK RECORD
            </h2>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight leading-[1.1] mt-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              <span className="text-[#00c853]">& MILESTONES</span>
            </h2>
          </div>

          {/* Right - expandable items */}
          <div>
            {items.map((item, i) => {
              const ref = useReveal('reveal-up', 0.1)
              const isOpen = openIdx === i
              return (
                <div key={i} ref={ref} className="border-b border-[#222] group" data-hover>
                  <button onClick={() => setOpenIdx(isOpen ? null : i)} className="w-full flex items-start gap-3 md:gap-6 py-5 md:py-6 text-left">
                    <span className="text-sm font-bold text-[#555] shrink-0 pt-1 w-10 md:w-12" style={{ fontFamily: 'Space Grotesk' }}>{item.year}</span>
                    <div className="flex-1">
                      <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 ${isOpen ? 'text-[#00c853]' : 'text-white group-hover:text-[#00c853]'}`} style={{ fontFamily: 'Plus Jakarta Sans' }}>{item.title}</h3>
                    </div>
                    <span className={`text-[#00c853] text-xl shrink-0 transition-all duration-300 ${isOpen ? 'rotate-45 scale-110' : ''}`}>+</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-40 pb-6' : 'max-h-0'}`}>
                    <p className="text-[#888] text-sm leading-relaxed pl-[52px] md:pl-[72px] pr-4 md:pr-8">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════ SERVICES (12-col bento grid - sujalbuild.in exact) ═══════════════════════ */
function Services() {
  return (
    <section id="services" className="max-w-[1600px] mx-auto px-4 md:px-12 py-20 md:py-28 bg-white">
      <div className="reveal-up mb-10 md:mb-16" ref={useReveal()}>
        <h2 className="text-[clamp(1.75rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          OUR <span className="italic text-[#00c853]">services</span>
        </h2>
      </div>

      {/* 12-column bento grid matching sujalbuild.in exactly */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6" style={{ gridAutoRows: 'minmax(0, auto)' }}>

        {/* Card 1: Mobile Apps - span 5, green bg, tall */}
        <div data-hover className="bento-card md:col-span-5 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#00c853] p-6 md:p-10 flex flex-col justify-between group reveal-scale min-h-[320px] md:min-h-[480px]" ref={useReveal('reveal-scale', 0.05)}>
          <div>
            <div className="flex items-center gap-2 mb-auto">
              <svg className="w-6 h-6 text-[#0b0b0b]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              <span className="text-sm font-semibold text-[#0b0b0b]/60">High Performance</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-extrabold text-[#0b0b0b] leading-[1.05] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>Mobile<br/>Apps</h3>
            <p className="text-[#0b0b0b]/70 text-sm mb-4 md:mb-6">iOS & Android Solutions</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold px-4 py-2 rounded-full bg-[#0b0b0b]/10 text-[#0b0b0b]">Flutter</span>
              <span className="text-xs font-semibold px-4 py-2 rounded-full bg-[#0b0b0b]/10 text-[#0b0b0b]">Cross-platform Mastery</span>
            </div>
          </div>
        </div>

        {/* Card 2: SaaS + Web Apps stacked - span 3 */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
          <div data-hover className="bento-card flex-1 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border border-[#e5e5e5] p-5 md:p-7 flex flex-col justify-between group reveal-scale" ref={useReveal('reveal-scale', 0.05)}>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[#0b0b0b] mb-2 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>SaaS</h3>
              <p className="text-sm text-[#666]">Scalable Platforms</p>
            </div>
            <svg className="w-5 h-5 text-[#ccc] group-hover:text-[#00c853] transition-colors mt-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </div>
          <div data-hover className="bento-card flex-1 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border border-[#e5e5e5] p-5 md:p-7 flex flex-col justify-between group reveal-scale" ref={useReveal('reveal-scale', 0.05)}>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[#0b0b0b] mb-2 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>Web Apps</h3>
              <p className="text-sm text-[#666]">Modern & Responsive</p>
            </div>
            <svg className="w-5 h-5 text-[#ccc] group-hover:text-[#00c853] transition-colors mt-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </div>
        </div>

        {/* Card 3: AI Agents - span 4, blue/dark bg, tall */}
        <div data-hover className="bento-card md:col-span-4 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#1e4bff] p-6 md:p-10 flex flex-col justify-between group reveal-scale min-h-[320px] md:min-h-[480px]" ref={useReveal('reveal-scale', 0.05)}>
          <div>
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest block mb-4 md:mb-6">#GenerativeAI</span>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white leading-[1.05] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>AI<br/>Agents</h3>
            <p className="text-white/60 text-sm mb-4 md:mb-6">Automate. Optimize. Evolve.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Chatbots', 'Custom LLMs', 'Automation', 'Workflows', 'Predictive', 'Analytics'].map((tag, j) => (
              <span key={j} className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/20 text-white/70">{tag}</span>
            ))}
          </div>
        </div>

        {/* Row 2: UI/UX Design - span 6, dark bg */}
        <div data-hover className="bento-card md:col-span-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#0b0b0b] p-6 md:p-10 flex flex-col justify-between group reveal-scale min-h-[200px] md:min-h-[260px]" ref={useReveal('reveal-scale', 0.05)}>
          <div>
            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>UI/UX Design</h3>
            <p className="text-[#888] text-sm">Award-winning interfaces</p>
          </div>
          <p className="text-[#666] text-sm leading-relaxed mt-4 max-w-md">User-centric design that drives engagement and conversion. We build experiences, not just screens.</p>
        </div>

        {/* Product Strategy - span 6, dark bg */}
        <div data-hover className="bento-card md:col-span-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#0b0b0b] p-6 md:p-10 flex flex-col justify-between group reveal-scale min-h-[200px] md:min-h-[260px]" ref={useReveal('reveal-scale', 0.05)}>
          <div>
            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>Product Strategy</h3>
            <p className="text-[#888] text-sm">From MVP to Scale</p>
          </div>
          <p className="text-[#666] text-sm leading-relaxed mt-4 max-w-md">Roadmapping, feasibility analysis, and growth hacking for your digital product.</p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════ PROCESS ═══════════════════════ */
function Process() {
  const steps = [
    { n: '01', t: 'Discovery', d: 'Understand the business bottleneck and the metric to be moved.' },
    { n: '02', t: 'Architecture', d: 'Design the fastest, most scalable path to the outcome.' },
    { n: '03', t: 'Build', d: 'Rapid, production-grade execution. No shortcuts.' },
    { n: '04', t: 'Deploy', d: 'Seamless rollouts with monitoring and stress-testing.' },
    { n: '05', t: 'Scale', d: 'Continuous optimization. We help you grow post-launch.' },
  ]
  return (
    <section id="process" className="max-w-[1600px] mx-auto px-4 md:px-12 py-16 md:py-24 bg-white border-t border-[#e5e5e5]">
      <div className="reveal-up mb-10 md:mb-14" ref={useReveal()}>
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Our <span className="italic text-[#00c853]">Process</span></h2>
      </div>

      {/* Horizontal steps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        {steps.map((s, i) => {
          const ref = useReveal('reveal-up', 0.1)
          return (
            <div key={i} ref={ref} data-hover className="group relative p-6 rounded-2xl border border-[#e5e5e5] hover:border-[#00c853] transition-all duration-500 hover:bg-[#fafafa] text-center md:text-left">
              {/* Step number */}
              <div className="w-10 h-10 rounded-full border-2 border-[#e5e5e5] group-hover:border-[#00c853] group-hover:bg-[#00c853] flex items-center justify-center mb-4 mx-auto md:mx-0 transition-all duration-500">
                <span className="text-xs font-bold text-[#888] group-hover:text-white transition-colors">{s.n}</span>
              </div>
              <h3 className="text-lg font-bold text-[#0b0b0b] mb-2 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>{s.t}</h3>
              <p className="text-sm text-[#888] leading-relaxed">{s.d}</p>
              {/* Connector arrow (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#ddd] group-hover:text-[#00c853] transition-colors z-10">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ═══════════════════════ TESTIMONIALS (Scrolling) ═══════════════════════ */
function Testimonials() {
  const items = [
    { quote: "SuperNetrix didn't just build our platform — they understood our business and engineered a system that directly impacted revenue. Unreal speed.", name: 'Cesari London', role: 'Luxury Fashion' },
    { quote: "They think like co-founders, not contractors. Every decision tied to a business outcome. Moved faster than our internal team ever could.", name: 'Future Sportler', role: 'Sports Platform' },
    { quote: "We needed an AI system handling thousands of calls. SuperNetrix architected VoiceGuard from scratch — and it just works. Flawlessly.", name: 'VoiceGuard AI', role: 'AI Analytics' },
    { quote: "SuperNetrix challenges the myth that speed kills quality. Right architecture + speed = the ultimate advantage. They proved it.", name: 'Digital Twin', role: 'Enterprise Data' },
    { quote: "From messy codebase to clean, scalable architecture in one sprint. Our AWS bill dropped 50%. That's engineering, not just coding.", name: 'Graphite', role: 'B2B Collaboration' },
  ]

  return (
    <section className="w-full py-16 md:py-24 bg-[#fafafa] border-y border-[#e5e5e5] overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 mb-8 md:mb-12">
        <div className="reveal-up" ref={useReveal()}>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Trusted by <span className="italic text-[#00c853]">Clients</span>
          </h2>
          <p className="text-[#888] text-sm mt-2">Real feedback from real partnerships</p>
        </div>
      </div>

      {/* Auto-scrolling testimonial strip */}
      <div className="overflow-hidden">
        <div className="testimonial-scroll inline-flex gap-5 px-6">
          {[...items, ...items].map((t, i) => (
            <div key={i} data-hover className="flex-shrink-0 w-[280px] sm:w-[380px] md:w-[440px] rounded-2xl border border-[#e5e5e5] bg-white p-5 md:p-7 hover:border-[#00c853] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <span key={j} className="text-[#00c853] text-sm">★</span>)}
              </div>
              <p className="text-[#333] text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3 border-t border-[#f0f0f0] pt-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00c853, #00e676)' }}>{t.name.charAt(0)}</div>
                <div>
                  <span className="text-sm font-bold text-[#0b0b0b] block leading-tight">{t.name}</span>
                  <span className="text-xs text-[#888]">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════ FAQ ═══════════════════════ */
function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  const faqs = [
    { q: 'What is your typical project timeline?', a: 'Most high-impact applications ship within 4-8 weeks. Timeline varies by scope and complexity.' },
    { q: 'Do you provide post-launch support?', a: 'Yes. Structured monthly partnerships for continuous development, monitoring, optimization, and feature iteration.' },
    { q: 'What is your pricing model?', a: 'Project-based for defined scopes. Monthly retainers for ongoing work. Transparent from day one.' },
    { q: 'What tech stack do you specialize in?', a: 'MERN stack with AWS. Also: Redis, Kafka, Docker, Kubernetes, PostgreSQL, TypeScript. Stack-agnostic when needed.' },
  ]
  return (
    <section id="faq" className="w-full bg-[#000] py-20 md:py-28 px-4 md:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="reveal-up mb-12" ref={useReveal()}>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>FAQs</h2>
          <p className="text-[#888] text-lg">Everything you need to <span className="text-[#00c853] font-semibold">know</span></p>
        </div>
        {faqs.map((f, i) => (
          <div key={i} className="border-b border-[#222]">
            <button onClick={() => setOpen(open === i ? null : i)} data-hover className="w-full flex items-center justify-between py-6 text-left group">
              <h3 className="text-base md:text-lg font-semibold text-white pr-8 group-hover:text-[#00c853] transition-colors duration-300">{f.q}</h3>
              <span className={`text-[#00c853] transition-all duration-300 text-xl shrink-0 ${open === i ? 'rotate-45 scale-110' : ''}`}>+</span>
            </button>
            <div className={`faq-answer ${open === i ? 'open' : ''}`}>
              <p className="text-[#888] text-sm leading-relaxed pb-6 pr-12">{f.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════ CTA ═══════════════════════ */
function CTA() {
  return (
    <section id="contact" className="w-full bg-white py-20 md:py-32 px-4 md:px-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-[300px] h-[300px] rounded-full bg-[#00c853]/[0.04] blur-[80px] blob pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] rounded-full bg-[#00c853]/[0.06] blur-[80px] blob-2 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="reveal-up" ref={useReveal()}>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#888] mb-4 block">Let's Collaborate</span>
          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold tracking-tight text-[#0b0b0b] leading-[1.05] mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Ready to <span className="text-[#00c853]">Scale</span><br />Your Business?
          </h2>
          <p className="text-[#666] text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-10">
            Whether you need a web app, mobile solution, or AI integration — our team is ready to engineer your next outcome.
          </p>
        </div>
        <div className="reveal-up flex flex-col sm:flex-row gap-4 justify-center items-center" ref={useReveal()}>
          <a href="#" data-hover className="group inline-flex items-center gap-2 bg-[#0b0b0b] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#00c853] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,200,83,0.3)]">
            Start A Project
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
          <a href="#services" data-hover className="inline-flex items-center gap-2 text-sm font-semibold border border-[#0b0b0b] text-[#0b0b0b] px-6 py-3.5 rounded-full hover:bg-[#0b0b0b] hover:text-white transition-all duration-300">View Services</a>
        </div>
      </div>

      {/* Rotating SVG text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[40%] w-[300px] h-[300px] md:w-[700px] md:h-[700px] pointer-events-none">
        <svg viewBox="0 0 500 500" className="w-full h-full spin-slow opacity-[0.06]">
          <defs><path id="curve" d="M 250,250 m -200,0 a 200,200 0 1,1 400,0 a 200,200 0 1,1 -400,0" fill="none" /></defs>
          <text className="text-[16px] uppercase tracking-[0.3em] fill-[#0b0b0b]" style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>
            <textPath href="#curve">DESIGN ✦ DEVELOP ✦ DEPLOY ✦ SCALE ✦ DESIGN ✦ DEVELOP ✦ DEPLOY ✦ SCALE ✦&nbsp;</textPath>
          </text>
        </svg>
      </div>
    </section>
  )
}

/* ═══════════════════════ FOOTER (sujalbuild.in style) ═══════════════════════ */
function Footer() {
  const socials = [
    { href: 'https://www.linkedin.com/company/supernetrix', label: 'Li', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { href: 'https://www.instagram.com/supernetrix', label: 'Ig', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    { href: 'https://x.com/supernetrix', label: 'X', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  ]

  return (
    <footer className="w-full bg-[#0b0b0b] pt-16 md:pt-20 pb-8 px-4 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          {/* Col 1: Contacts */}
          <div className="lg:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#555] mb-4 block">Contacts</span>
            <a href="mailto:hello@supernetrix.com" data-hover className="text-white text-lg font-semibold hover:text-[#00c853] transition-colors block mb-8">hello@supernetrix.com</a>

            <span className="text-xs text-[#555] block mb-2">Designed & Developed By</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>SuperNetrix</h3>
            <p className="text-[#666] text-sm leading-relaxed max-w-xs">Strategic Technology Partner crafting high-impact digital experiences for startups and enterprises.</p>
            <p className="text-[#555] text-xs mt-3">Based globally. Building remotely.</p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#555] mb-4 block">Quick Links</span>
            <nav className="flex flex-col gap-3">
              {[['Home', '#'], ['About', '#about'], ['Services', '#services'], ['Case Studies', '#work'], ['Contact', '#contact']].map(([label, href]) => (
                <a key={label} href={href} data-hover className="footer-link text-sm text-[#888] inline-block w-fit">{label}</a>
              ))}
            </nav>
          </div>

          {/* Col 3: Legal */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#555] mb-4 block">Legal</span>
            <nav className="flex flex-col gap-3">
              {['Privacy Policy', 'Terms & Conditions', 'Code of Conduct'].map(label => (
                <a key={label} href="#" data-hover className="footer-link text-sm text-[#888] inline-block w-fit">{label}</a>
              ))}
            </nav>
          </div>

          {/* Col 4: General Inquiries */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#555] mb-4 block">General Inquiries</span>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-[#555] block mb-1">SuperNetrix Team</span>
                <a href="mailto:hello@supernetrix.com" data-hover className="footer-link text-sm text-[#888] inline-block w-fit">hello@supernetrix.com</a>
              </div>
            </div>
          </div>

          {/* Col 5: Project Strategy */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#555] mb-4 block">Project Strategy</span>
            <div className="space-y-3">
              <span className="text-sm text-[#888] block">Consultancy</span>
              <a href="mailto:projects@supernetrix.com" data-hover className="footer-link text-sm text-[#888] inline-block w-fit">projects@supernetrix.com</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#555]">&copy; 2026 SuperNetrix. All Rights Reserved.</p>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {socials.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener" data-hover
                className="w-9 h-9 rounded-full border border-[#222] flex items-center justify-center text-[#666] hover:text-white hover:border-[#00c853] hover:bg-[#00c853]/10 transition-all duration-300">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ═══════════════════════ APP ═══════════════════════ */
function App() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <CustomCursor />
      <Navbar />
      <Hero />
      <ClientMarquee />
      <About />
      <Stats />
      <WhatWeBuild />
      <TripleMarquee />
      <Projects />
      <TechStack />
      <Milestones />
      <Services />
      <Process />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}

export default App
