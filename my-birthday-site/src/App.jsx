import { useState, useEffect, useRef, useCallback } from "react";

// ─── Custom cursor sparkle trail ───────────────────────────────────────────
function CursorTrail() {
  const [sparks, setSparks] = useState([]);
  const counter = useRef(0);

  useEffect(() => {
    const onMove = (e) => {
      const id = counter.current++;
      setSparks((prev) => [
        ...prev.slice(-30),
        { id, x: e.clientX, y: e.clientY, size: Math.random() * 8 + 4 },
      ]);
      setTimeout(() => setSparks((p) => p.filter((s) => s.id !== id)), 800);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 9999 }}>
      {sparks.map((s) => (
        <div
          key={s.id}
          style={{
            position: "fixed",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            transform: "translate(-50%,-50%)",
            animation: "sparkFade 0.8s ease-out forwards",
            fontSize: s.size,
            lineHeight: 1,
            color: ["#FF69B4", "#D4AF37", "#FFB6C1", "#FF1493"][Math.floor(Math.random() * 4)],
          }}
        >
          ♥
        </div>
      ))}
      <style>{`
        @keyframes sparkFade { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-80%) scale(0.3)} }
        * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M16 28 C16 28 4 18 4 11 C4 7 7 4 11 4 C13.5 4 15.5 5.5 16 7 C16.5 5.5 18.5 4 21 4 C25 4 28 7 28 11 C28 18 16 28 16 28Z' fill='%23FF69B4' stroke='%23D4AF37' stroke-width='1.5'/%3E%3C/svg%3E") 16 16, auto !important; }
      `}</style>
    </div>
  );
}

// ─── Confetti hearts ────────────────────────────────────────────────────────
function ConfettiHearts({ active }) {
  const pieces = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 3 + Math.random() * 4,
      size: 10 + Math.random() * 16,
      color: ["#FF69B4", "#FFB6C1", "#D4AF37", "#FF1493", "#FFC0CB"][i % 5],
      rot: Math.random() * 360,
    }))
  ).current;

  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      <style>{`
        @keyframes fall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: 0,
            fontSize: p.size,
            color: p.color,
            animation: `fall ${p.dur}s ${p.delay}s ease-in infinite`,
          }}
        >
          ♥
        </div>
      ))}
    </div>
  );
}

// ─── Fireworks ──────────────────────────────────────────────────────────────
function Fireworks({ active, onEnd }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#FF69B4", "#D4AF37", "#FF1493", "#FFB6C1", "#FFF0F5", "#FF6B6B", "#FFD700"];
    const hearts = ["♥", "★", "✦", "♡"];

    function burst(x, y) {
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60;
        const speed = 2 + Math.random() * 5;
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          sym: hearts[Math.floor(Math.random() * hearts.length)],
          size: 12 + Math.random() * 16,
        });
      }
    }

    const launches = [
      [0.2, 0.7], [0.5, 0.6], [0.8, 0.7],
      [0.35, 0.5], [0.65, 0.5], [0.5, 0.4],
    ];
    launches.forEach(([rx, ry], i) =>
      setTimeout(() => burst(rx * canvas.width, ry * canvas.height), i * 300)
    );

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.alpha > 0.02);
      for (const p of particles.current) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.sym, p.x, p.y);
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha -= 0.015;
      }
      ctx.globalAlpha = 1;
      if (particles.current.length > 0) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        onEnd();
      }
    }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, onEnd]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none" }}
    />
  );
}

// ─── Envelope / Letter ──────────────────────────────────────────────────────
function EnvelopeLetter() {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => setRevealed(true), 700);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      {!revealed ? (
        <div
          onClick={!open ? handleOpen : undefined}
          style={{
            width: 280,
            height: 180,
            position: "relative",
            cursor: open ? "default" : "pointer",
            filter: "drop-shadow(0 8px 32px rgba(212,175,55,0.35))",
          }}
        >
          <style>{`
            @keyframes lidOpen { 0%{transform:rotateX(0)} 100%{transform:rotateX(-180deg)} }
            .lid-open { animation: lidOpen 0.7s ease-out forwards; transform-origin: top center; }
            @keyframes envPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
            .env-idle { animation: envPulse 2s ease-in-out infinite; }
          `}</style>
          <div className={open ? "" : "env-idle"} style={{ width: "100%", height: "100%" }}>
            <svg viewBox="0 0 280 180" style={{ width: "100%", height: "100%" }}>
              <defs>
                <linearGradient id="envGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFF0F5" />
                  <stop offset="100%" stopColor="#FFD6E8" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="276" height="176" rx="12" fill="url(#envGrad)" stroke="#D4AF37" strokeWidth="2.5" />
              <polygon points="2,178 140,95 278,178" fill="#FFB6C1" stroke="#D4AF37" strokeWidth="1.5" />
              <polygon points="2,2 140,95 2,178" fill="#FFC0CB" stroke="#D4AF37" strokeWidth="1" opacity="0.7" />
              <polygon points="278,2 140,95 278,178" fill="#FFC0CB" stroke="#D4AF37" strokeWidth="1" opacity="0.7" />
              <polygon
                className={open ? "lid-open" : ""}
                points="2,2 278,2 140,95"
                fill="#FFD6E8"
                stroke="#D4AF37"
                strokeWidth="1.5"
              />
              <circle cx="140" cy="90" r="22" fill="#D4AF37" opacity="0.9" />
              <text x="140" y="97" textAnchor="middle" fontSize="18" fill="#FFF0F5">♥</text>
            </svg>
          </div>
          {!open && (
            <div style={{
              position: "absolute", bottom: -36, left: "50%", transform: "translateX(-50%)",
              background: "linear-gradient(135deg,#FF69B4,#D4AF37)",
              color: "#fff", padding: "8px 28px", borderRadius: 24,
              fontFamily: "'Georgia', serif", fontSize: 14, letterSpacing: 1,
              whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(255,105,180,0.4)",
            }}>
              ✉ Open Me
            </div>
          )}
        </div>
      ) : null}

      {revealed && (
        <div style={{
          maxWidth: 560,
          width: "100%",
          background: "linear-gradient(135deg,#FFFDF0 0%,#FFF8E7 50%,#FFFDF0 100%)",
          border: "2px solid #D4AF37",
          borderRadius: 16,
          padding: "40px 36px",
          boxShadow: "0 12px 48px rgba(212,175,55,0.2), inset 0 0 60px rgba(255,240,245,0.5)",
          position: "relative",
          animation: "letterReveal 0.6s ease-out",
        }}>
          <style>{`
            @keyframes letterReveal { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
          `}</style>
          {["top-left","top-right","bottom-left","bottom-right"].map((pos) => (
            <div key={pos} style={{
              position: "absolute",
              [pos.includes("top") ? "top" : "bottom"]: 12,
              [pos.includes("left") ? "left" : "right"]: 12,
              fontSize: 20, color: "#D4AF37", opacity: 0.5,
            }}>❧</div>
          ))}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 32, color: "#FF69B4", marginBottom: 8 }}>♥</div>
            <div style={{ fontFamily: "'Georgia',serif", fontSize: 13, color: "#B8860B", letterSpacing: 2, textTransform: "uppercase" }}>
              A Letter of Love
            </div>
          </div>
          <p style={{ fontFamily: "'Georgia',serif", fontSize: 17, lineHeight: 1.9, color: "#5C3D2E", marginBottom: 16 }}>
            <em>To the woman who makes every day brighter...</em>
          </p>
          {[
            "On this most beautiful of days, I find myself pausing to think about every smile you've gifted the world, every laugh that fills a room with pure light, and every quiet moment where just your presence made everything feel right.",
            "Your infectious laugh is one of life's greatest melodies — the kind that starts in your eyes before it even reaches your lips. It draws people in, makes strangers feel like old friends, and turns ordinary Tuesday afternoons into memories worth keeping forever.",
            "I think about our favorite adventures — the ones planned down to the last detail that went delightfully sideways, the spontaneous ones that became the stories we tell the most, and the small everyday ones: a walk, a coffee, a long conversation that stretches past midnight.",
            "The way you light up a room isn't something you try to do. It's simply who you are — a warmth that exists in the way you listen, the thoughtfulness in how you care, the courage in how you dream.",
            "Today belongs to you. Every candle, every wish, every beautiful moment — it's all yours. You deserve celebrations that match the size of the joy you bring to this world.",
            "Happy Birthday, darling. May this year be as extraordinary as you are. 🌹",
          ].map((para, i) => (
            <p key={i} style={{ fontFamily: "'Georgia',serif", fontSize: 15.5, lineHeight: 1.85, color: "#5C3D2E", marginBottom: 14 }}>
              {para}
            </p>
          ))}
          <div style={{ textAlign: "right", marginTop: 24, fontFamily: "'Georgia',serif", fontSize: 15, color: "#D4AF37", fontStyle: "italic" }}>
            — With all my heart ♥
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Memory Gallery ─────────────────────────────────────────────────────────
const IMAGES = [
  { url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80", caption: "Your infectious laugh ✨" },
  { url: "https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&q=80", caption: "Our favorite adventures 🌸" },
  { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80", caption: "The way you light up a room 💛" },
  { url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80", caption: "Your beautiful soul 🌹" },
  { url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80", caption: "Dancing through life 🎵" },
  { url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", caption: "Every smile a gift 🌺" },
  { url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80", caption: "Your endless kindness 💕" },
  { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", caption: "Making every day magic ✦" },
  { url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80", caption: "Chasing golden hours 🌅" },
];

function MemoryGallery() {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16,
      maxWidth: 600,
      margin: "0 auto",
    }}>
      {IMAGES.map((img, i) => (
        <div
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            position: "relative",
            aspectRatio: "1",
            borderRadius: 16,
            border: "2.5px solid #D4AF37",
            boxShadow: hovered === i
              ? "0 12px 40px rgba(212,175,55,0.5), 0 0 0 1px #D4AF37"
              : "0 4px 20px rgba(212,175,55,0.2)",
            overflow: "hidden",
            transition: "transform 0.35s ease, box-shadow 0.35s ease",
            transform: hovered === i ? "scale(1.07)" : "scale(1)",
            cursor: "pointer",
          }}
        >
          <img
            src={img.url}
            alt={img.caption}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(255,20,147,0.85) 0%, rgba(255,105,180,0.4) 50%, transparent 100%)",
            display: "flex", alignItems: "flex-end", padding: "10px 8px",
            opacity: hovered === i ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}>
            <p style={{ color: "#fff", fontFamily: "'Georgia',serif", fontSize: 11, textAlign: "center", width: "100%", fontStyle: "italic", lineHeight: 1.3 }}>
              {img.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reasons Carousel ───────────────────────────────────────────────────────
const REASONS = [
  { icon: "⭐", title: "Your Radiance", desc: "You have a light inside you that no darkness can touch. It radiates in every room you enter." },
  { icon: "🌸", title: "Your Kindness", desc: "The way you care for others — quietly, selflessly, completely — is one of the most beautiful things about you." },
  { icon: "🌙", title: "Your Strength", desc: "You face every challenge with grace. Your resilience inspires everyone lucky enough to know you." },
  { icon: "💐", title: "Your Laughter", desc: "Your laugh is the world's most perfect sound. It's warm, genuine, and absolutely contagious." },
  { icon: "✨", title: "Your Creativity", desc: "You see beauty and possibility everywhere — in people, in places, in the smallest everyday moments." },
  { icon: "🌹", title: "Your Heart", desc: "You love with every part of yourself. Wholly. Boldly. Without conditions. That is your greatest gift." },
];

function ReasonsCarousel() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (d) => {
    setDir(d);
    setIdx((p) => (p + d + REASONS.length) % REASONS.length);
  };

  const r = REASONS[idx];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <div style={{
        background: "linear-gradient(135deg,#FFF0F5,#FFE4EF)",
        border: "2px solid #D4AF37",
        borderRadius: 24,
        padding: "48px 40px",
        minHeight: 220,
        boxShadow: "0 12px 48px rgba(255,105,180,0.2)",
        animation: "cardIn 0.4s ease-out",
        position: "relative",
        overflow: "hidden",
      }}>
        <style>{`@keyframes cardIn { 0%{opacity:0;transform:translateX(${dir * 40}px)} 100%{opacity:1;transform:translateX(0)} }`}</style>
        <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>{r.icon}</div>
        <h3 style={{ fontFamily: "'Georgia',serif", fontSize: 24, color: "#D4AF37", marginBottom: 12, fontWeight: "bold" }}>{r.title}</h3>
        <p style={{ fontFamily: "'Georgia',serif", fontSize: 15, color: "#8B4369", lineHeight: 1.7, fontStyle: "italic" }}>{r.desc}</p>
        <div style={{ position: "absolute", bottom: 16, right: 20, fontSize: 13, color: "#D4AF37", opacity: 0.6 }}>
          {idx + 1} / {REASONS.length}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 20 }}>
        {["← Prev", "Next →"].map((label, i) => (
          <button key={label} onClick={() => go(i === 0 ? -1 : 1)} style={{
            padding: "10px 28px", borderRadius: 24,
            background: "linear-gradient(135deg,#FF69B4,#D4AF37)",
            border: "none", color: "#fff", fontFamily: "'Georgia',serif",
            fontSize: 14, cursor: "pointer", letterSpacing: 0.5,
            boxShadow: "0 4px 16px rgba(255,105,180,0.35)",
            transition: "transform 0.15s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >{label}</button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
        {REASONS.map((_, i) => (
          <div key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }} style={{
            width: i === idx ? 24 : 8, height: 8,
            borderRadius: 4, cursor: "pointer",
            background: i === idx ? "#D4AF37" : "#FFB6C1",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Countdown Timer ────────────────────────────────────────────────────────
function AwesomenessTimer() {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // Target = next midnight (tonight at 12:00:00 AM)
      const target = new Date(now);
      target.setHours(24, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      // If diff <= 0 it's past midnight, show all zeros
      setTimeLeft(diff > 0 ? Math.floor(diff / 1000) : 0);
    };

    tick(); // run immediately
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const isBirthday = timeLeft <= 0;

  const hrs  = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  const units = [
    ["Hours", hrs],
    ["Mins",  mins],
    ["Secs",  secs],
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{
        fontFamily: "'Georgia',serif",
        fontSize: 14,
        color: "#D4AF37",
        letterSpacing: 2,
        marginBottom: 16,
        textTransform: "uppercase",
        fontWeight: "bold",
      }}>
        {isBirthday
          ? "✨ Your Birthday has Begun! ✨"
          : "Counting down to your magic moment..."}
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {units.map(([label, val]) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(212,175,55,0.4)",
            borderRadius: 12,
            padding: "15px 20px",
            minWidth: 80,
            backdropFilter: "blur(10px)",
            boxShadow: isBirthday ? "0 0 20px rgba(212,175,55,0.4)" : "none",
          }}>
            <div style={{
              fontFamily: "'Georgia',serif",
              fontSize: 32,
              fontWeight: "bold",
              color: isBirthday ? "#FFD700" : "#fff",
              lineHeight: 1,
            }}>
              {String(val).padStart(2, "0")}
            </div>
            <div style={{
              fontSize: 11,
              color: "#FFB6C1",
              letterSpacing: 1.5,
              marginTop: 6,
              textTransform: "uppercase",
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, icon, children, light }) {
  return (
    <section style={{
      padding: "72px 24px",
      background: light
        ? "linear-gradient(180deg,#FFF0F5 0%,#fff 100%)"
        : "linear-gradient(180deg,#1a0a0f 0%,#2d0a1a 100%)",
      position: "relative",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
          <h2 style={{
            fontFamily: "'Georgia',serif",
            fontSize: "clamp(24px,5vw,36px)",
            color: light ? "#8B1A4A" : "#D4AF37",
            fontWeight: "bold",
            marginBottom: 8,
          }}>{title}</h2>
          <div style={{ width: 60, height: 2, background: "linear-gradient(90deg,transparent,#D4AF37,transparent)", margin: "0 auto" }} />
        </div>
        {children}
      </div>
    </section>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function HappyBirthday() {
  const [confetti, setConfetti] = useState(true);
  const [fireworks, setFireworks] = useState(false);
  const [wishClicked, setWishClicked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setConfetti(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleWish = () => {
    setFireworks(true);
    setWishClicked(true);
  };
  const handleFWEnd = useCallback(() => setFireworks(false), []);

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        @keyframes floatUp   { 0%{opacity:0;transform:translateY(60px)}  100%{opacity:1;transform:translateY(0)} }
        @keyframes floatBob  { 0%,100%{transform:translateY(0)}          50%{transform:translateY(-12px)} }
        @keyframes shimmer   { 0%,100%{opacity:0.7}                      50%{opacity:1} }
        @keyframes pulseHeart{ 0%,100%{transform:scale(1)}               50%{transform:scale(1.15)} }
      `}</style>

      <CursorTrail />
      <ConfettiHearts active={confetti} />
      <Fireworks active={fireworks} onEnd={handleFWEnd} />

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#1a0011 0%,#3d0a1f 40%,#1a0011 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {[
          ["20%","15%","300px","rgba(255,105,180,0.08)"],
          ["70%","60%","400px","rgba(212,175,55,0.06)"],
          ["10%","70%","250px","rgba(255,20,147,0.07)"],
        ].map(([x, y, s, c], i) => (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: s, height: s,
            background: `radial-gradient(circle,${c},transparent)`,
            borderRadius: "50%", pointerEvents: "none",
            animation: `shimmer ${3 + i}s ease-in-out infinite`,
          }} />
        ))}

        <div style={{ textAlign: "center", zIndex: 1, animation: "floatUp 1.2s ease-out" }}>
          <div style={{ fontSize: 48, marginBottom: 8, animation: "pulseHeart 2s ease-in-out infinite" }}>👑</div>

          <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: "clamp(13px,3vw,16px)", color: "#D4AF37", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>
            Today is her day
          </p>

          <h1 style={{
            fontFamily: "'Playfair Display','Georgia',serif",
            fontSize: "clamp(42px,10vw,88px)",
            fontWeight: "bold",
            background: "linear-gradient(135deg,#FFC0CB 0%,#D4AF37 40%,#FF69B4 70%,#D4AF37 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.1,
            marginBottom: 8,
            animation: "floatBob 4s ease-in-out infinite",
          }}>
            Happy<br />Birthday
          </h1>

          <h2 style={{
            fontFamily: "'Playfair Display','Georgia',serif",
            fontSize: "clamp(28px,7vw,56px)",
            color: "#D4AF37",
            fontStyle: "italic",
            fontWeight: 400,
            marginBottom: 40,
            animation: "floatUp 1.5s ease-out",
          }}>
            princess ♥
          </h2>

          <div style={{ margin: "32px 0 40px" }}>
            <AwesomenessTimer />
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: 50, padding: "12px 28px",
            color: "rgba(255,192,203,0.7)", fontSize: 14,
            fontFamily: "'Georgia',serif", letterSpacing: 1,
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ animation: "pulseHeart 1.5s infinite" }}>♥</span>
            Scroll to celebrate you
            <span style={{ animation: "pulseHeart 1.5s 0.5s infinite" }}>♥</span>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,#D4AF37,transparent)",
        }} />
      </section>

      {/* ── LETTER ── */}
      <Section title="A Letter for You" icon="✉️" light>
        <EnvelopeLetter />
      </Section>

      {/* ── GALLERY ── */}
      <Section title="Memory Gallery" icon="📸">
        <p style={{
          textAlign: "center", color: "#FFB6C1", fontFamily: "'Georgia',serif",
          fontSize: 14, fontStyle: "italic", marginBottom: 32, lineHeight: 1.7,
        }}>
          Every photo a chapter, every moment a treasure.<br />Hover to reveal the memories.
        </p>
        <MemoryGallery />
        <p style={{ textAlign: "center", marginTop: 20, color: "rgba(212,175,55,0.5)", fontSize: 12, fontStyle: "italic" }}>
          ↑ Replace these with your real photos in the <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>IMAGES</code> array
        </p>
      </Section>

      {/* ── REASONS ── */}
      <Section title="Why You're So Special" icon="✨" light>
        <p style={{
          textAlign: "center", color: "#8B4369", fontFamily: "'Georgia',serif",
          fontSize: 14, fontStyle: "italic", marginBottom: 36, lineHeight: 1.7,
        }}>
          There are a thousand reasons. Here are just a few.
        </p>
        <ReasonsCarousel />
      </Section>

      {/* ── FOOTER / WISH ── */}
      <section style={{
        background: "linear-gradient(160deg,#1a0011 0%,#3d0a1f 100%)",
        padding: "80px 24px 60px",
        textAlign: "center",
      }}>
        <div style={{ animation: "pulseHeart 2s ease-in-out infinite", fontSize: 40, marginBottom: 24 }}>♥</div>
        <h2 style={{
          fontFamily: "'Playfair Display','Georgia',serif",
          fontSize: "clamp(28px,6vw,48px)",
          background: "linear-gradient(135deg,#FFC0CB,#D4AF37)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 16,
        }}>
          Make a Wish
        </h2>
        <p style={{ color: "#FFB6C1", fontFamily: "'Georgia',serif", fontSize: 15, fontStyle: "italic", marginBottom: 40, lineHeight: 1.7 }}>
          Close your eyes, think of your heart's deepest desire,<br />and press the button below. ✨
        </p>

        <button
          onClick={handleWish}
          style={{
            padding: "18px 52px",
            borderRadius: 50,
            background: wishClicked ? "linear-gradient(135deg,#D4AF37,#FF69B4)" : "transparent",
            border: "2px solid #D4AF37",
            color: wishClicked ? "#fff" : "#D4AF37",
            fontFamily: "'Playfair Display','Georgia',serif",
            fontSize: 18,
            fontStyle: "italic",
            cursor: "pointer",
            letterSpacing: 1,
            transition: "all 0.4s ease",
            boxShadow: "0 0 32px rgba(212,175,55,0.3)",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg,#FF69B4,#D4AF37)";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            if (!wishClicked) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#D4AF37";
            }
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {wishClicked ? "✨ Wish Granted! ✨" : "🌟 Make a Wish 🌟"}
        </button>

        <div style={{ marginTop: 64, borderTop: "1px solid rgba(212,175,55,0.2)", paddingTop: 40 }}>
          <div style={{ fontSize: 24, color: "#D4AF37", marginBottom: 12, letterSpacing: 8 }}>♥ ♥ ♥</div>
          <p style={{ color: "rgba(255,192,203,0.5)", fontSize: 13, fontFamily: "'Georgia',serif", fontStyle: "italic" }}>
            Made with infinite love · Your biggest fan
          </p>
        </div>
      </section>
    </div>
  );
}