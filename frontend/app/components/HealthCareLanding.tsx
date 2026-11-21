"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type IconName =
  | "activity"
  | "arrow-right"
  | "calendar"
  | "check"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "compass"
  | "help"
  | "mail"
  | "menu"
  | "message"
  | "phone"
  | "send"
  | "shield"
  | "sparkles"
  | "users"
  | "x";

const iconPaths: Record<IconName, string> = {
  activity: "M3 12h4l3-9 4 18 3-9h4",
  "arrow-right": "M5 12h14m-6-6 6 6-6 6",
  calendar: "M7 3v4m10-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  check: "m5 12 4 4L19 6",
  "chevron-left": "m15 18-6-6 6-6",
  "chevron-right": "m9 18 6-6-6-6",
  clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  compass: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z",
  help: "M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4m.1 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  mail: "M4 5h16v14H4zM4 7l8 6 8-6",
  menu: "M4 6h16M4 12h16M4 18h16",
  message: "M4 5h16v11H8l-4 4V5Z",
  phone: "M6 3h3l2 5-2 2a14 14 0 0 0 5 5l2-2 5 2v3c0 1-1 2-2 2C10 20 4 14 4 6c0-1 1-3 2-3Z",
  send: "m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13",
  shield: "M12 3 20 6v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z",
  sparkles: "m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Zm7 12 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 2a4 4 0 0 0 0-8m4 16v-2a4 4 0 0 0-3-3.87",
  x: "M6 6l12 12M18 6 6 18",
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

const services = [
  {
    title: "Find Nearby Doctors",
    text: "Discover healthcare providers and facilities near you using your location and care preferences.",
    icon: "compass" as IconName,
    tone: "red",
  },
  {
    title: "Personalized 7-Day Diet Plan",
    text: "Get a practical weekly meal outline shaped around your goals, preferences, and lifestyle.",
    icon: "activity" as IconName,
    tone: "blue",
  },
  {
    title: "Health Precautions",
    text: "Receive clear, general wellness reminders and questions to discuss with a qualified professional.",
    icon: "shield" as IconName,
    tone: "green",
  },
];

const serviceToneClasses: Record<string, string> = {
  red: "bg-red-100 text-red-600 group-hover:bg-red-600",
  blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600",
  green: "bg-green-100 text-green-600 group-hover:bg-green-600",
};

const faqs = [
  ["What is HealthCare AI?", "HealthCare AI is a personal health assistant that helps organize health information, find relevant resources, and provide general wellness guidance. It does not replace a doctor or diagnose conditions."],
  ["Can HealthCare AI diagnose my symptoms?", "No. The assistant can help you prepare questions and understand general health information, but only a qualified healthcare professional can diagnose or treat a medical condition."],
  ["How does the diet plan work?", "You share your preferences and goals, and the assistant can create a general seven-day meal outline. Allergies, medical conditions, and dietary changes should always be reviewed with a clinician or registered dietitian."],
  ["Can I find a doctor near me?", "The nearby-doctor feature is designed to help you discover local care options. Always verify provider credentials, availability, insurance, and suitability directly with the provider."],
  ["Is my health information private?", "The landing page does not collect or transmit health information yet. Privacy, security, and consent workflows will be implemented before a health profile or AI service is connected."],
];

function usePageInteractions() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-aos]"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("aos-animate")),
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const links = [
    ["Home", "#home"],
    ["About", "#about"],
    ["Services", "#services"],
    ["How It Works", "#process"],
    ["FAQ", "#faq"],
    ["Contact", "#contact"],
  ];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <div className="topbar py-2 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><strong className="text-green-300">HealthCare AI</strong><span className="hidden sm:inline text-slate-400">Your personal health companion</span></span>
          <span className="text-slate-400 text-xs">Information, not diagnosis</span>
        </div>
      </div>
      <nav id="navbar" className={`sticky top-0 z-50 bg-transparent transition-all duration-300 ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <a href="#home" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg"><Icon name="sparkles" className="w-5 h-5 text-white" /></div>
              <div><div className="font-heading font-extrabold text-lg leading-tight dark:text-white">HealthCare AI</div><div className="text-xs text-slate-600 leading-none">Personal Health Assistant</div></div>
            </a>
            <div className="hidden lg:flex items-center gap-8">
              {links.map(([label, href]) => <a key={href} href={href} className="nav-link text-sm">{label}</a>)}
            </div>
            <div className="flex items-center gap-3">
              <a href="#get-started" className="hidden lg:flex btn-primary text-sm py-2.5 px-5"><Icon name="sparkles" className="w-4 h-4" />Get Started</a>
              <button type="button" aria-label="Toggle navigation" className="lg:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "x" : "menu"} className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
        {menuOpen && <div className="lg:hidden bg-slate-900 border-t border-white/10"><div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">{links.map(([label, href]) => <a key={href} href={href} className="nav-link text-slate-200 py-2.5 text-sm font-medium" onClick={() => setMenuOpen(false)}>{label}</a>)}<a href="#get-started" className="btn-primary mt-3 w-full justify-center" onClick={() => setMenuOpen(false)}>Get Started</a></div></div>}
      </nav>
    </>
  );
}

function Hero() {
  return (
    <section id="home" className="hero-section flex items-center justify-center relative pt-4">
      <div className="absolute top-20 right-16 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex flex-wrap gap-2 mb-6" data-aos="fade-up"><span className="hero-badge"><Icon name="sparkles" className="w-3.5 h-3.5 text-red-400" />AI-powered wellness support</span><span className="hero-badge"><Icon name="shield" className="w-3.5 h-3.5 text-green-400" />Privacy-first by design</span></div>
            <h1 className="font-heading font-extrabold text-4xl lg:text-6xl text-white leading-tight mb-6" data-aos="fade-up" data-aos-delay="100">Understand your health.<br /><span className="text-red-400">Take your next step</span> with confidence.</h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl" data-aos="fade-up" data-aos-delay="200">HealthCare AI helps you organize health questions, discover nearby care, plan healthier meals, and make informed decisions alongside qualified healthcare professionals.</p>
            <div className="flex flex-wrap gap-4 mb-10" data-aos="fade-up" data-aos-delay="300"><a href="#get-started" className="btn-primary text-base py-3.5 px-7"><Icon name="sparkles" className="w-5 h-5" />Get Started</a><a href="#services" className="btn-outline text-base py-3.5 px-7"><Icon name="compass" className="w-5 h-5" />Explore Features</a></div>
            <div className="flex flex-wrap gap-8" data-aos="fade-up" data-aos-delay="400"><div><div className="font-heading font-bold text-3xl text-white">3</div><div className="text-slate-400 text-sm">Core features</div></div><div className="border-l border-white/20 pl-8"><div className="font-heading font-bold text-3xl text-white">24/7</div><div className="text-slate-400 text-sm">Self-serve access</div></div><div className="border-l border-white/20 pl-8"><div className="font-heading font-bold text-3xl text-white">You</div><div className="text-slate-400 text-sm">In control</div></div></div>
          </div>
          <div className="hidden lg:flex justify-center relative" data-aos="fade-left" data-aos-delay="200"><div className="relative w-96 h-96 rounded-3xl border border-white/10 bg-gradient-to-br from-red-600/20 to-blue-600/20 flex items-center justify-center shadow-2xl" style={{ animation: "float 6s ease-in-out infinite" }}><div className="w-52 h-52 rounded-full bg-slate-900/80 border border-red-400/30 flex flex-col items-center justify-center text-center"><Icon name="sparkles" className="w-16 h-16 text-red-400 mb-3" /><span className="text-white font-heading font-bold text-xl">HealthCare AI</span><span className="text-slate-400 text-sm mt-1">Here to help you prepare</span></div><div className="absolute -top-5 -left-10 bg-white rounded-xl px-4 py-3 shadow-xl"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"><Icon name="message" className="w-4 h-4 text-red-600" /></div><div><div className="font-heading font-bold text-sm text-slate-800">Health questions</div><div className="text-xs text-slate-500">Organized clearly</div></div></div></div><div className="absolute -bottom-4 -right-8 bg-white rounded-xl px-4 py-3 shadow-xl"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><Icon name="check" className="w-4 h-4 text-green-600" /></div><div><div className="font-heading font-bold text-sm text-slate-800">Next steps</div><div className="text-xs text-slate-500">Designed for clarity</div></div></div></div></div></div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 text-slate-400 text-xs"><span>Scroll Down</span><div className="w-px h-12 bg-gradient-to-b from-slate-400 to-transparent" /></div>
    </section>
  );
}

function GetStarted() {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); event.currentTarget.reset(); };
  return <section id="get-started" className="section-padding bg-white dark:bg-slate-900"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12" data-aos="fade-up"><span className="section-tag mb-4"><Icon name="message" className="w-3.5 h-3.5" />Get Started</span><h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 dark:text-white mt-3">Start with a health question</h2><p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">Share what you want help organizing. This introductory form is only a starting point and does not provide a diagnosis.</p></div><div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 lg:p-12 shadow-2xl max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="100"><form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5"><label className="flex flex-col gap-1.5 text-slate-300 text-sm font-medium">Name (optional)<input name="name" type="text" placeholder="How should we address you?" className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 py-3 text-sm transition-all font-normal" /></label><label className="flex flex-col gap-1.5 text-slate-300 text-sm font-medium">Email (optional)<input name="email" type="email" placeholder="your@email.com" className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 py-3 text-sm transition-all font-normal" /></label><label className="md:col-span-2 flex flex-col gap-1.5 text-slate-300 text-sm font-medium">What would you like help with?<textarea name="concern" required rows={4} placeholder="For example: finding a nearby doctor or planning healthier meals" className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 py-3 text-sm transition-all font-normal resize-y" /></label><div className="md:col-span-2 flex flex-col items-center gap-3 mt-2"><button type="submit" className="btn-primary px-10 py-3.5 text-base"><Icon name="send" className="w-5 h-5" />Continue</button><p className="text-xs text-slate-400 text-center">Do not submit urgent symptoms or emergency information here. Contact local emergency services when needed.</p>{submitted && <p role="status" className="text-green-300 text-sm">Thanks. Health profile and AI guidance features will be available in a future phase.</p>}</div></form></div></div></section>;
}

function Services() {
  return <section id="services" className="section-padding bg-slate-50 dark:bg-slate-800"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12" data-aos="fade-up"><span className="section-tag mb-4"><Icon name="sparkles" className="w-3.5 h-3.5" />Our Features</span><h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 dark:text-white mt-3">Practical support for everyday health</h2><p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">Useful tools to help you prepare, plan, and find care without replacing professional medical advice.</p></div><div className="grid md:grid-cols-3 gap-6">{services.map((service, index) => <div key={service.title} className="card-medical dark:bg-slate-800 dark:border-slate-700 group" data-aos="fade-up" data-aos-delay={index * 100}><div className={`w-12 h-12 ${serviceToneClasses[service.tone]} rounded-xl flex items-center justify-center mb-4 transition-colors`}><Icon name={service.icon} className="w-6 h-6 group-hover:text-white transition-colors" /></div><h3 className="font-heading font-semibold text-lg text-slate-800 dark:text-white mb-2">{service.title}</h3><p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{service.text}</p><a href="#get-started" className="mt-4 flex items-center gap-1 text-red-600 text-sm font-semibold hover:gap-2 transition-all">Get Started <Icon name="arrow-right" className="w-4 h-4" /></a></div>)}</div></div></section>;
}

function About() {
  return <section id="about" className="section-padding bg-white dark:bg-slate-900"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="grid lg:grid-cols-2 gap-16 items-center"><div data-aos="fade-right" className="relative"><div className="bg-gradient-to-br from-red-600 to-slate-800 rounded-3xl p-1 shadow-2xl max-w-md mx-auto lg:mx-0"><div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 text-center min-h-80 flex flex-col items-center justify-center"><Icon name="sparkles" className="w-24 h-24 text-red-600 mb-5" /><div className="font-heading font-bold text-xl text-slate-800 dark:text-white">A calmer way to navigate health</div><div className="text-slate-500 text-sm mt-2">Organize information. Prepare questions. Find your next step.</div></div></div></div><div data-aos="fade-left" data-aos-delay="100"><span className="section-tag mb-4"><Icon name="users" className="w-3.5 h-3.5" />Built around you</span><h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 dark:text-white mt-3 mb-5">Your health journey deserves clarity, context, and care.</h2><p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">HealthCare AI is being designed to make everyday health planning easier. It can help turn scattered questions into an organized starting point, while keeping qualified professionals at the center of important decisions.</p><div className="space-y-3 mb-8">{["General wellness information in plain language", "Prompts that help you prepare for a care conversation", "Clear reminders that support does not replace medical care"].map((item) => <div key={item} className="flex items-center gap-3"><div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"><Icon name="check" className="w-3.5 h-3.5 text-red-600" /></div><span className="text-slate-700 dark:text-slate-300 text-sm">{item}</span></div>)}</div><a href="#get-started" className="btn-primary-dark inline-flex"><Icon name="sparkles" className="w-5 h-5" />Explore HealthCare AI</a></div></div></div></section>;
}

function Process() {
  const steps = [["1. Share", "Describe your goals or health question in your own words."], ["2. Organize", "Turn the information into a clearer set of topics and questions."], ["3. Explore", "Review general guidance and relevant care resources."], ["4. Act thoughtfully", "Choose next steps and discuss important decisions with a professional."]];
  return <section id="process" className="section-padding bg-slate-50 dark:bg-slate-800"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-16" data-aos="fade-up"><span className="section-tag mb-4"><Icon name="compass" className="w-3.5 h-3.5" />How It Works</span><h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 dark:text-white mt-3">A thoughtful path from question to next step</h2><p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">HealthCare AI supports preparation and understanding. It does not diagnose, prescribe, or replace a healthcare professional.</p></div><div className="relative" data-aos="fade-up" data-aos-delay="100"><div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-red-200 via-red-500 to-red-200" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">{steps.map(([title, text], index) => <div key={title} className="text-center relative card-medical dark:bg-slate-700"><div className={`w-20 h-20 ${index % 2 ? "bg-slate-700" : "bg-red-600"} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10`}><span className="text-white font-heading font-bold text-2xl">{index + 1}</span></div><div className="font-heading font-bold text-base text-slate-800 dark:text-white mb-2">{title}</div><p className="text-slate-500 dark:text-slate-400 text-sm">{text}</p></div>)}</div></div></div></section>;
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return <section id="faq" className="section-padding bg-white dark:bg-slate-900"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12" data-aos="fade-up"><span className="section-tag mb-4"><Icon name="help" className="w-3.5 h-3.5" />FAQ</span><h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 dark:text-white mt-3">Questions before you begin</h2></div><div className="space-y-0" data-aos="fade-up" data-aos-delay="100">{faqs.map(([question, answer], index) => <div className="faq-item" key={question}><button type="button" className={`faq-question text-slate-800 dark:text-white w-full text-left ${open === index ? "active" : ""}`} onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}>{question}<span className="faq-icon text-red-600 text-2xl leading-none">{open === index ? "−" : "+"}</span></button><div className={`faq-answer ${open === index ? "open" : ""}`}><p>{answer}</p></div></div>)}</div></div></section>;
}

function ContactAndFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubscribed(true); setEmail(""); };
  return <><section id="contact" className="section-padding bg-slate-50 dark:bg-slate-800"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12" data-aos="fade-up"><span className="section-tag mb-4"><Icon name="message" className="w-3.5 h-3.5" />Contact</span><h2 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 dark:text-white mt-3">Stay in the conversation</h2><p className="text-slate-500 dark:text-slate-400 mt-3">HealthCare AI is evolving. Follow the project as future health profile and AI features are developed.</p></div><div className="grid md:grid-cols-3 gap-6"><div className="card-medical dark:bg-slate-800 text-center" data-aos="fade-up"><Icon name="mail" className="w-8 h-8 text-red-600 mx-auto mb-4" /><h3 className="font-heading font-semibold text-base text-slate-800 dark:text-white mb-2">Project updates</h3><p className="text-slate-500 dark:text-slate-400 text-sm">Subscribe for product and wellness feature updates.</p></div><div className="card-medical dark:bg-slate-800 text-center" data-aos="fade-up" data-aos-delay="100"><Icon name="shield" className="w-8 h-8 text-blue-600 mx-auto mb-4" /><h3 className="font-heading font-semibold text-base text-slate-800 dark:text-white mb-2">Responsible by design</h3><p className="text-slate-500 dark:text-slate-400 text-sm">Important health decisions remain with qualified professionals.</p></div><div className="card-medical dark:bg-slate-800 text-center" data-aos="fade-up" data-aos-delay="200"><Icon name="clock" className="w-8 h-8 text-green-600 mx-auto mb-4" /><h3 className="font-heading font-semibold text-base text-slate-800 dark:text-white mb-2">Coming in phases</h3><p className="text-slate-500 dark:text-slate-400 text-sm">Profiles, AI services, and backend integrations are planned for later phases.</p></div></div></div></section><section className="py-16 bg-red-50 dark:bg-slate-800"><div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="fade-up"><div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Icon name="mail" className="w-6 h-6 text-white" /></div><h3 className="font-heading font-bold text-2xl lg:text-3xl text-slate-900 dark:text-white mb-3">Keep up with HealthCare AI</h3><p className="text-slate-500 dark:text-slate-400 mb-6">Get occasional updates about new features and responsible health education.</p><form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={submit}><input aria-label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" required className="flex-1 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-all" /><button type="submit" className="btn-primary whitespace-nowrap py-3 px-6 text-sm"><Icon name="send" className="w-4 h-4" />Subscribe</button></form>{subscribed && <p role="status" className="text-green-700 dark:text-green-300 text-sm mt-3">Thanks for subscribing to project updates.</p>}</div></section><footer id="footer" className="text-white overflow-hidden relative"><div className="w-full overflow-hidden border-b border-white/5"><svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-10" fill="none"><path d="M0 20h200l40 0 15-16 10 32 7-34 10 36 10-18h208l40 0 15-16 10 32 7-34 10 36 10-18h208l40 0 15-16 10 32 7-34 10 36 10-18h208l40 0 15-16 10 32 7-34 10 36 10-18h248" stroke="#DC2626" strokeWidth="1.5" strokeOpacity=".5" /></svg></div><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><div className="grid md:grid-cols-3 gap-10"><div><div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center"><Icon name="sparkles" className="w-7 h-7 text-white" /></div><div><div className="font-heading font-extrabold text-2xl">HealthCare AI</div><div className="text-xs text-red-400 font-semibold uppercase tracking-widest">Personal Health Assistant</div></div></div><p className="text-slate-400 text-sm leading-relaxed max-w-md">A thoughtful starting point for organizing health questions, finding care resources, and building healthier routines.</p></div><div><h4 className="font-heading font-semibold text-sm text-white mb-5">Explore</h4><ul className="space-y-3 text-sm text-slate-400"><li><a href="#about" className="hover:text-red-400">About</a></li><li><a href="#services" className="hover:text-red-400">Features</a></li><li><a href="#process" className="hover:text-red-400">How It Works</a></li><li><a href="#faq" className="hover:text-red-400">FAQ</a></li></ul></div><div><h4 className="font-heading font-semibold text-sm text-white mb-5">Safety note</h4><p className="text-slate-400 text-sm leading-relaxed">This website is informational. HealthCare AI is not an emergency service and does not diagnose, treat, or replace professional medical advice.</p></div></div><div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500"><span>© 2026 HealthCare AI. All rights reserved.</span><span>Built for clearer health conversations.</span></div></div></footer></>;
}

export default function HealthCareLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  usePageInteractions();
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const mainSections = useMemo(() => [<Hero key="hero" />, <GetStarted key="started" />, <About key="about" />, <Services key="services" />, <Process key="process" />, <FAQ key="faq" />, <ContactAndFooter key="contact" />], []);
  return <div className="font-body"><Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><main>{mainSections}</main><div className="mobile-cta dark:bg-slate-900 dark:border-t dark:border-slate-700"><a href="#get-started" className="btn-primary w-full justify-center py-3.5 text-base"><Icon name="sparkles" className="w-5 h-5" />Get Started</a></div><button id="scroll-top" className={showTop ? "visible" : ""} aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Icon name="chevron-right" className="w-5 h-5 -rotate-90" /></button></div>;
}
