import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { certificateService, type CertificateStatus } from '../services/certificateService';
import confetti from 'canvas-confetti';
import {
  Award,
  Download,
  CheckCircle2,
  Lock,
  Sparkles,
  Shield,
  Loader2,
  Calendar,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CertificatePage: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<CertificateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await certificateService.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load certificate status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await certificateService.downloadPdf();
      
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00f0ff', '#a855f7', '#10b981', '#f59e0b']
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VisionFusion_Certificate_${user?.full_name?.replace(/\s+/g, '_') || 'Student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download certificate. Ensure you have achieved at least 70% XP (350+ XP).');
    } finally {
      setDownloading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Banner */}
        <div className="cyber-card p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Official Certification Portal
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
              Vision Fusion 2.0 <span className="cyber-gradient-text">Digital Certificate</span>
            </h1>
            <p className="text-slate-400 text-sm font-mono leading-relaxed">
              Awarded jointly by IEEE IAS Student Branch Chapter & IEEE WIE Affinity Group of Uva Wellassa University. Reach at least 70% XP (350+ XP out of 500 XP) across events and quizzes to claim your verified certificate.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="cyber-card p-16 flex flex-col items-center justify-center text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              Evaluating Certificate Status...
            </span>
          </div>
        ) : status && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Certificate Preview Frame */}
            <div className="lg:col-span-7 cyber-card p-6 md:p-8 relative overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(0,240,255,0.25)]">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {/* Certificate Mockup Visual */}
              <div className="p-6 md:p-8 rounded-xl bg-cyber-dark/90 border border-cyber-border text-center space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  <Shield className="w-4 h-4 text-cyan-400" /> IEEE Official Certificate
                </div>

                <h3 className="text-xl md:text-2xl font-black cyber-gradient-text font-display uppercase tracking-wider">
                  Vision Fusion 2.0 – Tech Career Week
                </h3>

                <p className="text-[11px] text-slate-400 font-mono">
                  This Certificate of Achievement is presented to
                </p>

                <div className="text-xl md:text-2xl font-bold text-white tracking-wide border-b border-cyber-border/80 pb-3 max-w-sm mx-auto font-display">
                  {user.full_name}
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-md mx-auto">
                  for outstanding participation, mastering technical sessions, excelling in knowledge quizzes, and achieving <span className="text-cyan-400 font-bold">{status.current_xp} XP</span>.
                </p>

                <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono text-slate-400 border-t border-cyber-border/80">
                  <div>
                    <span className="text-cyan-400 font-bold block">IEEE IAS Chapter</span>
                    <span>Uva Wellassa University</span>
                  </div>

                  <div className="text-center">
                    <span className="text-slate-300 font-bold block">
                      {status.certificate_id || 'ID: PENDING_UNLOCK'}
                    </span>
                    <span>Verification Hash Protected</span>
                  </div>

                  <div>
                    <span className="text-purple-400 font-bold block">IEEE WIE Group</span>
                    <span>Uva Wellassa University</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Eligibility & Download Action Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="cyber-card p-6">
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" /> Qualification Progress
                </h2>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300">Overall Progress</span>
                    <span className="text-cyan-400 font-bold">{status.overall_percentage}% / 70.0%</span>
                  </div>
                  <div className="w-full bg-cyber-dark h-3 rounded-full overflow-hidden border border-cyber-border">
                    <div
                      className={`h-full transition-all duration-500 ${
                        status.is_eligible
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-glow-emerald'
                          : 'bg-gradient-to-r from-amber-500 to-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, (status.current_xp / 350) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                    <span>Current: {status.current_xp} XP</span>
                    <span>Required: {status.threshold_xp} XP (70%)</span>
                  </div>
                </div>

                {/* Status Box */}
                {status.is_eligible ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Congratulations! You have qualified for certification.
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans">
                      Your cryptographic IEEE Certificate is ready for immediate download.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono">
                      <Lock className="w-4 h-4 text-amber-400" />
                      Certificate Locked ({Math.max(0, 350 - status.current_xp)} XP needed)
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans">
                      Attend event sessions and take quizzes to reach the 350 XP threshold.
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {status.is_eligible ? (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full cyber-btn-primary py-3.5 text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 shadow-glow-cyan"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download Official PDF Certificate
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/quizzes"
                      className="w-full cyber-btn-primary py-2.5 text-xs font-mono uppercase font-bold flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" /> Earn XP via Quizzes
                    </Link>
                    <Link
                      to="/events"
                      className="w-full cyber-btn-secondary py-2 text-xs font-mono flex items-center justify-center gap-2 text-slate-300"
                    >
                      <Calendar className="w-4 h-4 text-cyan-400" /> View Sessions Agenda
                    </Link>
                  </div>
                )}
              </div>

              {/* Security & Verification Card */}
              <div className="cyber-card p-4 text-xs font-mono text-slate-400 space-y-2">
                <div className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> Tamper-Proof Digital Verification
                </div>
                <p className="text-[11px] leading-relaxed">
                  Every certificate includes a SHA-256 cryptographic verification token and is stored in PostgreSQL. Employers and academic institutions can verify authenticity.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CertificatePage;
