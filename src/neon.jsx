import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const TOKENS = {
  bg: "#05060A",
  cyan: "#00F5FF",
  purple: "#7A2CFF",
  magenta: "#FF2EEA",
  holoBlue: "#3AA0FF",
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useCountUp(target, durationMs = 900, startWhen = true) {
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!startWhen) return;
    if (reduce) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, startWhen, reduce]);

  return value;
}

function NeonButton({ variant = "primary", className, children, ...props }) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black";
  const primary =
    "text-black bg-white/90 hover:bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_20px_70px_rgba(0,0,0,0.6)]";
  const secondary =
    "text-white bg-white/5 hover:bg-white/8 border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.55)]";
  const ring =
    variant === "primary"
      ? "focus-visible:ring-cyan-300"
      : "focus-visible:ring-fuchsia-300";

  return (
    <button className={cx("group", base, ring, variant === "primary" ? primary : secondary, className)} {...props}>

      {/* glow */}
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 blur-md transition duration-300",
          "group-hover:opacity-100",
          variant === "primary"
            ? "bg-[radial-gradient(circle_at_30%_20%,rgba(0,245,255,0.55),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(255,46,234,0.35),transparent_55%)]"
            : "bg-[radial-gradient(circle_at_30%_20%,rgba(122,44,255,0.55),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(0,245,255,0.25),transparent_55%)]"
        )}
      />
      <span className="relative">{children}</span>
      {/* slow pulse for primary */}
      {variant === "primary" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl opacity-30 blur-xl"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(0,245,255,0.22), transparent 60%), radial-gradient(circle at 70% 60%, rgba(255,46,234,0.16), transparent 60%)",
            animation: "neonPulse 3.2s ease-in-out infinite",
          }}
        />
      ) : null}

    </button>
  );
}

function HoloCard({ className, children }) {
  return (
    <div
      className={cx(
        "relative rounded-[26px] border border-white/10 bg-white/[0.06] backdrop-blur-2xl",
        "shadow-[0_24px_90px_rgba(0,0,0,0.65)]",
        className
      )}
    >
      {/* neon edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[26px] [mask-image:linear-gradient(to_bottom,black,transparent_120%)]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.10), 0 0 22px rgba(0,245,255,0.12), 0 0 44px rgba(122,44,255,0.10)",
        }}
      />
      {/* subtle scanline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[26px] opacity-[0.22] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 10px",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function Section({ id, eyebrow, title, desc, children }) {
  return (
    <section id={id} className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0,245,255,1) 0%, rgba(0,245,255,0.2) 70%, transparent 72%)",
              boxShadow: "0 0 18px rgba(0,245,255,0.45)",
            }}
          />
          <span>{eyebrow}</span>
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        {desc ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
            {desc}
          </p>
        ) : null}
      </motion.div>

      {children}
    </section>
  );
}

function NeonGridBackground({ strength = 1 }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* animated gradient wash */}
      <div
        className={cx(
          "absolute inset-0 opacity-80",
          !reduce && "animate-[drift_10s_ease-in-out_infinite]"
        )}
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(0,245,255,0.16), transparent 55%)," +
            "radial-gradient(circle at 80% 30%, rgba(122,44,255,0.15), transparent 60%)," +
            "radial-gradient(circle at 40% 85%, rgba(255,46,234,0.10), transparent 60%)",
          filter: `blur(${14 * strength}px)`,
        }}
      />
      {/* grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), " +
            "linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          transform: "perspective(900px) rotateX(62deg) translateY(-10%)",
          transformOrigin: "top",
          maskImage:
            "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.85) 70%)",
        }}
      />
      <style>{`
        @keyframes drift {
          0%,100% { transform: translate3d(0,0,0) }
          50% { transform: translate3d(-2%,1%,0) }
        }
      `}</style>
    </div>
  );
}

function Particles({ count = 28 }) {
  const reduce = useReducedMotion();
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 1 + Math.random() * 2.2,
        o: 0.15 + Math.random() * 0.35,
        d: 6 + Math.random() * 10,
      });
    }
    return arr;
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={cx(
            "absolute rounded-full",
            !reduce && "animate-[floaty_var(--d)_ease-in-out_infinite]"
          )}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.s}px`,
            height: `${p.s}px`,
            opacity: p.o,
            "--d": `${p.d}s`,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.0) 70%)",
          }}
        />
      ))}
      <style>{`
        @keyframes floaty {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-16px,0); }
        }
      `}</style>
    </div>
  );
}

function LiveStatusBadge({ label = "All systems nominal", state = "ok" }) {
  const color =
    state === "ok" ? "rgba(0,245,255,1)" : state === "warn" ? "rgba(255,46,234,1)" : "rgba(255,255,255,0.9)";
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
      <span
        className="relative h-2 w-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 18px ${color}` }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: color }}
        />
      </span>
      <span>{label}</span>
    </div>
  );
}

function OrbitIntegrations() {
  const items = [
    { name: "Slack", tint: TOKENS.cyan },
    { name: "GitHub", tint: TOKENS.purple },
    { name: "Jira", tint: TOKENS.magenta },
    { name: "AWS", tint: TOKENS.holoBlue },
    { name: "GCP", tint: TOKENS.cyan },
    { name: "Okta", tint: TOKENS.purple },
    { name: "Datadog", tint: TOKENS.magenta },
    { name: "Splunk", tint: TOKENS.holoBlue },
  ];
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* core */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative grid h-40 w-40 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full opacity-80"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.12), 0 0 34px rgba(0,245,255,0.22), 0 0 70px rgba(122,44,255,0.16)",
            }}
          />
          <div
            aria-hidden
            className={cx(
              "absolute -inset-10 rounded-full opacity-60 blur-2xl",
              !reduce && "animate-[drift_8s_ease-in-out_infinite]"
            )}
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(0,245,255,0.25), transparent 60%)," +
                "radial-gradient(circle at 70% 70%, rgba(255,46,234,0.18), transparent 60%)",
            }}
          />
          <div className="relative text-center">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              CORE
            </div>
            <div className="mt-1 text-lg font-extrabold text-white">
              NeonOps
            </div>
            <div className="mt-2 text-xs text-white/60">
              Unified Integration Fabric
            </div>
          </div>
        </div>
      </div>

      {/* orbits */}
      <div className="absolute inset-0">
        <div
          className={cx(
            "absolute inset-8 rounded-full border border-white/10",
            !reduce && "animate-[spin_28s_linear_infinite]"
          )}
          style={{
            boxShadow: "0 0 28px rgba(0,245,255,0.08)",
          }}
        />
        <div
          className={cx(
            "absolute inset-16 rounded-full border border-white/10",
            !reduce && "animate-[spin_22s_linear_infinite_reverse]"
          )}
          style={{
            boxShadow: "0 0 28px rgba(122,44,255,0.08)",
          }}
        />
        <style>{`
          @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        `}</style>
      </div>

      {/* nodes */}
      {items.map((it, i) => {
        const angle = (i / items.length) * Math.PI * 2;
        const r = i % 2 === 0 ? 44 : 36;
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        return (
          <div
            key={it.name}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className={cx(
                "relative rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 backdrop-blur-xl",
                "transition duration-300",
                "group-hover:-translate-y-1 group-hover:scale-[1.03]"
              )}
              style={{
                boxShadow: `0 0 22px rgba(0,0,0,0.55)`,
              }}
            >
              <span
                aria-hidden
                className="absolute -inset-0.5 rounded-2xl opacity-0 blur-md transition duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${it.tint}55, transparent 60%)`,
                }}
              />
              <span className="relative">{it.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DemoConsole() {
  const tabs = ["Overview", "Pipelines", "Alerts", "Compliance"];
  const [tab, setTab] = useState("Overview");

  const stream = useMemo(() => {
    const base = [
      { t: "12:04", e: "Signal ingested", s: "OK" },
      { t: "12:05", e: "Correlation updated", s: "OK" },
      { t: "12:06", e: "Policy executed", s: "OK" },
      { t: "12:07", e: "Auto-remediation", s: "OK" },
      { t: "12:08", e: "Audit logged", s: "OK" },
    ];
    return base;
  }, []);

  const heat = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        name: `S${i + 1}`,
        v: Math.round(30 + Math.random() * 70),
      })),
    []
  );

  const spark = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        x: i,
        y: Math.round(40 + Math.random() * 50),
      })),
    []
  );

  return (
    <HoloCard className="overflow-hidden">
      <div className="flex flex-col gap-0 lg:flex-row">
        {/* left - navigation */}
        <div className="border-b border-white/10 bg-white/[0.03] p-4 lg:w-56 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              CONSOLE
            </div>
            <LiveStatusBadge label="Live" state="ok" />
          </div>
          <div className="mt-4 grid gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cx(
                  "text-left rounded-2xl px-3 py-2 text-sm font-semibold transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-cyan-300",
                  tab === t
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-white/70 hover:bg-white/6"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-white/70">
              Energy Cell
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-[78%]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,245,255,0.9), rgba(255,46,234,0.65))",
                  boxShadow: "0 0 22px rgba(0,245,255,0.25)",
                }}
              />
            </div>
            <div className="mt-2 text-xs text-white/55">Runtime capacity</div>
          </div>
        </div>

        {/* right - content */}
        <div className="flex-1 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
            <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">{tab}</div>
                <div className="text-xs text-white/55">Real-time widgets</div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-white/70">
                    Stability Index
                  </div>
                  <div className="mt-2 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spark}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="x" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(10,12,18,0.9)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 14,
                            color: "rgba(255,255,255,0.9)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="y"
                          stroke="rgba(0,245,255,0.9)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-white/70">
                    Load Heat
                  </div>
                  <div className="mt-2 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={heat}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(10,12,18,0.9)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 14,
                            color: "rgba(255,255,255,0.9)",
                          }}
                        />
                        <Bar dataKey="v" fill="rgba(122,44,255,0.85)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white/70">
                    Event Stream
                  </div>
                  <div className="text-xs text-white/55">Hover rows</div>
                </div>

                <div className="mt-2 overflow-hidden rounded-2xl border border-white/10">
                  <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/70">
                    <div className="col-span-2">Time</div>
                    <div className="col-span-8">Event</div>
                    <div className="col-span-2">Status</div>
                  </div>
                  {stream.map((r, idx) => (
                    <div
                      key={idx}
                      className={cx(
                        "group relative grid grid-cols-12 px-3 py-2 text-xs text-white/75",
                        "border-t border-white/5 hover:bg-white/5 transition"
                      )}
                    >
                      {/* scanline on hover */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
                        style={{
                          background:
                            "linear-gradient(to right, transparent, rgba(0,245,255,0.14), transparent)",
                          transform: "translateX(-40%)",
                        }}
                      />
                      <div className="col-span-2">{r.t}</div>
                      <div className="col-span-8">{r.e}</div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: "rgba(0,245,255,0.95)",
                              boxShadow: "0 0 16px rgba(0,245,255,0.35)",
                            }}
                          />
                          {r.s}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 lg:w-[360px]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">Policy Engine</div>
                <span className="text-xs text-white/55">Energy toggle</span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-white/70">
                  Autonomous Actions
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-white/60">Auto-remediate</span>
                  <EnergyToggle />
                </div>
                <div className="mt-3 text-xs text-white/55">
                  Executes validated runbooks with audit trails and rollback.
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-white/70">
                  Signal Correlation
                </div>
                <div className="mt-2 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={Array.from({ length: 14 }).map((_, i) => ({
                        x: i,
                        a: Math.round(20 + Math.random() * 70),
                      }))}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="x" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10,12,18,0.9)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 14,
                          color: "rgba(255,255,255,0.9)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="a"
                        stroke="rgba(255,46,234,0.9)"
                        fill="rgba(255,46,234,0.22)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs font-semibold text-white/70">
                  Compliance Snapshot
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { k: "SOC 2", v: "Ready" },
                    { k: "SSO", v: "Enabled" },
                    { k: "Audit", v: "Live" },
                  ].map((x) => (
                    <div key={x.k} className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
                      <div className="font-bold text-white">{x.v}</div>
                      <div className="mt-1 text-white/55">{x.k}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HoloCard>
  );
}

function EnergyToggle() {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={cx(
        "relative h-8 w-14 rounded-full border border-white/15 bg-black/30 p-1 transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-cyan-300"
      )}
      aria-pressed={on}
      aria-label="Toggle auto-remediation"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full opacity-70"
        style={{
          background: on
            ? "linear-gradient(90deg, rgba(0,245,255,0.35), rgba(255,46,234,0.25))"
            : "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
        }}
      />
      <span
        className={cx(
          "relative block h-6 w-6 rounded-full transition",
          on ? "translate-x-6" : "translate-x-0"
        )}
        style={{
          background: on
            ? "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(0,245,255,0.25))"
            : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.08))",
          boxShadow: on
            ? "0 0 18px rgba(0,245,255,0.35), 0 0 40px rgba(255,46,234,0.10)"
            : "0 0 12px rgba(255,255,255,0.12)",
        }}
      />
    </button>
  );
}

function PricingCard({ name, price, tagline, features, featured }) {
  return (
    <HoloCard
      className={cx(
        "p-6",
        featured &&
          "border-white/20 bg-white/[0.08] shadow-[0_30px_120px_rgba(0,0,0,0.7)]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-widest text-white/60">
            POWER TIER
          </div>
          <div className="mt-2 text-xl font-extrabold text-white">{name}</div>
          <div className="mt-1 text-sm text-white/60">{tagline}</div>
        </div>
        {featured ? (
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            Most deployed
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-end gap-2">
        <div className="text-4xl font-extrabold text-white">{price}</div>
        <div className="pb-1 text-sm text-white/55">/ mo</div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cx("h-full", featured ? "w-[78%]" : "w-[55%]")}
          style={{
            background:
              featured
                ? "linear-gradient(90deg, rgba(0,245,255,0.9), rgba(255,46,234,0.55))"
                : "linear-gradient(90deg, rgba(122,44,255,0.75), rgba(0,245,255,0.25))",
            boxShadow: featured ? "0 0 24px rgba(0,245,255,0.22)" : "0 0 18px rgba(122,44,255,0.16)",
          }}
        />
      </div>

      <ul className="mt-5 space-y-3 text-sm text-white/70">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-1 h-2 w-2 rounded-full"
              style={{
                background: "rgba(0,245,255,0.95)",
                boxShadow: "0 0 16px rgba(0,245,255,0.25)",
              }}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <div className="group inline-flex w-full">
          <NeonButton
            variant={featured ? "primary" : "secondary"}
            className="group w-full"
          >
            {featured ? "Request a Demo" : "Start Trial"}
          </NeonButton>
        </div>
      </div>
    </HoloCard>
  );
}

function TestimonialCarousel() {
  const items = [
    {
      quote:
        "NeonOps gave us a single command surface for detection → decision → execution. We cut MTTR without adding headcount.",
      name: "SRE Lead",
      org: "Global FinTech",
    },
    {
      quote:
        "The policy engine is the difference. We finally have automation that’s governed, audited, and reversible.",
      name: "Platform Director",
      org: "Enterprise SaaS",
    },
    {
      quote:
        "Observability is everywhere now. NeonOps is the first product that feels like an operating system — not a dashboard.",
      name: "Head of Reliability",
      org: "Cloud Infrastructure Co.",
    },
    {
      quote:
        "We shipped faster because incident response became a workflow — not a war room. The interface is shockingly clear.",
      name: "VP Engineering",
      org: "Consumer Platform",
    },
  ];

  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setIdx((v) => (v + 1) % items.length), 5200);
    return () => clearInterval(t);
  }, [items.length, reduce]);

  const item = items[idx];

  return (
    <HoloCard className="overflow-hidden">
      <div className="relative p-8">
        <div
          aria-hidden
          className="absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(0,245,255,0.16), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,46,234,0.12), transparent 60%)",
          }}
        />

        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="text-sm font-semibold tracking-widest text-white/60">
            HOLOGRAPHIC FEEDBACK
          </div>
          <p className="mt-4 text-lg leading-relaxed text-white/90">
            “{item.quote}”
          </p>
          <div className="mt-6 text-sm text-white/70">
            <span className="font-bold text-white">{item.name}</span> —{" "}
            <span>{item.org}</span>
          </div>
        </motion.div>

        <div className="mt-6 flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cx(
                "h-2.5 w-2.5 rounded-full border border-white/15 transition",
                i === idx ? "bg-white/70" : "bg-white/10 hover:bg-white/20"
              )}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </HoloCard>
  );
}

function Navbar() {
  const links = [
    { href: "#features", label: "Features" },
    { href: "#demo", label: "Live Console" },
    { href: "#workflow", label: "Workflow" },
    { href: "#integrations", label: "Integrations" },
    { href: "#pricing", label: "Pricing" },
    { href: "#security", label: "Security" },
  ];
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="group flex items-center gap-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.10), 0 0 22px rgba(0,245,255,0.14)",
            }}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{
                background: "rgba(0,245,255,1)",
                boxShadow: "0 0 18px rgba(0,245,255,0.45)",
              }}
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-white">NeonOps</div>
            <div className="text-[11px] text-white/55">
              Mission-critical Ops OS
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-white/70 hover:text-white transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <NeonButton variant="secondary" className="group">
              View Live Console
            </NeonButton>
          </div>
          <NeonButton variant="primary" className="group">
            Request a Demo
          </NeonButton>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 30]);
  const y2 = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -18]);

  const kpi1 = useCountUp(99, 900, true);
  const kpi2 = useCountUp(42, 900, true);
  const kpi3 = useCountUp(128, 900, true);

  const line = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        name: i,
        v: Math.round(30 + Math.random() * 60),
      })),
    []
  );

  return (
    <header id="top" className="relative min-h-[92vh] overflow-hidden">
      <NeonGridBackground strength={1} />
      {/* Volumetric light beams (cinematic) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-[-140px] h-[520px] w-[780px] rotate-12 blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(0,245,255,0.22), transparent 62%)",
          }}
        />
        <div
          className="absolute right-[-260px] top-[40px] h-[640px] w-[860px] -rotate-12 blur-3xl opacity-55"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, rgba(122,44,255,0.22), transparent 62%)",
          }}
        />
        <div
          className="absolute left-[18%] bottom-[-260px] h-[760px] w-[760px] blur-3xl opacity-35"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,46,234,0.16), transparent 65%)",
          }}
        />
      </div>

      <Particles />

      {/* cursor reactive glow */}
      <CursorGlow />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div style={{ y: y2 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{
                  background: "rgba(255,46,234,1)",
                  boxShadow: "0 0 18px rgba(255,46,234,0.35)",
                }}
              />
              <span>Next-gen operations control center</span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Command the chaos.
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgba(0,245,255,1), rgba(122,44,255,1), rgba(255,46,234,1))",
                  filter: "drop-shadow(0 0 26px rgba(0,245,255,0.18))",
                }}
              >
                Orchestrate everything.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
              NeonOps unifies real-time observability, governed automation, and
              audit-ready workflows into a single operating surface built for
              modern reliability teams.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="group">
                <NeonButton variant="primary" className="group w-full sm:w-auto">
                  Request a Demo
                  <span aria-hidden>→</span>
                </NeonButton>
              </div>
              <div className="group">
                <NeonButton variant="secondary" className="group w-full sm:w-auto">
                  View Live Console
                </NeonButton>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/60">
              {["SOC 2", "SSO/SAML", "Audit trails", "99.99% uptime"].map((x) => (
                <span
                  key={x}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                >
                  {x}
                </span>
              ))}
            </div>

            {/* scanning overlay line */}
            {!reduce && (
              <div
                aria-hidden
                className="pointer-events-none relative mt-10 h-[2px] overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="absolute inset-y-0 w-1/3 animate-[scan_2.4s_ease-in-out_infinite]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,245,255,0.75), transparent)",
                    filter: "blur(0.2px)",
                  }}
                />
                <style>{`
                  @keyframes scan {
                    0% { transform: translateX(-50%); opacity: .0 }
                    20% { opacity: 1 }
                    50% { transform: translateX(200%); opacity: 1 }
                    100% { transform: translateX(260%); opacity: 0 }
                  }
                `}</style>
              </div>
            )}
          </motion.div>

          {/* right side live command dashboard */}
          <motion.div style={{ y: y1 }}>
            <HoloCard className="overflow-hidden">
              <div className="relative p-5">
                <div
                  aria-hidden
                  className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(0,245,255,0.18), transparent 60%)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute -left-20 -bottom-24 h-64 w-64 rounded-full blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(122,44,255,0.16), transparent 60%)",
                  }}
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-white/60">
                      LIVE COMMAND DASHBOARD
                    </div>
                    <div className="mt-1 text-sm font-bold text-white">
                      Global Operations Snapshot
                    </div>
                  </div>
                  <LiveStatusBadge label="All systems nominal" state="ok" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <KPI title="Uptime" value={`${kpi1}.99%`} accent="cyan" />
                  <KPI title="MTTR" value={`${kpi2}m`} accent="magenta" />
                  <KPI title="Active Signals" value={`${kpi3}k`} accent="purple" />
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-white/70">
                      Reliability Trend
                    </div>
                    <div className="text-xs text-white/55">Real-time</div>
                  </div>
                  <div className="mt-2 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={line}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(10,12,18,0.9)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 14,
                            color: "rgba(255,255,255,0.9)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke="rgba(0,245,255,0.9)"
                          strokeWidth={2.2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MiniModule title="Guardrails" value="Policy-driven automation" tint="purple" />
                  <MiniModule title="Trust" value="Audit-ready execution" tint="cyan" />
                </div>
              </div>
            </HoloCard>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

function KPI({ title, value, accent = "cyan" }) {
  const glow =
    accent === "cyan"
      ? "0 0 18px rgba(0,245,255,0.25)"
      : accent === "magenta"
      ? "0 0 18px rgba(255,46,234,0.20)"
      : "0 0 18px rgba(122,44,255,0.20)";
  const bar =
    accent === "cyan"
      ? "linear-gradient(90deg, rgba(0,245,255,0.85), rgba(255,46,234,0.45))"
      : accent === "magenta"
      ? "linear-gradient(90deg, rgba(255,46,234,0.75), rgba(0,245,255,0.35))"
      : "linear-gradient(90deg, rgba(122,44,255,0.78), rgba(0,245,255,0.30))";
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs font-semibold text-white/70">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-[70%]" style={{ background: bar, boxShadow: glow }} />
      </div>
    </div>
  );
}

function MiniModule({ title, value, tint = "cyan" }) {
  const bg =
    tint === "cyan"
      ? "radial-gradient(circle at 20% 20%, rgba(0,245,255,0.18), transparent 60%)"
      : tint === "purple"
      ? "radial-gradient(circle at 20% 20%, rgba(122,44,255,0.18), transparent 60%)"
      : "radial-gradient(circle at 20% 20%, rgba(255,46,234,0.16), transparent 60%)";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
      <div aria-hidden className="absolute inset-0 opacity-80" style={{ background: bg }} />
      <div className="relative">
        <div className="text-xs font-semibold text-white/70">{title}</div>
        <div className="mt-1 text-sm font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

function CursorGlow() {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--x", `${x}%`);
      el.style.setProperty("--y", `${y}%`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-70"
      style={{
        background:
          "radial-gradient(circle at var(--x, 50%) var(--y, 30%), rgba(0,245,255,0.08), transparent 45%)," +
          "radial-gradient(circle at calc(var(--x, 50%) + 18%) calc(var(--y, 30%) + 12%), rgba(255,46,234,0.06), transparent 52%)",
      }}
    />
  );
}

export default function NeonOpsLanding() {
  const features = [
    {
      title: "Real-time observability",
      desc: "Unified signals, correlated context, instant clarity — across your stack.",
      tint: "cyan",
    },
    {
      title: "Automated incident response",
      desc: "Validated runbooks that execute fast, roll back safely, and stay governed.",
      tint: "magenta",
    },
    {
      title: "Policy-driven workflows",
      desc: "Guardrails first: approvals, scopes, and audit trails baked into actions.",
      tint: "purple",
    },
    {
      title: "RBAC + audit trails",
      desc: "Enterprise access control with immutable logs and compliance-ready exports.",
      tint: "cyan",
    },
    {
      title: "Predictive capacity insights",
      desc: "Forecast saturation and prevent outages before they start.",
      tint: "purple",
    },
    {
      title: "Unified integrations hub",
      desc: "Connect your tools into a single operating fabric — without duct tape.",
      tint: "magenta",
    },
  ];

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{
        backgroundColor: TOKENS.bg,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
      }}
    >
      {/* Global style helpers */}
      <style>{`
        :root {
          color-scheme: dark;
        }
        /* smoother text rendering */
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>

      <Navbar />
      <Hero />

      {/* WHY STRIP */}
      <section className="relative mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <HoloCard className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { k: "Visibility", v: "One pane, zero noise" },
              { k: "Speed", v: "Decide + execute instantly" },
              { k: "Governance", v: "Policy-first automation" },
              { k: "Trust", v: "Audit-ready by design" },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="text-xs font-semibold tracking-widest text-white/60">
                  {x.k.toUpperCase()}
                </div>
                <div className="mt-2 text-sm font-bold text-white">{x.v}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full w-[68%]"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(0,245,255,0.85), rgba(122,44,255,0.55), rgba(255,46,234,0.35))",
                      boxShadow: "0 0 20px rgba(0,245,255,0.18)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </HoloCard>
      </section>

      {/* FEATURES */}
      <Section
        id="features"
        eyebrow="Control Modules"
        title="Every capability feels like a dedicated system module"
        desc="Floating neon cards, hover lift + glow trails, and enterprise clarity — built for operators who move fast."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <HoloCard className="h-full p-5 transition duration-300 group-hover:-translate-y-1">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 blur-xl transition duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      f.tint === "cyan"
                        ? "radial-gradient(circle at 20% 20%, rgba(0,245,255,0.22), transparent 60%)"
                        : f.tint === "purple"
                        ? "radial-gradient(circle at 20% 20%, rgba(122,44,255,0.22), transparent 60%)"
                        : "radial-gradient(circle at 20% 20%, rgba(255,46,234,0.18), transparent 60%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-extrabold text-white">
                      {f.title}
                    </div>
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background:
                          f.tint === "cyan"
                            ? "rgba(0,245,255,0.95)"
                            : f.tint === "purple"
                            ? "rgba(122,44,255,0.95)"
                            : "rgba(255,46,234,0.9)",
                        boxShadow:
                          f.tint === "cyan"
                            ? "0 0 18px rgba(0,245,255,0.35)"
                            : f.tint === "purple"
                            ? "0 0 18px rgba(122,44,255,0.30)"
                            : "0 0 18px rgba(255,46,234,0.28)",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {f.desc}
                  </p>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs font-semibold text-white/70">
                      Live indicator
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-white/55">
                        Signal latency
                      </span>
                      <span className="text-xs font-bold text-white">
                        &lt; 120ms
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full w-[72%]"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(0,245,255,0.75), rgba(255,46,234,0.35))",
                          boxShadow: "0 0 18px rgba(0,245,255,0.16)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </HoloCard>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* DEMO */}
      <Section
        id="demo"
        eyebrow="Interactive Live Console"
        title="A console that feels alive — not just another dashboard"
        desc="Tabs, widgets, heatmaps, counters, scanline tables, and energy toggles. Built to be operated under pressure."
      >
        <DemoConsole />
      </Section>

      {/* WORKFLOW */}
      <Section
        id="workflow"
        eyebrow="Glowing Data Pipeline"
        title="From signal to execution in a governed pipeline"
        desc="Ingest → correlate → decide → act. A continuous current of data flows through every step."
      >
        <HoloCard className="p-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {[
              { t: "Ingest signals", d: "Metrics, logs, traces, events — unified." },
              { t: "Normalize + correlate", d: "Context joins noise into meaning." },
              { t: "Automate decisions", d: "Policies turn intent into action." },
              { t: "Execute + learn", d: "Runbooks, rollback, feedback loops." },
            ].map((s, i, arr) => (
              <div key={s.t} className="relative">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-semibold tracking-widest text-white/60">
                    STEP {i + 1}
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-white">{s.t}</div>
                  <p className="mt-2 text-sm text-white/70">{s.d}</p>
                </div>

                {/* connecting current */}
                {i < arr.length - 1 ? (
                  <div aria-hidden className="hidden lg:block">
                    <div className="absolute right-[-18px] top-1/2 h-[2px] w-9 -translate-y-1/2 bg-white/10 overflow-hidden rounded-full">
                      <div
                        className="h-full w-1/2 animate-[flow_1.6s_ease-in-out_infinite]"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(0,245,255,0.75), transparent)",
                        }}
                      />
                    </div>
                    <style>{`
                      @keyframes flow {
                        0% { transform: translateX(-60%); opacity: .0 }
                        20% { opacity: 1 }
                        60% { transform: translateX(160%); opacity: 1 }
                        100% { transform: translateX(220%); opacity: 0 }
                      }
                    `}</style>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </HoloCard>
      </Section>

      {/* INTEGRATIONS */}
      <Section
        id="integrations"
        eyebrow="Orbit Integrations"
        title="Your tools, unified around a single core"
        desc="Integrations orbit NeonOps like nodes in a controlled system fabric — hover to feel the depth."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <HoloCard className="p-6">
            <div className="text-sm font-bold text-white">Integration Fabric</div>
            <p className="mt-2 text-sm text-white/70">
              Connect incident, CI/CD, cloud, identity, and telemetry without spaghetti glue.
              NeonOps keeps the system coherent with policy-scoped execution.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Bi-directional alerts & routing",
                "Identity-driven permissions",
                "Event normalization + correlation",
                "Audit logs per action",
              ].map((x) => (
                <div key={x} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/75">
                  <span
                    aria-hidden
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{
                      background: "rgba(0,245,255,0.95)",
                      boxShadow: "0 0 14px rgba(0,245,255,0.25)",
                    }}
                  />
                  {x}
                </div>
              ))}
            </div>
          </HoloCard>

          <HoloCard className="p-6">
            <OrbitIntegrations />
          </HoloCard>
        </div>
      </Section>

      {/* PRICING */}
      <Section
        id="pricing"
        eyebrow="Upgrade Modules"
        title="Power tiers for every operating scale"
        desc="Start fast with Core, unlock automation depth with Pro, and deploy enterprise governance with Enterprise."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard
            name="Core"
            price="$49"
            tagline="Visibility + alert coherence"
            features={[
              "Unified observability surface",
              "Basic alert routing",
              "Dashboards + exports",
              "Standard integrations",
            ]}
          />
          <PricingCard
            name="Pro"
            price="$149"
            tagline="Governed automation at speed"
            featured
            features={[
              "Policy engine + approvals",
              "Automated runbooks",
              "Advanced correlation",
              "Priority support",
            ]}
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            tagline="Mission-critical governance"
            features={[
              "SSO/SAML + SCIM",
              "Advanced RBAC + audit policies",
              "Data residency options",
              "Uptime SLA + DPA",
            ]}
          />
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section
        id="testimonials"
        eyebrow="Rotating Holograms"
        title="Trusted by teams that operate under pressure"
        desc="Operators don’t need more noise — they need a system that executes with clarity and control."
      >
        <TestimonialCarousel />
      </Section>

      {/* SECURITY */}
      <Section
        id="security"
        eyebrow="Shielded System Core"
        title="High-trust by design"
        desc="Built for enterprise adoption with security-first execution and audit-ready operations."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <HoloCard className="p-6">
            <div className="text-sm font-bold text-white">Security & Compliance</div>
            <div className="mt-4 grid gap-3">
              {[
                { t: "Encryption", d: "In transit + at rest with modern cipher suites." },
                { t: "Audit trails", d: "Immutable logs for every policy and action." },
                { t: "RBAC", d: "Fine-grained access controls and scopes." },
                { t: "SSO", d: "SAML/OIDC for enterprise identity." },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-white">{x.t}</div>
                    <LiveStatusBadge label="Active" state="ok" />
                  </div>
                  <p className="mt-2 text-sm text-white/70">{x.d}</p>
                </div>
              ))}
            </div>
          </HoloCard>

          <HoloCard className="p-6">
            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/20 p-8">
              <div
                aria-hidden
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(circle at 50% 45%, rgba(0,245,255,0.20), transparent 60%)," +
                    "radial-gradient(circle at 60% 60%, rgba(122,44,255,0.16), transparent 60%)",
                }}
              />
              <div className="relative">
                <div className="text-xs font-semibold tracking-widest text-white/60">
                  SHIELDED CORE
                </div>
                <div className="mt-2 text-2xl font-extrabold text-white">
                  Governed execution
                </div>
                <p className="mt-3 text-sm text-white/70">
                  Automation that respects scope, approvals, identity, and rollback —
                  so speed never compromises trust.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { k: "SLA", v: "99.99%" },
                    { k: "Exports", v: "Audit-ready" },
                    { k: "Scopes", v: "Policy-bound" },
                    { k: "Data", v: "Encrypted" },
                  ].map((x) => (
                    <div key={x.k} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                      <div className="text-xl font-extrabold text-white">{x.v}</div>
                      <div className="mt-1 text-xs text-white/60">{x.k}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </HoloCard>
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <HoloCard className="overflow-hidden">
          <div className="relative p-10">
            <NeonGridBackground strength={0.7} />
            <div className="relative">
              <div className="text-xs font-semibold tracking-widest text-white/60">
                ENTER THE CONSOLE
              </div>
              <h3 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Ship reliability with cinematic control.
              </h3>
              <p className="mt-3 max-w-2xl text-sm text-white/70">
                NeonOps is built for teams that can’t afford uncertainty. Unify signals,
                govern automation, and execute with confidence.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="group">
                  <NeonButton variant="primary" className="group w-full sm:w-auto">
                    Request a Demo <span aria-hidden>→</span>
                  </NeonButton>
                </div>
                <div className="group">
                  <NeonButton variant="secondary" className="group w-full sm:w-auto">
                    View Live Console
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>
        </HoloCard>

        <footer className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} NeonOps. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-white/70">
            {["Privacy", "Security", "Docs", "Status", "Contact"].map((x) => (
              <a key={x} href="#" className="hover:text-white transition">
                {x}
              </a>
            ))}
          </div>
        </footer>
      </section>
    </div>
  );
}
