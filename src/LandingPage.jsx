import React, { useState, useEffect, useRef } from "react";

const SCANNABLE_MEALS = [
  {
    id: "adobo",
    name: "Chicken Adobo",
    sub: "1 cup · sample result",
    kcal: 280,
    protein: { g: 28, pct: 75 },
    carbs: { g: 4, pct: 14 },
    fat: { g: 16, pct: 48 },
    icon: "🍲",
  },
  {
    id: "sinigang",
    name: "Pork Sinigang",
    sub: "1 bowl · tamarind broth",
    kcal: 340,
    protein: { g: 26, pct: 70 },
    carbs: { g: 12, pct: 32 },
    fat: { g: 21, pct: 60 },
    icon: "🥣",
  },
  {
    id: "bangus",
    name: "Inihaw na Bangus",
    sub: "1 medium fillet · grilled",
    kcal: 310,
    protein: { g: 34, pct: 88 },
    carbs: { g: 2, pct: 8 },
    fat: { g: 18, pct: 52 },
    icon: "🐟",
  },
  {
    id: "oats",
    name: "Mango Protein Oats",
    sub: "1 bowl · post-workout",
    kcal: 360,
    protein: { g: 25, pct: 68 },
    carbs: { g: 52, pct: 78 },
    fat: { g: 6, pct: 22 },
    icon: "🥭",
  },
];

const COACH_REPLIES = {
  friendly: {
    label: "Friendly 😊",
    text: "Great choice with Chicken Adobo! You just hit 28g of protein. Drink 1 glass of water before your 4 PM dumbbell session—you got this! 💪",
  },
  direct: {
    label: "Direct ⚡",
    text: "280 kcal logged. Remaining today: 64g Protein, 1,120 kcal. Next action: 30-min Upper Body routine + 500ml water.",
  },
  coach: {
    label: "Strict 🔥",
    text: "Solid protein, watch the sodium in the sauce! Hit 3 extra glasses of water this afternoon and don't skip your last set of squats.",
  },
};

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Exact SVG recreation of the uploaded NutriFitAI Apple + 2 Leaves + 4-Plate Dumbbell Logo
function NutriFitLogo({ className = "w-9 h-9" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="nf-apple-cutout">
        <rect width="100" height="100" fill="black" />
        {/* Left Leaf */}
        <path
          d="M48 33 C40 31, 33 24, 32 14 C42 14, 48 21, 48 33 Z"
          fill="white"
        />
        {/* Right Leaf */}
        <path
          d="M49 34 C49 20, 58 10, 72 9 C71 23, 62 32, 49 34 Z"
          fill="white"
        />
        {/* Right Leaf Vein Cutout */}
        <path
          d="M50 33 Q56 22 62 17"
          stroke="black"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Apple Body */}
        <path
          d="M50 36 C41 36, 33 32, 23 36 C11 41, 7 58, 13 75 C18 89, 28 96, 39 96 C44 96, 47 94, 50 94 C53 94, 56 96, 61 96 C72 96, 82 89, 87 75 C93 58, 89 41, 77 36 C67 32, 59 36, 50 36 Z"
          fill="white"
        />
        {/* Dumbbell Cutout Inside Apple */}
        {/* Outer Left Plate */}
        <rect x="21" y="55" width="5.5" height="20" rx="2.75" fill="black" />
        {/* Inner Left Plate */}
        <rect x="29" y="50" width="6.5" height="30" rx="3.25" fill="black" />
        {/* Center Bar */}
        <rect x="34" y="61.5" width="32" height="7" rx="1.5" fill="black" />
        {/* Inner Right Plate */}
        <rect x="64.5" y="50" width="6.5" height="30" rx="3.25" fill="black" />
        {/* Outer Right Plate */}
        <rect x="73.5" y="55" width="5.5" height="20" rx="2.75" fill="black" />
      </mask>
      <rect
        width="100"
        height="100"
        fill="currentColor"
        mask="url(#nf-apple-cutout)"
      />
    </svg>
  );
}

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  // Hero 3D Card Tilt & Meal Scanner State
  const [mealIdx, setMealIdx] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const scannerCardRef = useRef(null);

  // Interactive Bento States
  const [mealSlot, setMealSlot] = useState("Lunch");
  const [coachTone, setCoachTone] = useState("friendly");
  const [equipment, setEquipment] = useState("Dumbbells");
  const [completedSets, setCompletedSets] = useState({ 0: true, 1: false });
  const [waterCount, setWaterCount] = useState(6);

  // Scroll-Driven Feature Animation States
  const featuresSecRef = useRef(null);
  const featureCardRefs = useRef([]);
  const howSecRef = useRef(null);

  const [featureScrollProgress, setFeatureScrollProgress] = useState(0);
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const [cardScrollMetrics, setCardScrollMetrics] = useState([
    { progress: 1, overlapScale: 1 },
    { progress: 0, overlapScale: 1 },
    { progress: 0, overlapScale: 1 },
    { progress: 0, overlapScale: 1 },
  ]);

  // "How it works" Interactive Simulator State
  const [activeStep, setActiveStep] = useState(0);
  const [howScrollLine, setHowScrollLine] = useState(0);
  const [userGoal, setUserGoal] = useState("Build Muscle");
  const [userDiet, setUserDiet] = useState("High Protein");

  // Continuous Scroll-Driven Physics Engine for Features & How It Works
  useEffect(() => {
    let rafId = null;

    const updateScroll = () => {
      const vh = window.innerHeight || 1;

      if (featuresSecRef.current) {
        const secRect = featuresSecRef.current.getBoundingClientRect();
        const totalScrollable = Math.max(secRect.height - vh * 0.4, 1);
        const overall = clamp((vh * 0.75 - secRect.top) / totalScrollable, 0, 1);
        setFeatureScrollProgress(overall);

        let mostCenteredIdx = 0;
        let minDistance = Infinity;

        const nextMetrics = [0, 1, 2, 3].map((idx) => {
          const el = featureCardRefs.current[idx];
          if (!el) return { progress: 1, overlapScale: 1 };
          const r = el.getBoundingClientRect();

          const entranceRaw = clamp((vh * 0.96 - r.top) / (vh * 0.38), 0, 1);
          const progress = 1 - Math.pow(1 - entranceRaw, 3);

          const stickyTop = 98 + idx * 18;
          const pastSticky = clamp((stickyTop - r.top) / 360, 0, 1);
          const overlapScale = 1 - pastSticky * 0.04;

          const cardCenter = r.top + r.height / 2;
          const distFromViewportCenter = Math.abs(cardCenter - vh * 0.5);
          if (distFromViewportCenter < minDistance) {
            minDistance = distFromViewportCenter;
            mostCenteredIdx = idx;
          }

          return { progress, overlapScale };
        });

        setCardScrollMetrics(nextMetrics);
        setActiveFeatureIdx(mostCenteredIdx);
      }

      if (howSecRef.current) {
        const r = howSecRef.current.getBoundingClientRect();
        const prog = clamp((vh * 0.65 - r.top) / Math.max(r.height * 0.7, 1), 0, 1);
        setHowScrollLine(prog);
        if (r.top < vh * 0.65 && r.bottom > vh * 0.3) {
          const stepByScroll = Math.min(2, Math.floor(prog * 3));
          setActiveStep(stepByScroll);
        }
      }
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const currentMeal = SCANNABLE_MEALS[mealIdx];

  const triggerMealScan = (index) => {
    if (index === mealIdx) return;
    setScanning(true);
    setTimeout(() => {
      setMealIdx(index);
      setScanning(false);
    }, 300);
  };

  const handleMouseMove = (e) => {
    const el = scannerCardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Number((-relY * 10).toFixed(2)),
      y: Number((relX * 12).toFixed(2)),
    });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const getFeatureCardStyle = (idx) => {
    const metric = cardScrollMetrics[idx] || { progress: 1, overlapScale: 1 };
    const translateY = (1 - metric.progress) * 68;
    const rotateX = (1 - metric.progress) * 14;
    const scale = (0.9 + 0.1 * metric.progress) * metric.overlapScale;
    const opacity = clamp(0.15 + metric.progress * 0.85, 0, 1);

    return {
      opacity,
      transform: `perspective(1100px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg)`,
    };
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <style>{`
        @keyframes nfLaser {
          0%, 100% { top: 14%; opacity: 0.35; }
          50% { top: 86%; opacity: 0.9; }
        }
        @keyframes nfFloat {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-7px); }
        }
      `}</style>

      {/* Clean Solid Mint Background (No heavy gradients) */}
      <div className="min-h-screen bg-[#d8f8b8] dark:bg-[#0c1810] text-[#112217] dark:text-[#eefdf3] font-sans relative overflow-x-hidden transition-colors duration-300">
        {/* Top Fixed Scroll Progress Bar (Solid Green) */}
        <div className="fixed top-0 inset-x-0 h-1 z-[90] pointer-events-none">
          <div
            className="h-full bg-[#3ea326] transition-[width] duration-75 ease-linear"
            style={{ width: `${featureScrollProgress * 100}%` }}
          />
        </div>

        {/* STICKY NAVBAR */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#d8f8b8]/90 dark:bg-[#0c1810]/90 border-b border-[#3ea326]/15 dark:border-[#4ade80]/15 transition-colors">
          <div className="max-w-[1160px] mx-auto px-6 h-[72px] flex items-center justify-between">
            <a
              href="#top"
              className="group inline-flex items-center gap-2 text-[#2d8a1a] dark:text-[#4ade80] font-extrabold text-xl tracking-tight no-underline"
            >
              <NutriFitLogo className="w-9 h-9 text-[#3b9c24] dark:text-[#4ade80] transition-transform duration-200 group-hover:scale-105" />
              <span className="text-[#219628] dark:text-[#4ade80]">NutriFitAI</span>
            </a>

            <nav className="hidden sm:flex items-center gap-2">
              <a
                href="#features"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-[#112217] dark:text-[#eefdf3] border border-transparent hover:border-[#112217] dark:hover:border-[#4ade80] hover:bg-white/30 dark:hover:bg-white/5 transition-all"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-[#112217] dark:text-[#eefdf3] border border-transparent hover:border-[#112217] dark:hover:border-[#4ade80] hover:bg-white/30 dark:hover:bg-white/5 transition-all"
              >
                How it works
              </a>
            </nav>

            <div className="flex items-center gap-3.5">
              <a
                href="#login"
                className="text-sm font-semibold text-[#112217] dark:text-[#eefdf3] hover:opacity-80"
              >
                Log in
              </a>
              <a
                href="#ready"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold bg-[#3ca324] hover:bg-[#31871c] text-white shadow-sm hover:-translate-y-0.5 transition-all"
              >
                Get started
              </a>
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                aria-label="Toggle color mode"
                className="w-9 h-9 rounded-full border border-[#3ea326]/25 dark:border-[#4ade80]/25 bg-white/75 dark:bg-[#15291c]/80 inline-flex items-center justify-center text-sm hover:scale-110 transition-transform cursor-pointer"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="py-16 lg:py-20 relative z-10" id="top">
          <div className="max-w-[1160px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            {/* Left Column */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#1c7c19] dark:text-[#86efac] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                SCAN. UNDERSTAND. IMPROVE.
              </div>

              {/* Solid Dark Text matching Screenshot 1 (No text gradient) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black leading-[1.08] tracking-tight text-[#122023] dark:text-white mb-5">
                Your Food. Your Fitness. Your Future.
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-[#425849] dark:text-[#98b5a2] max-w-[500px] mx-auto lg:mx-0 mb-7">
                One app to scan your meals, chat with an AI coach that knows your
                goals, and track workouts, steps and water.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                <a
                  href="#ready"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold bg-[#3ca324] hover:bg-[#31871c] text-white shadow-sm hover:-translate-y-0.5 transition-all"
                >
                  Get started free
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-bold border border-[#3ca324] text-[#122023] dark:text-white bg-transparent hover:bg-white/50 dark:hover:bg-[#15291c] hover:-translate-y-0.5 transition-all"
                >
                  See how it works
                </a>
              </div>

              <a
                href="#android-apk"
                className="inline-flex items-center gap-3 bg-white dark:bg-[#15291c] border border-[#3ea326]/20 dark:border-[#4ade80]/20 px-4 py-2.5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform"
              >
                <span className="text-[#16a34a] flex">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.6 11.48 L19.44 8.3a.63.63 0 0 0-1.09-.63l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 7.67a.63.63 0 0 0-1.09.63l1.84 3.18C3.5 13.05 1.56 15.97 1.5 19.5h21c-.06-3.53-2-6.45-4.9-8.02zM7 16.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
                  </svg>
                </span>
                <div className="flex flex-col text-left leading-tight">
                  <strong className="text-xs sm:text-sm">Download for Android</strong>
                  <span className="text-[11px] text-[#4b6353] dark:text-[#98b5a2]">
                    APK, Android 8 or newer
                  </span>
                </div>
                <span className="w-6 h-6 rounded-md bg-[#3ea326]/10 text-[#3ea326] dark:text-[#4ade80] inline-flex items-center justify-center font-bold text-xs">
                  ↓
                </span>
              </a>
            </div>

            {/* Right Column: 3D Interactive Meal Scanner Card */}
            <div className="relative flex justify-center">
              <div
                className="hidden sm:flex absolute -top-4 -left-3 z-20 bg-white dark:bg-[#15291c] border border-[#3ea326]/20 dark:border-[#4ade80]/20 rounded-2xl px-3.5 py-2.5 items-center gap-2.5 shadow-md"
                style={{ animation: "nfFloat 4s ease-in-out infinite alternate" }}
              >
                <span className="text-lg">✨</span>
                <div className="flex flex-col leading-tight">
                  <strong className="text-xs">AI Vision Active</strong>
                  <small className="text-[11px] text-[#4b6353] dark:text-[#98b5a2]">
                    98.4% dish accuracy
                  </small>
                </div>
              </div>

              <div
                className="hidden sm:flex absolute bottom-6 -right-4 z-20 bg-white dark:bg-[#15291c] border border-[#3ea326]/20 dark:border-[#4ade80]/20 rounded-2xl px-3.5 py-2.5 items-center gap-2.5 shadow-md"
                style={{ animation: "nfFloat 4s ease-in-out -2s infinite alternate" }}
              >
                <span className="text-lg">💧</span>
                <div className="flex flex-col leading-tight">
                  <strong className="text-xs">Hydration Synced</strong>
                  <small className="text-[11px] text-[#4b6353] dark:text-[#98b5a2]">
                    {waterCount} / 8 glasses today
                  </small>
                </div>
              </div>

              <div
                ref={scannerCardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={resetTilt}
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                }}
                className="w-full max-w-[420px] bg-white dark:bg-[#15291c] rounded-[22px] border border-[#3ea326]/20 dark:border-[#4ade80]/20 shadow-[0_18px_40px_-14px_rgba(21,68,12,0.14)] overflow-hidden transition-transform duration-150 ease-out will-change-transform"
              >
                {/* Solid Light-Mint Viewfinder Stage (No gradient) */}
                <div className="relative h-[210px] bg-[#effdf2] dark:bg-[#112418] flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-x-[10%] h-0.5 bg-[#22c55e]/70"
                    style={{ animation: "nfLaser 3.2s ease-in-out infinite" }}
                  />

                  <span className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#15803d] dark:border-[#4ade80] rounded-tl" />
                  <span className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#15803d] dark:border-[#4ade80] rounded-tr" />
                  <span className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#15803d] dark:border-[#4ade80] rounded-bl" />
                  <span className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#15803d] dark:border-[#4ade80] rounded-br" />

                  <div
                    className={`relative z-10 flex flex-col items-center gap-3 transition-all duration-200 ${
                      scanning ? "opacity-25 scale-90" : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#15291c] flex items-center justify-center text-2xl shadow-sm">
                      {currentMeal.icon}
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white dark:bg-[#15291c] px-3.5 py-1 rounded-full text-xs font-bold shadow-sm">
                      <span className="w-4 h-4 rounded-full bg-[#3ea326] text-white text-[10px] inline-flex items-center justify-center">
                        ✓
                      </span>
                      <span>{currentMeal.name}</span>
                    </div>
                  </div>
                </div>

                {/* Meal Switcher Strip */}
                <div className="px-4 py-2.5 bg-[#f7fff9] dark:bg-[#112217] border-y border-[#3ea326]/15 dark:border-[#4ade80]/15 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-[#4b6353] dark:text-[#98b5a2]">
                    Tap to scan meal:
                  </span>
                  <div className="flex gap-1.5">
                    {SCANNABLE_MEALS.map((meal, index) => (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => triggerMealScan(index)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                          mealIdx === index
                            ? "bg-[#3ca324] text-white border-[#3ca324]"
                            : "bg-white dark:bg-[#15291c] text-[#112217] dark:text-[#eefdf3] border-[#3ea326]/20"
                        }`}
                      >
                        {meal.icon} {meal.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nutrition Breakdown Body */}
                <div className="p-5 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold m-0">{currentMeal.name}</h3>
                      <p className="text-xs text-[#4b6353] dark:text-[#98b5a2] m-0">
                        {currentMeal.sub}
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-3xl font-black">
                        {currentMeal.kcal}
                      </strong>
                      <span className="text-xs text-[#4b6353] dark:text-[#98b5a2] ml-1">
                        kcal
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="grid grid-cols-[58px_1fr_38px] items-center gap-2.5 text-xs">
                      <span className="font-semibold text-[#4b6353] dark:text-[#98b5a2]">
                        Protein
                      </span>
                      <div className="h-2 bg-[#e7f7e4] dark:bg-[#3ea326]/15 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3ca324] rounded-full transition-[width] duration-500 ease-out"
                          style={{ width: `${currentMeal.protein.pct}%` }}
                        />
                      </div>
                      <strong className="text-right">{currentMeal.protein.g}g</strong>
                    </div>

                    <div className="grid grid-cols-[58px_1fr_38px] items-center gap-2.5 text-xs">
                      <span className="font-semibold text-[#4b6353] dark:text-[#98b5a2]">
                        Carbs
                      </span>
                      <div className="h-2 bg-[#e7f7e4] dark:bg-[#3ea326]/15 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#f58a1f] rounded-full transition-[width] duration-500 ease-out"
                          style={{ width: `${currentMeal.carbs.pct}%` }}
                        />
                      </div>
                      <strong className="text-right">{currentMeal.carbs.g}g</strong>
                    </div>

                    <div className="grid grid-cols-[58px_1fr_38px] items-center gap-2.5 text-xs">
                      <span className="font-semibold text-[#4b6353] dark:text-[#98b5a2]">
                        Fat
                      </span>
                      <div className="h-2 bg-[#e7f7e4] dark:bg-[#3ea326]/15 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2b7fff] rounded-full transition-[width] duration-500 ease-out"
                          style={{ width: `${currentMeal.fat.pct}%` }}
                        />
                      </div>
                      <strong className="text-right">{currentMeal.fat.g}g</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION WITH SCROLL-DRIVEN 3D ENTRANCE & SYNC RAIL */}
        <section
          ref={featuresSecRef}
          className="py-20 bg-[#f4fvee] bg-[#f3fbee] dark:bg-[#101f15] relative z-10 transition-colors"
          id="features"
        >
          <div className="max-w-[1160px] mx-auto px-6">
            <div className="text-center max-w-[620px] mx-auto mb-12">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest text-[#3ca324] dark:text-[#4ade80] bg-[#3ca324]/10 px-3.5 py-1.5 rounded-full mb-3">
                <span className="w-2 h-2 rounded-full bg-[#3ca324]" />
                SCROLL SYNC · {Math.round(featureScrollProgress * 100)}%
              </span>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2.5">
                Everything you need, in one app
              </h2>
              <p className="text-base text-[#4b6353] dark:text-[#98b5a2]">
                Log it once and it shows up everywhere, from your dashboard to
                your coach.
              </p>

              <div className="flex justify-center flex-wrap gap-2 mt-5">
                {[
                  "01 Food Scanner",
                  "02 AI Coach",
                  "03 Workout Tracking",
                  "04 Progress Tracking",
                ].map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      featureCardRefs.current[idx]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      activeFeatureIdx === idx
                        ? "bg-[#3ca324] text-white border-[#3ca324] -translate-y-0.5 shadow-sm"
                        : "bg-white dark:bg-[#15291c] text-[#4b6353] dark:text-[#98b5a2] border-[#3ea326]/20"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative pl-6 sm:pl-7">
              {/* Vertical Scroll Sync Rail (Solid Green) */}
              <div
                className="absolute left-1 top-3 bottom-3 w-1 rounded-full bg-[#3ca324]/15 overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="w-full rounded-full bg-[#3ca324] transition-[height] duration-100 ease-linear"
                  style={{ height: `${featureScrollProgress * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card 0: Wide Food Scanner Card */}
                <article
                  ref={(el) => (featureCardRefs.current[0] = el)}
                  style={getFeatureCardStyle(0)}
                  className={`lg:col-span-3 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-7 items-center bg-white dark:bg-[#15291c] rounded-2xl p-6 sm:p-7 border transition-shadow duration-300 origin-top will-change-transform ${
                    activeFeatureIdx === 0
                      ? "border-[#3ca324] dark:border-[#4ade80] shadow-md"
                      : "border-[#3ea326]/20 dark:border-[#4ade80]/20 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#e3f9df] dark:bg-[#22c55e]/15 text-[#16a34a] dark:text-[#4ade80] inline-flex items-center justify-center">
                        <svg
                          viewBox="0 0 24 24"
                          width="22"
                          height="22"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-extrabold tracking-widest text-[#3ca324] dark:text-[#4ade80] bg-[#3ca324]/10 px-2.5 py-1 rounded-full">
                        01 / SCAN
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">Food Scanner</h3>
                    <p className="text-sm leading-relaxed text-[#4b6353] dark:text-[#98b5a2] mb-4">
                      Snap a photo of your meal and get the calories, protein,
                      carbs and fat in each serving. Save it as breakfast, lunch,
                      dinner or a snack, and see how your day compares to your
                      daily targets.
                    </p>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-[#4b6353] dark:text-[#98b5a2]">
                        Log sample meal to:
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {["Breakfast", "Lunch", "Dinner", "Snack"].map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setMealSlot(slot)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              mealSlot === slot
                                ? "bg-[#3ca324] text-white border-[#3ca324]"
                                : "bg-transparent text-[#112217] dark:text-[#eefdf3] border-[#3ea326]/25"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Daily Ring Sync Widget */}
                  <div className="bg-[#f4fbf0] dark:bg-[#112217] border border-[#3ea326]/20 rounded-2xl p-5 flex items-center gap-5">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          className="fill-none stroke-[#3ea326]/15 stroke-[10]"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          className="fill-none stroke-[#3ca324] dark:stroke-[#4ade80] stroke-[10] [stroke-linecap:round] transition-[stroke-dashoffset] duration-500 ease-out"
                          strokeDasharray="301.6"
                          strokeDashoffset={
                            301.6 -
                            (mealSlot === "Breakfast"
                              ? 121
                              : mealSlot === "Lunch"
                              ? 196
                              : mealSlot === "Dinner"
                              ? 263
                              : 226) *
                              (cardScrollMetrics[0]?.progress ?? 1)
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <strong className="text-lg">
                          {mealSlot === "Breakfast"
                            ? "40%"
                            : mealSlot === "Lunch"
                            ? "65%"
                            : mealSlot === "Dinner"
                            ? "88%"
                            : "75%"}
                        </strong>
                        <small className="text-[10px] text-[#4b6353] dark:text-[#98b5a2]">
                          Daily Target
                        </small>
                      </div>
                    </div>

                    <div>
                      <span className="inline-block text-[11px] font-bold text-[#3ca324] dark:text-[#4ade80] bg-[#3ca324]/15 px-2.5 py-0.5 rounded-full mb-1.5">
                        ✓ Saved to {mealSlot}
                      </span>
                      <h4 className="text-base font-bold mb-1">
                        Chicken Adobo (+280 kcal)
                      </h4>
                      <p className="text-xs text-[#4b6353] dark:text-[#98b5a2] m-0">
                        Automatically synced to your daily macro ring and AI Coach
                        memory.
                      </p>
                    </div>
                  </div>
                </article>

                {/* Card 1: AI Coach */}
                <article
                  ref={(el) => (featureCardRefs.current[1] = el)}
                  style={getFeatureCardStyle(1)}
                  className={`flex flex-col bg-white dark:bg-[#15291c] rounded-2xl p-6 border transition-shadow duration-300 origin-top will-change-transform ${
                    activeFeatureIdx === 1
                      ? "border-[#3ca324] dark:border-[#4ade80] shadow-md"
                      : "border-[#3ea326]/20 dark:border-[#4ade80]/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#f5e8ff] dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 inline-flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-extrabold tracking-widest text-[#3ca324] dark:text-[#4ade80] bg-[#3ca324]/10 px-2.5 py-1 rounded-full">
                      02 / COACH
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">AI Coach</h3>
                  <p className="text-sm leading-relaxed text-[#4b6353] dark:text-[#98b5a2] mb-4">
                    Ask anything about food, workouts or progress. Your coach
                    already knows your goals, diet and any health conditions
                    you've shared, and replies in the tone you pick:
                  </p>

                  <div className="mt-auto pt-3.5 border-t border-dashed border-[#3ea326]/25">
                    <div className="flex gap-1.5 mb-2.5">
                      {Object.entries(COACH_REPLIES).map(([key, item]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCoachTone(key)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            coachTone === key
                              ? "bg-[#3ca324] text-white border-[#3ca324]"
                              : "bg-transparent text-[#112217] dark:text-[#eefdf3] border-[#3ea326]/20"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div
                      key={coachTone}
                      className="bg-[#f9f2ff] dark:bg-purple-500/10 border-l-[3px] border-purple-600 rounded-lg p-2.5 text-xs leading-relaxed"
                    >
                      {COACH_REPLIES[coachTone].text}
                    </div>
                  </div>
                </article>

                {/* Card 2: Workout Tracking */}
                <article
                  ref={(el) => (featureCardRefs.current[2] = el)}
                  style={getFeatureCardStyle(2)}
                  className={`flex flex-col bg-white dark:bg-[#15291c] rounded-2xl p-6 border transition-shadow duration-300 origin-top will-change-transform ${
                    activeFeatureIdx === 2
                      ? "border-[#3ca324] dark:border-[#4ade80] shadow-md"
                      : "border-[#3ea326]/20 dark:border-[#4ade80]/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#fff2dd] dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-extrabold tracking-widest text-[#3ca324] dark:text-[#4ade80] bg-[#3ca324]/10 px-2.5 py-1 rounded-full">
                      03 / TRAIN
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">Workout Tracking</h3>
                  <p className="text-sm leading-relaxed text-[#4b6353] dark:text-[#98b5a2] mb-4">
                    Browse routines and single exercises, filtered by the
                    equipment you have. Log each session as you go, save your
                    favorites, and look back at past workouts any time.
                  </p>

                  <div className="mt-auto pt-3.5 border-t border-dashed border-[#3ea326]/25">
                    <div className="flex gap-1.5 mb-2.5">
                      {["Dumbbells", "Bodyweight", "Full Gym"].map((eq) => (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => setEquipment(eq)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            equipment === eq
                              ? "bg-[#3ca324] text-white border-[#3ca324]"
                              : "bg-transparent text-[#112217] dark:text-[#eefdf3] border-[#3ea326]/20"
                          }`}
                        >
                          {eq}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      {[
                        {
                          name:
                            equipment === "Dumbbells"
                              ? "DB Goblet Squat"
                              : equipment === "Bodyweight"
                              ? "Tempo Push-Ups"
                              : "Barbell Bench Press",
                          meta: "3 sets × 12 reps",
                        },
                        {
                          name:
                            equipment === "Dumbbells"
                              ? "Seated Shoulder Press"
                              : equipment === "Bodyweight"
                              ? "Walking Lunges"
                              : "Lat Pulldown",
                          meta: "3 sets × 10 reps",
                        },
                      ].map((ex, i) => (
                        <label
                          key={ex.name}
                          className="flex items-center gap-2 bg-[#fff8ec] dark:bg-amber-500/10 px-2.5 py-2 rounded-lg text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={!!completedSets[i]}
                            onChange={() =>
                              setCompletedSets((prev) => ({
                                ...prev,
                                [i]: !prev[i],
                              }))
                            }
                            className="accent-[#3ca324]"
                          />
                          <span className="flex-1 font-semibold">{ex.name}</span>
                          <small className="text-[#4b6353] dark:text-[#98b5a2]">
                            {ex.meta}
                          </small>
                        </label>
                      ))}
                    </div>
                  </div>
                </article>

                {/* Card 3: Progress Tracking */}
                <article
                  ref={(el) => (featureCardRefs.current[3] = el)}
                  style={getFeatureCardStyle(3)}
                  className={`flex flex-col bg-white dark:bg-[#15291c] rounded-2xl p-6 border transition-shadow duration-300 origin-top will-change-transform ${
                    activeFeatureIdx === 3
                      ? "border-[#3ca324] dark:border-[#4ade80] shadow-md"
                      : "border-[#3ea326]/20 dark:border-[#4ade80]/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#e6f0ff] dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 inline-flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-extrabold tracking-widest text-[#3ca324] dark:text-[#4ade80] bg-[#3ca324]/10 px-2.5 py-1 rounded-full">
                      04 / TRACK
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                  <p className="text-sm leading-relaxed text-[#4b6353] dark:text-[#98b5a2] mb-4">
                    Track your weight against your target, sync your steps and
                    count your glasses of water. Charts show the trend over weeks,
                    and gentle reminders nudge you when a goal is slipping.
                  </p>

                  <div className="mt-auto pt-3.5 border-t border-dashed border-[#3ea326]/25">
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span>💧 Water ({waterCount}/8 glasses)</span>
                      <button
                        type="button"
                        onClick={() =>
                          setWaterCount((c) => (c < 8 ? c + 1 : 1))
                        }
                        className="bg-[#e6f0ff] dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[11px] font-bold px-2.5 py-1 rounded-md cursor-pointer"
                      >
                        + Add glass
                      </button>
                    </div>

                    <div className="grid grid-cols-8 gap-1.5 mb-2.5">
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setWaterCount(idx + 1)}
                          aria-label={`Set ${idx + 1} glasses`}
                          className={`h-5 rounded border transition-all cursor-pointer ${
                            idx < waterCount
                              ? "bg-blue-500 border-blue-600"
                              : "bg-transparent border-blue-500/35"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs bg-[#f0f6ff] dark:bg-blue-500/10 px-2.5 py-2 rounded-lg">
                      <span>
                        Weight trend: <strong>-2.1 kg</strong>
                      </span>
                      <span className="font-bold text-[#3ca324] dark:text-[#4ade80]">
                        👟 8,940 steps
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section ref={howSecRef} className="py-20 relative z-10" id="how-it-works">
          <div className="max-w-[1160px] mx-auto px-6">
            <div className="text-center max-w-[600px] mx-auto mb-8">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2.5">
                How it works
              </h2>
              <p className="text-base text-[#4b6353] dark:text-[#98b5a2]">
                Three steps from signing up to knowing what to do next.
              </p>
            </div>

            <div className="max-w-[420px] h-1 bg-[#3ca324]/15 rounded-full mx-auto mb-9 overflow-hidden">
              <div
                className="h-full bg-[#3ca324] transition-[width] duration-150 ease-linear"
                style={{ width: `${howScrollLine * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-stretch">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    num: "01",
                    title: "Tell us about you",
                    desc: "Share your goal, diet and activity level, plus any allergies or health conditions. Everything you see is shaped by it.",
                  },
                  {
                    num: "02",
                    title: "Scan and log",
                    desc: "Snap a meal, log a workout, add your water and sync your steps. Each one takes a few seconds.",
                  },
                  {
                    num: "03",
                    title: "Get coached",
                    desc: "Your AI coach reads your numbers and tells you what to do next, in a tone you choose.",
                  },
                ].map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <div
                      key={step.num}
                      onClick={() => setActiveStep(idx)}
                      onMouseEnter={() => setActiveStep(idx)}
                      className={`rounded-2xl p-5 border transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-[#15291c] border-[#3ca324] dark:border-[#4ade80] shadow-md -translate-y-1"
                          : "bg-white/70 dark:bg-[#15291c]/70 border-[#3ea326]/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-3.5">
                        <span className="text-sm font-extrabold text-[#3ca324] dark:text-[#4ade80]">
                          {step.num}
                        </span>
                        <div className="flex-1 h-0.5 bg-[#3ca324]/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-[#3ca324] transition-[width] duration-500 ${
                              isActive ? "w-full" : "w-0"
                            }`}
                          />
                        </div>
                      </div>
                      <h3 className="text-base font-bold mb-2">{step.title}</h3>
                      <p className="text-xs leading-relaxed text-[#4b6353] dark:text-[#98b5a2] m-0">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Live Morphing App Simulator Card */}
              <div className="bg-white dark:bg-[#15291c] border border-[#3ea326]/20 dark:border-[#4ade80]/20 rounded-2xl p-6 shadow-md flex flex-col">
                <div className="flex items-center gap-1.5 pb-3.5 border-b border-[#3ea326]/20 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3ca324]/35" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3ca324]/35" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3ca324]/35" />
                  <strong className="ml-auto text-xs text-[#3ca324] dark:text-[#4ade80] bg-[#3ca324]/10 px-2.5 py-1 rounded-full">
                    Step 0{activeStep + 1} Live Preview
                  </strong>
                </div>

                {activeStep === 0 && (
                  <div key="step-0" className="space-y-3">
                    <div>
                      <h4 className="text-lg font-bold m-0">
                        Personalize Your Profile
                      </h4>
                      <p className="text-xs text-[#4b6353] dark:text-[#98b5a2] m-0">
                        Pick your goal &amp; diet to see how NutriFitAI adapts:
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4b6353] dark:text-[#98b5a2] mb-1.5">
                        Primary Goal
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {["Lose Weight", "Build Muscle", "Stay Fit"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setUserGoal(g)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
                              userGoal === g
                                ? "bg-[#3ca324] text-white border-[#3ca324]"
                                : "bg-transparent border-[#3ea326]/25"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4b6353] dark:text-[#98b5a2] mb-1.5">
                        Diet Preference
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {["High Protein", "Balanced", "Low Carb"].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setUserDiet(d)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
                              userDiet === d
                                ? "bg-[#3ca324] text-white border-[#3ca324]"
                                : "bg-transparent border-[#3ea326]/25"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#f4fbf0] dark:bg-[#3ca324]/10 px-3 py-2.5 rounded-xl text-xs">
                      🎯 Target calculated: <strong>2,150 kcal/day</strong> ·{" "}
                      <strong>145g Protein</strong>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div key="step-1" className="space-y-2.5">
                    <div>
                      <h4 className="text-lg font-bold m-0">
                        One-Tap Daily Logging
                      </h4>
                      <p className="text-xs text-[#4b6353] dark:text-[#98b5a2] m-0">
                        Everything you log updates your dashboard in seconds:
                      </p>
                    </div>

                    <div className="flex justify-between items-center bg-[#f4fbf0] dark:bg-[#3ca324]/10 px-3 py-2.5 rounded-xl text-xs">
                      <span>🍲 Chicken Adobo (Lunch)</span>
                      <strong>+280 kcal · 28g P</strong>
                    </div>
                    <div className="flex justify-between items-center bg-[#f4fbf0] dark:bg-[#3ca324]/10 px-3 py-2.5 rounded-xl text-xs">
                      <span>🏋️ Dumbbell Upper Body</span>
                      <strong>35 mins · 310 kcal</strong>
                    </div>
                    <div className="flex justify-between items-center bg-[#f4fbf0] dark:bg-[#3ca324]/10 px-3 py-2.5 rounded-xl text-xs">
                      <span>💧 Hydration &amp; Steps</span>
                      <strong>{waterCount} glasses · 8,940 steps</strong>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div key="step-2" className="space-y-3">
                    <div>
                      <h4 className="text-lg font-bold m-0">
                        AI Coach Action Plan
                      </h4>
                      <p className="text-xs text-[#4b6353] dark:text-[#98b5a2] m-0">
                        Tailored to your <strong>{userGoal}</strong> &amp;{" "}
                        <strong>{userDiet}</strong> profile:
                      </p>
                    </div>

                    <div className="bg-[#f4fbf0] dark:bg-[#3ca324]/10 border-l-[3px] border-[#3ca324] p-3.5 rounded-xl">
                      <div className="flex justify-between text-xs font-bold text-[#3ca324] dark:text-[#4ade80] mb-1.5">
                        <span>🤖 NutriFit AI Coach</span>
                        <small>Just now</small>
                      </div>
                      <p className="text-xs leading-relaxed m-0">
                        "Since your goal is <strong>{userGoal}</strong> on a{" "}
                        <strong>{userDiet}</strong> plan, your Chicken Adobo
                        lunch put you at 74% of your afternoon protein target.
                        Have a high-protein snack + 2 glasses of water before
                        dinner!"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* READY TO START CTA BANNER (Solid Dark Green matching Screenshot 4) */}
        <section className="py-10 pb-20 relative z-10" id="ready">
          <div className="max-w-[1160px] mx-auto px-6">
            <div className="bg-[#1e5c0c] dark:bg-[#144623] text-white rounded-2xl py-16 px-6 text-center flex flex-col items-center shadow-lg">
              <h2 className="text-3xl sm:text-4xl font-black mb-2">
                Ready to start?
              </h2>
              <p className="text-base text-white/85 mb-6">
                Create your account and set your goals.
              </p>

              <a
                href="#signup"
                className="bg-white text-[#1e5c0c] font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-lg shadow-sm hover:-translate-y-0.5 transition-transform"
              >
                Create your account
              </a>

              <a
                href="#android-apk"
                className="mt-4 inline-flex items-center gap-1.5 text-white/90 text-xs sm:text-sm font-semibold hover:underline"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.6 11.48 L19.44 8.3a.63.63 0 0 0-1.09-.63l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 7.67a.63.63 0 0 0-1.09.63l1.84 3.18C3.5 13.05 1.56 15.97 1.5 19.5h21c-.06-3.53-2-6.45-4.9-8.02z" />
                </svg>
                Or download the Android app
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#1e5c0c] text-white/85 py-8 text-center relative z-10">
          <div className="max-w-[1160px] mx-auto px-6 flex flex-col gap-3 items-center">
            <a href="#terms" className="text-white font-bold text-sm hover:underline">
              Terms of Service &amp; Privacy Policy
            </a>
            <p className="m-0 text-xs opacity-80">
              © 2026 NutriFitAI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
