import { motion } from "framer-motion";
import { Activity, ArrowRight, Bot, Factory, ShieldCheck, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { IndustrialBackground } from "../ui/IndustrialBackground";
import { SectionHeading } from "../ui/SectionHeading";

const features = [
  {
    icon: Activity,
    title: "Live telemetry intelligence",
    description: "Track thermal drift, vibration anomalies, power draw, and RPM stability across the digital twin."
  },
  {
    icon: Bot,
    title: "Predictive maintenance guidance",
    description: "Rule-based decisioning is modular from day one, so the prediction engine can move to ML without a redesign."
  },
  {
    icon: ShieldCheck,
    title: "Operator-to-boss coordination",
    description: "Alerts, escalation, and instructions move through a dedicated command channel with timestamps and role identity."
  }
];

const flowSteps = ["Simulation", "Telemetry", "Prediction", "Dashboard"];

export function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <IndustrialBackground />
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold uppercase tracking-[0.35em] text-industrial-blue"
            >
              Precision Industrial Intelligence UI
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-3xl font-display text-6xl font-semibold leading-none text-steel-900"
            >
              Machine Health Predictor for smart factory digital twins.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-steel-500"
            >
              From motor to conveyor, scanner, sorting arm, and output lines, the platform turns AnyLogic telemetry into live operational visibility, failure predictions, and executive-ready reporting.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-industrial-blue px-6 py-3 font-semibold text-white transition hover:translate-x-1"
              >
                Enter command center
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#flow"
                className="rounded-full border border-steel-300 px-6 py-3 font-semibold text-steel-900 transition hover:bg-white/60"
              >
                Explore system flow
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="relative rounded-[36px] border border-white/70 bg-white/60 p-8 shadow-panel backdrop-blur"
          >
            <div className="grid grid-cols-5 items-center gap-4">
              {["Motor", "Conveyor", "Scanner", "Sorting Arm", "Outputs"].map((item, index) => (
                <motion.div
                  key={item}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 2.6,
                    delay: index * 0.15,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                  className="rounded-3xl border border-white/80 bg-gradient-to-br from-white to-steel-100 p-3 text-center"
                >
                  <Factory className="mx-auto h-7 w-7 text-industrial-blue" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">{item}</p>
                </motion.div>
              ))}
            </div>
            <div className="relative mt-10 h-24 overflow-hidden rounded-3xl bg-steel-900/95 p-4">
              <motion.div
                animate={{ x: ["-10%", "100%"] }}
                transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute left-0 top-8 h-8 w-24 rounded-full bg-industrial-amber/90 blur-[1px]"
              />
              <div className="absolute inset-x-5 top-11 h-2 rounded-full bg-industrial-blue/45" />
              <div className="absolute inset-4 grid grid-cols-4 gap-3">
                {flowSteps.map((step) => (
                  <div key={step} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-steel-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <SectionHeading eyebrow="Capability" title="Built for industrial operators and business leadership">
          The interface is intentionally mechanical, spatial, and data-rich without falling into a generic SaaS dashboard pattern.
        </SectionHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-[30px] border border-white/70 bg-white/65 p-6 shadow-panel backdrop-blur"
            >
              <div className="w-fit rounded-2xl bg-industrial-amber/20 p-3 text-industrial-blue">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-steel-500">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="flow" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <SectionHeading eyebrow="System Flow" title="Simulation to prediction, designed as a continuous signal chain">
          AnyLogic events become telemetry rows, the prediction engine interprets wear and risk, and the dashboards push machine intelligence to the right role.
        </SectionHeading>
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative rounded-[28px] border border-white/70 bg-gradient-to-br from-white to-steel-100 p-6 shadow-panel"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-industrial-blue text-lg font-bold text-white">
                {index + 1}
              </div>
              <h3 className="font-display text-2xl font-semibold">{step}</h3>
              <p className="mt-3 text-sm leading-7 text-steel-500">
                {step === "Simulation" && "Factory line stages stream digital twin events for motor, conveyor, scanner, and sorting arm."}
                {step === "Telemetry" && "CSV ingestion normalizes timestamped temperature, vibration, power, RPM, wear, and life signals."}
                {step === "Prediction" && "Modular rule logic produces failure risk, remaining life hours, next hour power, and maintenance advice."}
                {step === "Dashboard" && "Operators get machine depth, while bosses see fleet-level exposure, energy, and reporting outcomes."}
              </p>
              {index < flowSteps.length - 1 && (
                <Workflow className="absolute -right-5 top-10 hidden h-8 w-8 text-industrial-amber lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

