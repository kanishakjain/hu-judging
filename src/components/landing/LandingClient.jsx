'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap, Users, LayoutDashboard, ChevronRight, CheckCircle2 } from "lucide-react";

export default function LandingClient() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="shell" style={{ overflow: 'hidden' }}>
      {/* Background glow effects */}
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '50vh', background: 'radial-gradient(ellipse at top, rgba(129, 140, 248, 0.15), transparent 70%)', pointerEvents: 'none', zIndex: -1 }}></div>

      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div className="brand" style={{ fontSize: '1.25rem' }}>
          <span className="dot" style={{ width: 10, height: 10 }}></span>
          Hacker's Unity
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/judge/login" className="btn btn-secondary btn-sm">Judge Login</Link>
          <Link href="/organizer/login" className="btn btn-primary btn-sm">Organizer Login</Link>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Hero Section */}
        <motion.section 
          className="page" 
          style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-soft)', padding: '6px 12px', borderRadius: 100, border: '1px solid var(--accent-dim)' }}>
            <Zap size={14} /> The Next-Gen Judging Platform
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="title" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1, marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            Score hackathons with <br /> <span style={{ color: 'var(--accent-primary)' }}>surgical precision.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="muted" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', maxWidth: 600, margin: '0 auto 3rem', lineHeight: 1.6 }}>
            The fastest, most elegant way to manage teams, assign judges, and calculate live leaderboards for your next big event.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/organizer/login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Start as Organizer <ChevronRight size={18} />
            </Link>
            <Link href="/judge/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Judge Portal
            </Link>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section className="page" style={{ paddingTop: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                <LayoutDashboard size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Live Organizer Dashboard</h3>
              <p className="muted">Track judge progress, advance teams automatically, and monitor live leaderboards without refreshing.</p>
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Frictionless Judging</h3>
              <p className="muted">Judges get a distraction-free scoring interface with keyboard shortcuts, auto-saving, and fast navigation.</p>
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Enterprise Security</h3>
              <p className="muted">Strict role-based access control, secure authentication loops, and robust data isolation out of the box.</p>
            </motion.div>

          </div>
        </section>

        {/* Workflows */}
        <section className="page" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="title">Built for speed. Designed for scale.</h2>
            <p className="muted" style={{ maxWidth: 600, margin: '0 auto' }}>Everything you need from kickoff to closing ceremony.</p>
          </div>
          
          <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} /> For Organizers
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                  <li>Create custom judging rounds</li>
                  <li>Import teams via CSV</li>
                  <li>Assign specific criteria & max scores</li>
                  <li>Auto-advance top teams</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} /> For Judges
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                  <li>Login with unique Judge IDs</li>
                  <li>Intuitive bubble-scoring UI</li>
                  <li>Provide detailed text feedback</li>
                  <li>Real-time sync to dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>&copy; {new Date().getFullYear()} Hacker's Unity. All rights reserved.</p>
      </footer>
    </div>
  );
}
