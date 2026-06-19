import React from "react";
import { useLmsStore } from "../store/index";
import {
  ArrowRight,
  ShieldCheck,
  Video,
  Sparkles,
  Trophy,
  Users,
  Activity,
  Heart,
  Star,
  Layout,
  CheckCircle,
  BookOpen,
  StarHalf,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import { PlanetLogo } from "./PlanetLogo";

export const LandingPage: React.FC = () => {
  const { setView } = useLmsStore();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = React.useState(0);
  const [animate, setAnimate] = React.useState(true);

  const handlePrev = () => {
    setAnimate(false);
    setTimeout(() => {
      setCurrentTestimonialIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
      setAnimate(true);
    }, 200);
  };

  const handleNext = () => {
    setAnimate(false);
    setTimeout(() => {
      setCurrentTestimonialIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
      setAnimate(true);
    }, 200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "Contextual AI Tutor",
      desc: "Instant 24/7 explanations in mathematics and chemistry tailored to your textbook version, board standard, and learning speed.",
    },
    {
      icon: Video,
      title: "UHD WebRTC Classrooms",
      desc: "Ultra-low latency streaming with active participant grids, digital whiteboards, and real-time screen shares.",
    },
    {
      icon: BookOpen,
      title: "Expert Notes",
      desc: "Curated chapter notes, formula sheets, and physical worksheets mapped perfectly to your board exam curriculum for better learning.",
    },
  ];

  const testimonials = [
    {
      quote:
        "Nexora Learning completely revolutionized my daughter's Class 12 prep. The physical kit, combined with the real-time AI tutor, justified every rupee of the premium subscription. She cleared her TN State Board exams with top marks.",
      author: "Aditi Rao",
      role: "Parent of Shreya Rao (Class 12 TNSB)",
      rating: 4.5,
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    },
    {
      quote:
        "Using Nexora Learning helped me improve my academic performance dramatically. By practicing with the expert worksheets and chapter tests, my conceptual understanding became so strong that I went from 70% to scoring 98% in my Class 12 board exams.",
      author: "Kabir Mehta",
      role: "Class 12 Student (TNSB board)",
      rating: 5,
      avatar:
        "/kabir_mehta.png",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white text-slate-800 overflow-x-hidden font-sans selection:bg-brand-royal/20 selection:text-slate-900">
      <div className="absolute rounded-full blur-[120px] opacity-[0.08] pointer-events-none w-[500px] h-[500px] bg-brand-royal top-[-100px] left-[-100px]" />
      <div className="absolute rounded-full blur-[120px] opacity-[0.08] pointer-events-none w-[600px] h-[600px] bg-brand-violet bottom-0 right-[-100px]" />
      <div className="absolute rounded-full blur-[120px] opacity-[0.05] pointer-events-none w-[400px] h-[400px] bg-cyan-500 top-[40%] right-[10%]" />

      {/* Modern Luxury Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-row items-center justify-between gap-4">
        <div
          onClick={() => setView("landing")}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <PlanetLogo className="w-9 h-9 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform" />
          <span className="font-extrabold font-display text-lg sm:text-2xl tracking-tight text-slate-900 group-hover:text-brand-violet transition-colors whitespace-nowrap">
            Nexora Learning
          </span>
        </div>

        {/* Navigation Links in Center */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("features")}
            className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-royal transition-colors bg-transparent border-none cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("about-us")}
            className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-royal transition-colors bg-transparent border-none cursor-pointer"
          >
            About Us
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-royal transition-colors bg-transparent border-none cursor-pointer"
          >
            Testimonials
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setView("login-student")}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-650 hover:text-slate-900 px-3 sm:px-5 py-2 sm:py-2.5 border border-slate-200 hover:bg-slate-50 rounded-none transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => setView("signup")}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs rounded-none bg-brand-royal hover:bg-blue-650 text-white font-bold uppercase tracking-wider border border-brand-royal hover:border-blue-650 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Enroll Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 min-h-[calc(100vh-100px)] flex flex-col justify-center items-center text-center">
        {/* Background Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden [perspective:1200px]">
          {/* Tilted Planet Body & Ring */}
          <div 
            className="w-[280px] h-[280px] sm:w-[600px] sm:h-[600px] md:w-[900px] md:h-[900px] opacity-[0.2] sm:opacity-[0.45] absolute"
            style={{ 
              transform: "rotateX(20deg) rotateY(-10deg) rotateZ(-10deg)",
              transformStyle: "preserve-3d" 
            }}
          >
            <PlanetLogo className="w-full h-full" hideLetter={true} />
          </div>

          {/* Standing 'N' Centered Overlay */}
          <div className="w-[280px] h-[280px] sm:w-[600px] sm:h-[600px] md:w-[900px] md:h-[900px] opacity-[0.2] sm:opacity-[0.45] absolute flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 38 36 L 38 64 L 43 64 L 43 44 L 57 64 L 62 64 L 62 36 L 57 36 L 57 56 L 43 36 Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.15] mb-10 mt-8 relative z-10">
          The Ultimate Academic Platform for <br className="hidden sm:inline" />
          <span className="text-brand-royal">
            Class 9–12 Scholars
          </span>
        </h1>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 relative z-10">
          <button
            onClick={() => setView("login-student")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-none bg-brand-royal hover:bg-blue-650 text-white font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Enter Student Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => setView("login-educator")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-none bg-white hover:bg-slate-50 text-slate-800 font-bold uppercase tracking-wider shadow-md hover:shadow-lg border border-slate-300 hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Sign In as Educator</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section
        id="features"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24 border-t border-slate-100"
      >
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-20">
          <span className="text-xs font-bold text-brand-royal uppercase tracking-widest block mb-2">
            Elite Ecosystem
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Designed for Academic Supremacy
          </h2>
        </div>

        {/* Alternating Feature Rows with Mockups */}
        <div className="space-y-16 sm:space-y-32">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            const isEven = index % 2 === 0;
            const images = [
              "/feat_ai_tutor.png?v=3",
              "/feat_webrtc.png?v=3",
              "/feat_expert_notes.png?v=6",
            ];
            return (
              <div
                key={index}
                className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-8 lg:gap-12 text-left`}
              >
                {/* Text Description Block */}
                <div className="w-full lg:flex-1 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-royal/5 flex items-center justify-center text-brand-royal border border-brand-royal/10 overflow-hidden">
                    {feat.title === "Contextual AI Tutor" ? (
                      <img
                        src="/feat_ai_tutor_icon.png"
                        alt="AI Tutor"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                {/* Image Mockup Block */}
                <div className="w-full lg:flex-1">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-1.5 sm:p-2 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                      <img
                        src={images[index]}
                        alt={`${feat.title} Mockup`}
                        className="w-full h-auto object-cover select-none max-h-[200px] sm:max-h-[350px] lg:max-h-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Us Section */}
      <section
        id="about-us"
        className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-slate-100 text-left"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-brand-royal uppercase tracking-widest block">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
              Pioneering the Future of Secondary Education
            </h2>
            <p className="text-sm sm:text-base text-slate-650 leading-relaxed">
              At Nexora Learning, we design elite academic environments for Class 9–12 scholars. Our platform integrates physical curriculum materials with advanced WebRTC real-time tutoring classrooms and a high-performance contextual AI mentor available 24/7.
            </p>
            <p className="text-sm sm:text-base text-slate-650 leading-relaxed">
              We aim to unlock conceptual clarity in mathematics, physics, and chemistry. By aligning our content precisely with regional and national syllabus standards, we empower students to transform their academic results and construct a foundation for future engineering and scientific careers.
            </p>
            <div className="flex flex-row items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-royal" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">State Board & CBSE Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-royal" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">Personalized Learning Paths</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2 shadow-xl">
              <div className="rounded-xl overflow-hidden aspect-video bg-gradient-to-tr from-brand-royal to-brand-violet flex items-center justify-center text-white p-8 relative">
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                <div className="relative z-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-inner">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold">Uncompromising Quality</h4>
                  <p className="text-xs text-white/80 max-w-sm mx-auto">
                    Designed to bridge high-end technology with proven pedagogy for top-tier academic results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="relative z-10 max-w-5xl mx-auto px-6 py-24 border-t border-slate-100"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-royal uppercase tracking-widest block mb-2">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Approved by Elite Parents and Educators
          </h2>
        </div>

        {/* Premium Testimonials Card with Slide/Fade Animation */}
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] transition-all duration-500 relative overflow-hidden">
          {/* Subtle Decorative Glows */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-royal/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />

          <div className={`flex flex-col md:flex-row gap-8 md:gap-12 items-start transition-all duration-300 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            {/* Left Column: Profile Card */}
            <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left shrink-0">
              <div className="p-1 bg-gradient-to-tr from-brand-royal to-brand-violet rounded-3xl shadow-sm mb-5 hover:scale-105 transition-transform duration-300">
                <img
                  src={testimonials[currentTestimonialIndex].avatar}
                  alt={testimonials[currentTestimonialIndex].author}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-[22px] object-cover"
                />
              </div>
              <h4 className="text-xl font-extrabold font-display text-slate-900 tracking-tight mb-1">
                {testimonials[currentTestimonialIndex].author}
              </h4>
              <p className="text-xs font-semibold text-slate-500 mb-8 max-w-[200px] leading-relaxed">
                {testimonials[currentTestimonialIndex].role}
              </p>
              
              {/* Premium Navigation Arrows */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrev}
                  className="w-11 h-11 border border-brand-royal/20 bg-gradient-to-tr from-brand-royal/10 to-brand-violet/10 hover:from-brand-royal hover:to-brand-violet text-brand-royal hover:text-white hover:border-transparent flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
                  style={{ borderRadius: "9999px" }}
                  title="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-11 h-11 border border-brand-royal/20 bg-gradient-to-tr from-brand-royal/10 to-brand-violet/10 hover:from-brand-royal hover:to-brand-violet text-brand-royal hover:text-white hover:border-transparent flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
                  style={{ borderRadius: "9999px" }}
                  title="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Column: Quote Text */}
            <div className="flex-1 text-left space-y-6 relative pt-4 md:pt-6">
              {/* Huge quote icon watermark */}
              <Quote className="w-14 h-14 text-brand-royal/10 fill-brand-royal/[0.02] absolute -top-4 -left-4 rotate-180 select-none pointer-events-none" />
              
              <p className="text-lg sm:text-xl font-medium text-slate-705 leading-relaxed italic relative z-10 font-sans">
                "{testimonials[currentTestimonialIndex].quote}"
              </p>
              
              {/* Star Rating */}
              <div className="flex items-center gap-2 pt-6 border-t border-slate-150">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    const rating = testimonials[currentTestimonialIndex].rating;
                    if (rating >= starVal) {
                      return (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      );
                    } else if (rating > starVal - 1) {
                      return (
                        <StarHalf
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      );
                    } else {
                      return (
                        <Star
                          key={i}
                          className="w-4 h-4 text-slate-200"
                        />
                      );
                    }
                  })}
                </div>
                <span className="text-xs font-bold text-slate-450 tracking-wider">
                  {testimonials[currentTestimonialIndex].rating} / 5.0 RATING
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-150 bg-slate-50 py-12 px-6 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <PlanetLogo className="w-8 h-8" />
              <span className="font-extrabold font-display text-base tracking-tight text-slate-900">
                Nexora Learning
              </span>
            </div>
            <div className="flex items-center gap-8 text-xs sm:text-sm text-slate-500 font-medium">
              <button
                onClick={() => setView("privacy-policy")}
                className="hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer font-medium"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setView("terms-of-service")}
                className="hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer font-medium"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setView("contact-support")}
                className="hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
          <div className="border-t border-slate-200/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-slate-400">
            <p>
              © 2026 Nexora Learning Technologies Pvt. Ltd. All rights reserved.
            </p>
            <p>
              Designed for elite scholars.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
