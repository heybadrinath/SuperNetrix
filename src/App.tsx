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
    const words = container.querySelectorAll('.about-word-blur')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          el.style.opacity = '1'
          el.style.filter = 'blur(0px)'
          el.style.transform = 'translateY(0)'
          obs.unobserve(el)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    words.forEach(w => obs.observe(w))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="about" className="max-w-[1600px] mx-auto px-4 md:px-12 py-16 md:py-28 bg-white">
      <div className="reveal-up" ref={useReveal()}>
        <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold tracking-tight leading-[1.05] text-[#0b0b0b] mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          MORE THAN <span className="italic text-[#00c853] relative">code<svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 100 6" fill="none"><path d="M0 5C25 1 75 1 100 5" stroke="#00c853" strokeWidth="2" strokeLinecap="round"/></svg></span>
        </h2>
      </div>
      <div className="flex gap-3 mb-14">
        <span className="reveal-up text-xs font-semibold uppercase tracking-[0.15em] text-[#888] border border-[#e5e5e5] px-3 py-1 rounded-full" ref={useReveal()}>About Us</span>
        <span className="reveal-up text-xs font-semibold uppercase tracking-[0.15em] text-[#888] border border-[#e5e5e5] px-3 py-1 rounded-full" ref={useReveal()}>The Vision</span>
      </div>
      <div ref={containerRef} className="text-[clamp(1.3rem,3vw,2.2rem)] font-medium leading-[1.55] text-[#0b0b0b] max-w-4xl">
        {text.split(' ').map((word, i) => (
          <span key={i} className="about-word-blur" style={{
            transitionDelay: `${i * 0.03}s`
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
    { label: 'SaaS Platforms', desc: 'Multi-tenant, scalable', icon: '◆', num: '01' },
    { label: 'AI Systems', desc: 'LLMs, agents, automation', icon: '◈', num: '02' },
    { label: 'Web Applications', desc: 'React, Next.js, MERN', icon: '◇', num: '03' },
    { label: 'Mobile Apps', desc: 'Cross-platform native', icon: '○', num: '04' },
    { label: 'Data Platforms', desc: 'Visualization & analytics', icon: '△', num: '05' },
    { label: 'API Systems', desc: 'Microservices & integrations', icon: '□', num: '06' },
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
              <div key={i} ref={ref} data-hover className="shimmer-hover group relative rounded-2xl border border-[#222] p-5 md:p-8 hover:border-[#00c853] transition-all duration-500 hover:bg-[#111] overflow-hidden">
                {/* Number watermark */}
                <span className="absolute bottom-3 right-4 text-[60px] md:text-[80px] font-black leading-none text-white/[0.03] group-hover:text-[#00c853]/[0.08] transition-all duration-700 select-none pointer-events-none" style={{ fontFamily: 'Space Grotesk' }}>{item.num}</span>
                {/* Icon with glow */}
                <div className="text-4xl md:text-5xl text-[#00c853]/20 group-hover:text-[#00c853]/50 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,200,83,0.3)] mb-3">{item.icon}</div>
                <h3 className="text-base md:text-xl font-bold text-white mb-1 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Space Grotesk' }}>{item.label}</h3>
                <p className="text-sm text-[#666] group-hover:text-[#888] transition-colors">{item.desc}</p>
                {/* Explore arrow */}
                <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#00c853] opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-500">
                  Explore <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#00c853] w-0 group-hover:w-2/3 transition-all duration-500 rounded-full" />
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
    <section className="relative w-full py-8 md:py-12 bg-white overflow-hidden -rotate-[2.5deg] scale-x-[1.1]">
      <Marquee items={['BUILD THE FUTURE', '✦', 'SHIP FAST', '✦', 'SCALE GLOBALLY']} className="text-[clamp(2rem,5vw,4rem)] font-extrabold text-[#0b0b0b] tracking-tight mb-3" />
      <Marquee items={['PRODUCT ENGINEERING', '✦', 'AI INTEGRATION', '✦', 'WEB PLATFORMS']} reverse className="text-[clamp(2rem,5vw,4rem)] font-extrabold text-[#0b0b0b]/[0.06] tracking-tight mb-3" />
      <Marquee items={['SUPERNETRIX', '≈', 'MASTERS AT WORK', '≈', 'ENGINEER THE OUTCOME']} className="text-[clamp(1rem,2.5vw,1.6rem)] font-bold text-[#00c853]/50 tracking-[0.05em]" speed="marquee-slow" />
    </section>
  )
}

/* ═══════════════════════ PROJECTS ═══════════════════════ */
function Projects() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [modalProject, setModalProject] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const projects = [
    { name: 'VoiceGuard AI', cat: 'AI / Call Analytics', desc: 'Smart call monitoring platform processing thousands of calls daily, extracting insights that improve sales performance. From zero to production in 8 weeks.', color: '#00c853', url: 'https://voiceguardai.co' },
    { name: 'Cesari London', cat: 'Luxury E-Commerce', desc: 'Premium fashion e-commerce engineered for speed and conversion. A full digital storefront built for scale with immersive product experiences.', color: '#6366f1', url: 'https://cesarilondon.com' },
    { name: 'Future Sportler', cat: 'Sports Platform', desc: 'Connecting athletes, coaches, and clubs. Real-time updates, massive concurrency, clean UX. Built to handle peak traffic.', color: '#f59e0b', url: 'https://futuresportler.com' },
    { name: 'Digital Twin', cat: 'Enterprise Data Viz', desc: 'Complex datasets turned into actionable visual intelligence for enterprise decision-makers. Real-time dashboards at scale.', color: '#8b5cf6', url: 'https://dtwin.evenbetter.in' },
    { name: 'Graphite', cat: 'B2B Collaboration', desc: 'Real-time sync, role-based access, clean API integrations. Built for teams that move fast. Reduced dev time by 60%.', color: '#ec4899', url: 'https://graphite.io' },
  ]

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.children[idx] as HTMLElement
    if (card) {
      el.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' })
      setActiveIdx(idx)
    }
  }, [])

  // Modal: lock body scroll + ESC to close
  useEffect(() => {
    if (modalProject !== null) {
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalProject(null) }
      window.addEventListener('keydown', onKey)
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
    } else {
      document.body.style.overflow = ''
    }
  }, [modalProject])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const scrollLeft = el.scrollLeft
      const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth || 300
      setActiveIdx(Math.round(scrollLeft / (cardWidth + 20)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="work" className="max-w-[1600px] mx-auto px-4 md:px-12 py-16 md:py-20 bg-white">
      {/* Header with pagination */}
      <div className="flex items-end justify-between mb-10 md:mb-14">
        <div className="reveal-up" ref={useReveal()}>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#888] block mb-3">Our Work</span>
          <h2 className="text-[clamp(1.75rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Featured Projects</h2>
        </div>
        <div className="reveal-up flex items-center gap-4" ref={useReveal()}>
          <span className="text-sm font-bold text-[#0b0b0b]" style={{ fontFamily: 'Space Grotesk' }}>{activeIdx + 1}/{projects.length}</span>
          <div className="flex gap-2">
            <button onClick={() => scrollTo(Math.max(0, activeIdx - 1))} data-hover className="w-10 h-10 rounded-full border border-[#e5e5e5] flex items-center justify-center hover:border-[#0b0b0b] transition-colors">
              <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scrollTo(Math.min(projects.length - 1, activeIdx + 1))} data-hover className="w-10 h-10 rounded-full border border-[#e5e5e5] flex items-center justify-center hover:border-[#0b0b0b] transition-colors">
              <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Project cards — horizontal scroll */}
      <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {projects.map((p, i) => (
          <div key={i} onClick={() => setModalProject(i)} data-hover
            className="snap-start flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[540px] lg:w-[600px] rounded-2xl md:rounded-3xl border border-[#e5e5e5] overflow-hidden bg-white group hover:border-[#00c853]/50 transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.08)] cursor-pointer">
            {/* Visual header */}
            <div className="relative h-[200px] sm:h-[260px] md:h-[320px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.color}12, ${p.color}05)` }}>
              {/* Large letter watermark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[140px] sm:text-[180px] md:text-[220px] font-black leading-none opacity-[0.06] group-hover:opacity-[0.12] group-hover:scale-105 transition-all duration-700 select-none" style={{ color: p.color, fontFamily: 'Space Grotesk' }}>{p.name.charAt(0)}</span>
              </div>
              {/* Category badge */}
              <div className="absolute top-5 left-5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md" style={{ background: p.color + '18', color: p.color }}>{p.cat}</div>
              {/* Number */}
              <div className="absolute bottom-4 right-5 text-[70px] md:text-[90px] font-black leading-none opacity-[0.04] select-none" style={{ fontFamily: 'Space Grotesk' }}>{String(i + 1).padStart(2, '0')}</div>
              {/* Arrow on hover */}
              <div className="absolute bottom-5 left-5 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg">
                <svg className="w-4 h-4 text-[#0b0b0b] -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </div>
            {/* Info */}
            <div className="p-5 md:p-7">
              <h3 className="text-xl md:text-2xl font-bold text-[#0b0b0b] mb-2 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>{p.name}</h3>
              <p className="text-sm text-[#666] leading-relaxed line-clamp-2">{p.desc}</p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-[#888] group-hover:text-[#00c853] transition-colors">
                View details
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {projects.map((_, i) => (
          <button key={i} onClick={() => scrollTo(i)} className={`h-1.5 rounded-full transition-all duration-300 ${activeIdx === i ? 'w-8 bg-[#00c853]' : 'w-1.5 bg-[#ddd]'}`} />
        ))}
      </div>

      {/* Project Modal */}
      {modalProject !== null && (() => {
        const p = projects[modalProject]
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setModalProject(null)}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            {/* Modal card */}
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Visual header */}
              <div className="relative h-[200px] md:h-[260px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.color}20, ${p.color}08)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[160px] md:text-[200px] font-black leading-none opacity-[0.08] select-none" style={{ color: p.color, fontFamily: 'Space Grotesk' }}>{p.name.charAt(0)}</span>
                </div>
                <div className="absolute top-5 left-5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md" style={{ background: p.color + '18', color: p.color }}>{p.cat}</div>
                {/* Close button */}
                <button onClick={() => setModalProject(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                  <svg className="w-5 h-5 text-[#0b0b0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Content */}
              <div className="p-6 md:p-10">
                <h3 className="text-2xl md:text-3xl font-bold text-[#0b0b0b] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>{p.name}</h3>
                <p className="text-[#666] text-sm md:text-base leading-relaxed mb-8">{p.desc}</p>
                <a href={p.url} target="_blank" rel="noopener" data-hover className="inline-flex items-center gap-3 bg-[#0b0b0b] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#00c853] transition-all duration-300 text-sm">
                  Visit Website
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </div>
        )
      })()}
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
  Redis: <svg viewBox="0 0 256 256" className="w-full h-full"><path d="M128 40l88 44v84l-88 44-88-44V84z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="6"/><circle cx="128" cy="128" r="28" fill="none" stroke="currentColor" strokeWidth="6"/><path d="M128 100v-30M128 156v30M100 128h-30M156 128h30" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg>,
  Python: <svg viewBox="0 0 256 256" className="w-full h-full"><path d="M126 8C80 8 56 30 56 60v28h72v8H44c-24 0-44 20-44 56s16 56 40 56h24v-32c0-24 16-44 40-44h72c20 0 36-16 36-36V60c0-28-26-52-86-52zm-40 28a12 12 0 110 24 12 12 0 010-24z" fill="currentColor" opacity="0.7"/><path d="M130 248c46 0 70-22 70-52v-28h-72v-8h84c24 0 44-20 44-56s-16-56-40-56h-24v32c0 24-16 44-40 44H80c-20 0-36 16-36 36v36c0 28 26 52 86 52zm40-28a12 12 0 110-24 12 12 0 010 24z" fill="currentColor" opacity="0.4"/></svg>,
  Kubernetes: <svg viewBox="0 0 256 256" className="w-full h-full"><circle cx="128" cy="128" r="100" fill="none" stroke="currentColor" strokeWidth="6"/><path d="M128 28v200M28 128h200M52 52l152 152M204 52L52 204" stroke="currentColor" strokeWidth="3" opacity="0.2"/><circle cx="128" cy="128" r="36" fill="none" stroke="currentColor" strokeWidth="6"/><circle cx="128" cy="128" r="8" fill="currentColor"/></svg>,
  GraphQL: <svg viewBox="0 0 256 256" className="w-full h-full"><polygon points="128,32 220,84 220,172 128,224 36,172 36,84" fill="none" stroke="currentColor" strokeWidth="6"/><circle cx="128" cy="32" r="12" fill="currentColor"/><circle cx="220" cy="84" r="12" fill="currentColor"/><circle cx="220" cy="172" r="12" fill="currentColor"/><circle cx="128" cy="224" r="12" fill="currentColor"/><circle cx="36" cy="172" r="12" fill="currentColor"/><circle cx="36" cy="84" r="12" fill="currentColor"/></svg>,
}

/* ═══════════════════════ TECH STACK ═══════════════════════ */
function TechStack() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const techs = [
    { name: 'React', color: '#61dafb', desc: 'UI Library', tag: 'Frontend' },
    { name: 'Node.js', color: '#339933', desc: 'Runtime', tag: 'Backend' },
    { name: 'Next.js', color: '#0b0b0b', desc: 'Framework', tag: 'Full-Stack' },
    { name: 'TypeScript', color: '#3178c6', desc: 'Language', tag: 'Type-Safe' },
    { name: 'AWS', color: '#ff9900', desc: 'Cloud Infra', tag: 'Cloud' },
    { name: 'MongoDB', color: '#47a248', desc: 'NoSQL DB', tag: 'Database' },
    { name: 'Docker', color: '#2496ed', desc: 'Containers', tag: 'DevOps' },
    { name: 'PostgreSQL', color: '#336791', desc: 'SQL DB', tag: 'Database' },
    { name: 'Redis', color: '#dc382d', desc: 'In-Memory', tag: 'Caching' },
    { name: 'Python', color: '#3776ab', desc: 'Language', tag: 'Backend' },
    { name: 'Kubernetes', color: '#326ce5', desc: 'Orchestration', tag: 'DevOps' },
    { name: 'GraphQL', color: '#e10098', desc: 'Query Lang', tag: 'API' },
  ]

  const techBgs: Record<string, string> = {
    React: 'repeating-linear-gradient(135deg, transparent 0px, transparent 8px, rgba(97,218,251,0.04) 8px, rgba(97,218,251,0.04) 16px)',
    'Node.js': 'radial-gradient(circle at 30% 70%, rgba(51,153,51,0.08) 0%, transparent 60%)',
    'Next.js': 'repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(11,11,11,0.03) 12px, rgba(11,11,11,0.03) 24px)',
    TypeScript: 'linear-gradient(135deg, rgba(49,120,198,0.06) 0%, transparent 50%, rgba(49,120,198,0.04) 100%)',
    AWS: 'radial-gradient(ellipse at 70% 30%, rgba(255,153,0,0.08) 0%, transparent 60%)',
    MongoDB: 'repeating-conic-gradient(rgba(71,162,72,0.04) 0deg, transparent 30deg, transparent 60deg)',
    Docker: 'repeating-linear-gradient(0deg, transparent 0px, transparent 10px, rgba(36,150,237,0.03) 10px, rgba(36,150,237,0.03) 20px)',
    PostgreSQL: 'radial-gradient(circle at 50% 50%, rgba(51,103,145,0.08) 0%, transparent 70%)',
    Redis: 'linear-gradient(45deg, rgba(220,56,45,0.05) 25%, transparent 25%, transparent 75%, rgba(220,56,45,0.05) 75%)',
    Python: 'repeating-linear-gradient(45deg, rgba(55,118,171,0.04) 0px, rgba(55,118,171,0.04) 6px, transparent 6px, transparent 12px)',
    Kubernetes: 'radial-gradient(circle at 50% 50%, rgba(50,108,229,0.06) 20%, transparent 60%)',
    GraphQL: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 8px, rgba(225,0,152,0.04) 8px, rgba(225,0,152,0.04) 16px)',
  }

  // Auto-rotate highlight every 2s
  useEffect(() => {
    if (hovered !== null) return
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % techs.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [hovered, techs.length])

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-12 py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="reveal-up mb-10 md:mb-16" ref={useReveal()}>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#888] block mb-3">Our Stack</span>
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Technology <span className="italic text-[#00c853]">We Work</span> with.
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 md:gap-5">
        {techs.map((t, i) => {
          const ref = useReveal('reveal-scale', 0.05)
          const isHovered = hovered === i
          const isAutoActive = hovered === null && activeIdx === i
          return (
            <div key={i} ref={ref} data-hover
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              className={`group relative rounded-xl md:rounded-2xl border bg-white p-3 md:p-6 flex flex-col items-center text-center transition-all duration-500 overflow-hidden ${isAutoActive ? 'border-[#00c853] shadow-[0_0_20px_2px_rgba(0,200,83,0.12)]' : 'border-[#e5e5e5]'} hover:border-transparent hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]`}>

              {/* Colored glow background on hover */}
              <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${isHovered || isAutoActive ? 'opacity-100' : 'opacity-0'}`} style={{ background: `radial-gradient(circle at 50% 40%, ${t.color}15, transparent 70%)` }} />
              {/* Unique decorative pattern on hover */}
              <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${isHovered || isAutoActive ? 'opacity-100' : 'opacity-0'}`} style={{ background: techBgs[t.name] || 'none' }} />

              {/* Icon */}
              <div className={`relative z-10 w-10 h-10 md:w-16 md:h-16 mb-2 md:mb-4 transition-all duration-500 ${isHovered || isAutoActive ? 'scale-110' : ''}`} style={{ color: t.color }}>
                {techIcons[t.name]}
              </div>

              {/* Name */}
              <h3 className="relative z-10 text-xs md:text-base font-bold text-[#0b0b0b] mb-0.5 transition-colors duration-300" style={{ fontFamily: 'Space Grotesk' }}>{t.name}</h3>

              {/* Tag */}
              <span className="relative z-10 text-[9px] md:text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">{t.tag}</span>

              {/* Desc - visible on hover/active */}
              <span className={`relative z-10 text-[9px] md:text-[11px] font-semibold uppercase tracking-widest mt-1 transition-all duration-500 ${isHovered || isAutoActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ color: t.color }}>{t.desc}</span>

              {/* Bottom accent bar */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] md:h-[3px] transition-all duration-500 rounded-full ${isHovered || isAutoActive ? 'w-2/3' : 'w-0'}`} style={{ background: t.color }} />
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
    { year: '2025', title: 'AI Division Launch', desc: 'Established a dedicated AI division focused on generative AI, LLM integration, and intelligent automation for enterprise clients.' },
    { year: '2025', title: 'VoiceGuard AI — Built & Scaled', desc: 'AI call analytics platform processing thousands of calls daily, extracting insights that improve sales performance. From zero to production in 8 weeks.' },
    { year: '2025', title: 'First Enterprise Client', desc: 'Signed our first enterprise-level partnership, proving that boutique engineering teams can deliver at scale without the overhead.' },
    { year: '2025', title: '100% Client Retention Rate', desc: 'Every single client chose to continue working with us. That\'s the Masters at Work difference. We don\'t just deliver projects, we deliver outcomes.' },
    { year: '2024', title: 'Team Growth to 10+', desc: 'Scaled the core team to over 10 engineers, designers, and strategists across multiple time zones. Remote-first, results-driven.' },
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
                  <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden min-h-0">
                      <p className={`text-[#888] text-sm leading-relaxed pl-[52px] md:pl-[72px] pr-4 md:pr-8 transition-opacity duration-500 ${isOpen ? 'opacity-100 pb-6' : 'opacity-0'}`}>{item.desc}</p>
                    </div>
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

/* ═══════════════════════ SERVICES ═══════════════════════ */
function Services() {
  return (
    <section id="services" className="relative max-w-[1600px] mx-auto px-4 md:px-12 py-20 md:py-28 bg-white overflow-visible">
      {/* Giant "out of place" heading — overflows the container */}
      <div className="reveal-up mb-6" ref={useReveal()}>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#888] block mb-4">What We Do</span>
      </div>
      <div className="reveal-up relative mb-12 md:mb-20" ref={useReveal()}>
        <h2 className="text-[clamp(3.5rem,12vw,11rem)] font-black tracking-[-0.04em] leading-[0.85] text-[#0b0b0b] relative z-10" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          OUR
        </h2>
        <h2 className="text-[clamp(3.5rem,12vw,11rem)] font-black tracking-[-0.04em] leading-[0.85] italic text-[#00c853] -mt-1 md:-mt-3 relative z-10" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          services
        </h2>
        {/* Ghost outline text behind — hidden on mobile */}
        <div className="hidden md:block absolute top-0 left-[8%] text-[clamp(4rem,14vw,13rem)] font-black tracking-[-0.04em] leading-[0.85] text-transparent pointer-events-none select-none z-0" style={{ fontFamily: 'Plus Jakarta Sans', WebkitTextStroke: '1px rgba(0,0,0,0.04)' }}>
          services
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5" style={{ gridAutoRows: 'minmax(0, auto)' }}>

        {/* Card 1: Mobile Apps - span 5, green bg */}
        <div data-hover className="bento-card md:col-span-5 rounded-[1.5rem] md:rounded-[2rem] bg-[#00c853] p-6 md:p-10 flex flex-col justify-between group reveal-scale min-h-[340px] md:min-h-[500px]" ref={useReveal('reveal-scale', 0.05)}>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0b0b0b] text-white">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              <span className="text-[11px] font-bold uppercase tracking-wider">High Performance</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0b0b0b]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0b0b0b]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-[#0b0b0b] leading-[0.95] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>Mobile<br/>Apps</h3>
            <p className="text-[#0b0b0b]/50 text-sm italic mb-6">iOS & Android Solutions</p>
            <div className="border-t border-[#0b0b0b]/15 pt-5 flex items-center justify-between">
              <div>
                <span className="text-base md:text-lg font-bold text-[#0b0b0b] block">Flutter</span>
                <span className="text-[11px] font-semibold text-[#0b0b0b]/50 uppercase tracking-wider">Cross-Platform Mastery</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#0b0b0b]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0b0b0b]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: SaaS + Web Apps stacked - span 3 */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-5">
          <div data-hover className="bento-card flex-1 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-[#e5e5e5] p-5 md:p-7 flex flex-col items-center justify-center text-center group reveal-scale min-h-[180px] md:min-h-0" ref={useReveal('reveal-scale', 0.05)}>
            <div className="w-12 h-12 rounded-xl bg-[#f0f0f0] flex items-center justify-center mb-4 group-hover:bg-[#00c853]/10 transition-colors duration-500">
              <svg className="w-6 h-6 text-[#888] group-hover:text-[#00c853] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25" /></svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#0b0b0b] mb-1 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>SaaS</h3>
            <p className="text-xs text-[#888]">Scalable Platforms</p>
            <svg className="w-5 h-5 text-[#ddd] group-hover:text-[#00c853] transition-all duration-300 mt-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </div>
          <div data-hover className="bento-card flex-1 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-[#e5e5e5] p-5 md:p-7 flex flex-col items-center justify-center text-center group reveal-scale min-h-[180px] md:min-h-0" ref={useReveal('reveal-scale', 0.05)}>
            <div className="w-12 h-12 rounded-xl bg-[#f0f0f0] flex items-center justify-center mb-4 group-hover:bg-[#00c853]/10 transition-colors duration-500">
              <svg className="w-6 h-6 text-[#888] group-hover:text-[#00c853] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#0b0b0b] mb-1 group-hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>Web Apps</h3>
            <p className="text-xs text-[#888]">Modern & Responsive</p>
            <svg className="w-5 h-5 text-[#ddd] group-hover:text-[#00c853] transition-all duration-300 mt-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </div>
        </div>

        {/* Card 3: AI Agents - span 4, blue bg */}
        <div data-hover className="bento-card md:col-span-4 rounded-[1.5rem] md:rounded-[2rem] bg-[#1e4bff] p-6 md:p-10 flex flex-col justify-between group reveal-scale min-h-[340px] md:min-h-[500px] relative overflow-hidden" ref={useReveal('reveal-scale', 0.05)}>
          {/* Decorative watermark */}
          <div className="absolute top-8 right-4 md:right-8 text-[120px] md:text-[180px] font-black leading-none text-white/[0.08] pointer-events-none select-none" style={{ fontFamily: 'Space Grotesk' }}>AI</div>
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-4 md:mb-6">#GenerativeAI</span>
            <h3 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-[0.95] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>AI<br/>Agents</h3>
            <p className="text-white/50 text-sm italic mb-6">Automate. Optimize. Evolve.</p>
          </div>
          <div className="relative z-10">
            <div className="border-t border-white/10 pt-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {['Chatbots', 'Custom LLMs', 'Automation', 'Workflows', 'Predictive', 'Analytics'].map((tag, j) => (
                  <span key={j} className="text-[12px] font-semibold text-white/60">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: UI/UX Design - span 6, dark bg + shimmer */}
        <div data-hover className="bento-card shimmer-hover md:col-span-6 rounded-[1.5rem] md:rounded-[2rem] bg-[#0b0b0b] p-6 md:p-10 flex flex-col justify-between group reveal-scale min-h-[220px] md:min-h-[280px] relative overflow-hidden" ref={useReveal('reveal-scale', 0.05)}>
          <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-[#00c853]/5 blur-2xl group-hover:bg-[#00c853]/10 transition-all duration-700 pointer-events-none" />
          {/* Pen tool icon */}
          <div className="absolute top-6 right-6 md:top-8 md:right-10 w-12 h-12 md:w-16 md:h-16 text-[#333] group-hover:text-[#00c853]/40 transition-colors duration-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-black text-white mb-2 group-hover:text-[#00c853] transition-colors duration-500" style={{ fontFamily: 'Plus Jakarta Sans' }}>UI/UX Design</h3>
            <p className="text-[#555] text-sm">Award-winning interfaces</p>
          </div>
          <p className="text-[#444] text-sm leading-relaxed mt-4 max-w-md relative z-10">User-centric design that drives engagement and conversion. We build experiences, not just screens.</p>
        </div>

        {/* Product Strategy - span 6, dark bg + shimmer */}
        <div data-hover className="bento-card shimmer-hover md:col-span-6 rounded-[1.5rem] md:rounded-[2rem] bg-[#0b0b0b] p-6 md:p-10 flex flex-col justify-between group reveal-scale min-h-[220px] md:min-h-[280px] relative overflow-hidden" ref={useReveal('reveal-scale', 0.05)}>
          <div className="absolute -left-4 -bottom-4 w-32 h-32 rounded-full bg-[#00c853]/5 blur-2xl group-hover:bg-[#00c853]/10 transition-all duration-700 pointer-events-none" />
          {/* Chart/target icon */}
          <div className="absolute top-6 right-6 md:top-8 md:right-10 w-12 h-12 md:w-16 md:h-16 text-[#333] group-hover:text-[#00c853]/40 transition-colors duration-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v-5.5m3 5.5v-3.5m3 3.5v-1.5" /></svg>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-black text-white mb-2 group-hover:text-[#00c853] transition-colors duration-500" style={{ fontFamily: 'Plus Jakarta Sans' }}>Product Strategy</h3>
            <p className="text-[#555] text-sm">From MVP to Scale</p>
          </div>
          <p className="text-[#444] text-sm leading-relaxed mt-4 max-w-md relative z-10">Roadmapping, feasibility analysis, and growth hacking for your digital product.</p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════ PROCESS ═══════════════════════ */
function Process() {
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { n: '01', t: 'Discovery', d: 'Understand the business bottleneck and the metric to be moved.' },
    { n: '02', t: 'Architecture', d: 'Design the fastest, most scalable path to the outcome.' },
    { n: '03', t: 'Build', d: 'Rapid, production-grade execution. No shortcuts.' },
    { n: '04', t: 'Deploy', d: 'Seamless rollouts with monitoring and stress-testing.' },
    { n: '05', t: 'Scale', d: 'Continuous optimization. We help you grow post-launch.' },
  ]
  const revealRef = useReveal()
  return (
    <section id="process" className="max-w-[1600px] mx-auto px-4 md:px-12 py-16 md:py-24 bg-white border-t border-[#e5e5e5]">
      <div className="reveal-up mb-10 md:mb-14" ref={revealRef}>
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Our <span className="italic text-[#00c853]">Process</span></h2>
      </div>

      {/* Desktop: Horizontal stepper */}
      <div className="hidden md:block max-w-4xl mx-auto">
        {/* Step dots + connecting line */}
        <div className="relative flex items-center justify-between mb-12">
          {/* Background line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#e5e5e5] -translate-y-1/2" />
          {/* Progress fill */}
          <div className="absolute top-1/2 left-0 h-[2px] bg-[#00c853] -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }} />
          {/* Dots */}
          {steps.map((s, i) => (
            <button key={i} onClick={() => setActiveStep(i)} data-hover
              className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${i <= activeStep ? 'bg-[#00c853] border-[#00c853] text-white shadow-[0_0_16px_rgba(0,200,83,0.3)]' : 'bg-white border-[#e5e5e5] text-[#999] hover:border-[#00c853]'}`}>
              <span className="text-xs font-bold" style={{ fontFamily: 'Space Grotesk' }}>{s.n}</span>
            </button>
          ))}
        </div>

        {/* Active step content */}
        <div className="text-center p-8 md:p-12 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] transition-all duration-500">
          <span className="text-6xl md:text-7xl font-black text-[#00c853]/10 block mb-3" style={{ fontFamily: 'Space Grotesk' }}>{steps[activeStep].n}</span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#0b0b0b] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>{steps[activeStep].t}</h3>
          <p className="text-[#888] text-sm md:text-base leading-relaxed max-w-lg mx-auto">{steps[activeStep].d}</p>
        </div>
      </div>

      {/* Mobile: Vertical cards with green accent */}
      <div className="md:hidden space-y-3">
        {steps.map((s, i) => {
          const ref = useReveal('reveal-up', 0.1)
          return (
            <div key={i} ref={ref} className="flex items-start gap-4 p-5 rounded-2xl border border-[#e5e5e5] relative overflow-hidden">
              {/* Left green accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00c853] rounded-l-2xl" />
              <div className="w-10 h-10 rounded-full bg-[#00c853] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{s.n}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0b0b0b] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{s.t}</h3>
                <p className="text-sm text-[#888] leading-relaxed">{s.d}</p>
              </div>
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
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 mb-8 md:mb-12 relative">
        {/* Decorative large quote mark */}
        <div className="absolute -top-4 -left-2 md:left-6 text-[100px] md:text-[180px] font-black leading-none text-[#00c853]/[0.06] pointer-events-none select-none" style={{ fontFamily: 'Georgia, serif' }}>&ldquo;</div>
        <div className="reveal-up relative z-10" ref={useReveal()}>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-tight text-[#0b0b0b]" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Trusted by <span className="italic text-[#00c853]">Clients</span>
          </h2>
          <p className="text-[#888] text-sm mt-2">Real feedback from real partnerships</p>
        </div>
      </div>

      {/* Auto-scrolling testimonial strip with fade edges */}
      <div className="overflow-hidden fade-edges">
        <div className="testimonial-scroll inline-flex gap-5 md:gap-8 px-6">
          {[...items, ...items].map((t, i) => (
            <div key={i} data-hover className="flex-shrink-0 w-[280px] sm:w-[380px] md:w-[500px] rounded-2xl border border-[#e5e5e5] bg-white p-5 md:p-8 hover:border-[#00c853] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <span key={j} className="text-[#00c853] text-sm">★</span>)}
              </div>
              <p className="text-[#333] text-sm md:text-base leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3 border-t border-[#f0f0f0] pt-4">
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold" style={{ background: 'linear-gradient(135deg, #00c853, #00e676)' }}>{t.name.charAt(0)}</div>
                <div>
                  <span className="text-sm md:text-base font-bold text-[#0b0b0b] block leading-tight">{t.name}</span>
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
    <section id="contact" className="w-full relative px-3 md:px-8 pt-8 md:pt-12 pb-0 bg-[#fafafa]">
      {/* Blue rounded card */}
      <div className="w-full max-w-[1600px] mx-auto bg-[#1e4bff] rounded-[2rem] md:rounded-[3rem] pt-20 md:pt-32 pb-40 md:pb-52 px-4 md:px-12 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e4bff] via-[#1e4bff] to-[#1a42e6] pointer-events-none rounded-[inherit]" />
        {/* Decorative blobs */}
        <div className="absolute top-10 -left-20 w-[400px] h-[400px] rounded-full bg-white/[0.03] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-[300px] h-[300px] rounded-full bg-[#00c853]/[0.05] blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="reveal-up" ref={useReveal()}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8 md:mb-10">
              <span className="w-2 h-2 rounded-full bg-[#00c853] pulse-dot" />
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.15em]">Let's Collaborate</span>
            </div>

            {/* Heading */}
            <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black tracking-[-0.02em] text-white leading-[1] mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Ready to <span className="italic text-[#c8ff00]" style={{ fontFamily: 'Georgia, Times, serif' }}>Scale</span><br />Your Business?
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-10">
              Whether you need a high-performance web app, a mobile solution, or an AI integration, our team is ready to engineer your success.
            </p>
          </div>

          {/* Buttons */}
          <div className="reveal-up flex flex-col sm:flex-row gap-4 justify-center items-center" ref={useReveal()}>
            <a href="mailto:hello@supernetrix.com" data-hover className="group inline-flex items-center gap-3 bg-[#c8ff00] text-[#0b0b0b] font-bold px-8 py-4 rounded-full hover:bg-[#d4ff33] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(200,255,0,0.4)] text-sm uppercase tracking-wider">
              Start A Project
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#services" data-hover className="inline-flex items-center gap-2 text-sm font-bold border-2 border-white/30 text-white px-7 py-3.5 rounded-full hover:bg-white hover:text-[#1e4bff] transition-all duration-300 uppercase tracking-wider">
              View Services
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Marquee bands — sujalbuild.in style */}
      <div className="relative -mt-10 md:-mt-14 z-20 overflow-hidden max-w-[1600px] mx-auto space-y-2">
        {/* Lime band — tilted left */}
        <div className="rotate-[2deg] scale-x-[1.15] origin-center">
          <div className="bg-[#c8ff00] py-3 md:py-4">
            <Marquee items={['DESIGN', '✦', 'DEVELOP', '✦', 'DEPLOY', '✦', 'SCALE', '✦']} className="text-[clamp(1.5rem,4vw,2.8rem)] font-black text-[#0b0b0b] tracking-tight" />
          </div>
        </div>
        {/* Blue/dark band — tilted right */}
        <div className="-rotate-[2deg] scale-x-[1.15] origin-center">
          <div className="bg-[#1e4bff] py-3 md:py-4">
            <Marquee items={['MOBILE APP EXPERTS', '✦', 'AI INTEGRATION', '✦', 'WEB PLATFORMS', '✦']} reverse className="text-[clamp(1.5rem,4vw,2.8rem)] font-black text-white tracking-tight" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════ FOOTER ═══════════════════════ */
function Footer() {
  const socials = [
    { href: 'https://www.linkedin.com/company/supernetrix', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { href: 'https://www.instagram.com/supernetrix', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    { href: 'https://x.com/supernetrix', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  ]

  return (
    <footer className="w-full bg-[#fafafa] pt-12 md:pt-16 pb-8 px-3 md:px-8">
      {/* Rounded card container */}
      <div className="max-w-[1600px] mx-auto bg-white rounded-[2rem] md:rounded-[3rem] border border-[#e8e8e8] p-6 md:p-12 lg:p-16">
        {/* Top: Contacts + Email */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#999] mb-3 block">Contacts</span>
            <a href="mailto:hello@supernetrix.com" data-hover className="text-[#0b0b0b] text-xl md:text-3xl font-bold hover:text-[#00c853] transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>hello@supernetrix.com</a>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener" data-hover
                className="w-11 h-11 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#00c853] transition-all duration-300">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6 mb-12 md:mb-16">
          {/* Col 1: About card */}
          <div className="lg:col-span-2 bg-[#f8f8f8] rounded-2xl p-6 md:p-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#00c853] block mb-3">Designed & Developed By</span>
            <h3 className="text-2xl md:text-3xl font-black text-[#0b0b0b] mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>SuperNetrix</h3>
            <p className="text-[#777] text-sm leading-relaxed max-w-sm">Strategic Technology Partner crafting high-impact digital experiences for startups and enterprises.</p>
            <p className="text-[#aaa] text-xs mt-4">Based globally. Building remotely.</p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#999] mb-5 block">Quick Links</span>
            <nav className="flex flex-col gap-3">
              {[['Home', '#'], ['About', '#about'], ['Services', '#services'], ['Case Studies', '#work'], ['Contact', '#contact']].map(([label, href]) => (
                <a key={label} href={href} data-hover className="text-sm font-medium text-[#444] hover:text-[#00c853] transition-colors inline-block w-fit">{label}</a>
              ))}
            </nav>
          </div>

          {/* Col 3: Legal */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#999] mb-5 block">Legal</span>
            <nav className="flex flex-col gap-3">
              {['Privacy Policy', 'Terms & Conditions', 'Code of Conduct'].map(label => (
                <a key={label} href="#" data-hover className="text-sm font-medium text-[#444] hover:text-[#00c853] transition-colors inline-block w-fit">{label}</a>
              ))}
            </nav>
          </div>

          {/* Col 4: Inquiries */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#999] mb-5 block">Inquiries</span>
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#bbb] block mb-1">General</span>
                <a href="mailto:hello@supernetrix.com" data-hover className="text-sm font-medium text-[#444] hover:text-[#00c853] transition-colors inline-block w-fit">hello@supernetrix.com</a>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#bbb] block mb-1">Projects</span>
                <a href="mailto:projects@supernetrix.com" data-hover className="text-sm font-medium text-[#444] hover:text-[#00c853] transition-colors inline-block w-fit">projects@supernetrix.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#eee] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#aaa]">&copy; 2026 SuperNetrix. All Rights Reserved.</p>
          <a href="#" data-hover className="text-xs text-[#aaa] hover:text-[#00c853] transition-colors">Back to Top ↑</a>
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
