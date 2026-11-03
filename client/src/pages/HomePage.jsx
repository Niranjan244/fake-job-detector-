import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  UploadCloud,
  FileCheck2,
  DollarSign,
  Lock,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  History,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge } from '../components/ui';

export default function HomePage() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  // If user is already logged in, show their workspace hub
  if (isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-8 sm:p-10 shadow-soft-lg">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-indigo-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              Authenticated Session
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 max-w-2xl leading-relaxed">
              Verify recruitment legitimacy, inspect suspicious job offers, and analyze batch CSV records using our machine learning classification pipeline.
            </p>
          </div>
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        </div>

        {/* Quick Action Cards */}
        <div>
          <h2 className="text-base font-bold text-slate-900 font-heading tracking-tight mb-4">
            Security Tools &amp; Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/analyze" className="group">
              <Card hoverLift padding="sm" className="h-full flex flex-col justify-between p-5 border-indigo-100 group-hover:border-indigo-300">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Analyze Job
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Evaluate a single job posting by filling in title, recruiter metadata, and description text.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600">
                  <span>Start evaluation</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>

            <Link to="/bulk" className="group">
              <Card hoverLift padding="sm" className="h-full flex flex-col justify-between p-5 border-indigo-100 group-hover:border-indigo-300">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      Bulk Ingestion
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Upload a CSV batch of job listings to execute high-throughput parallel fraud classification.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-violet-600">
                  <span>Upload CSV</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>

            <Link to="/history" className="group">
              <Card hoverLift padding="sm" className="h-full flex flex-col justify-between p-5 border-slate-200 group-hover:border-slate-300">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Analysis History
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Search and review past evaluation reports, flagged indicators, and probability scores.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-slate-700">
                  <span>View records</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>

            <Link to="/analytics" className="group">
              <Card hoverLift padding="sm" className="h-full flex flex-col justify-between p-5 border-slate-200 group-hover:border-slate-300">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      My Analytics
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Explore classification distributions, timeline graphs, and common risk indicators.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
                  <span>Open charts</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Account Details Box */}
        <Card className="bg-white p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">
                Session Identity
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {user?.name}
              </h4>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isAdmin ? 'warning' : 'brand'} size="lg" dot>
                {isAdmin ? 'Administrator Privileges' : 'Jobseeker Account'}
              </Badge>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="secondary" size="sm">
                    Open Admin Console
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Logged-out Landing Page
  return (
    <div className="space-y-20 sm:space-y-28 py-6 sm:py-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 shadow-2xs">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>AI-Powered Recruitment Safety Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 font-heading tracking-tight leading-[1.15]">
          Spot fraudulent job offers{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
            before you apply.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          FraudShield analyzes job postings using machine learning and rule-based inspection to protect jobseekers from upfront payment scams, identity theft, and fake corporate listings.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto shadow-md">
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Sign In to Workspace
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
            Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            How FraudShield Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Three sequential stages of assessment combine predictive AI with deterministic fraud heuristics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverLift className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold flex items-center justify-center text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Input Job Metadata
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste the job posting description, company name, compensation figures, and recruiter contact details, or upload whole CSV batches.
            </p>
          </Card>

          <Card hoverLift className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 font-extrabold flex items-center justify-center text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Dual-Engine Scan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The scikit-learn classifier checks semantic patterns against real fraud datasets while the rules module inspects payment, domain, and contact irregularities.
            </p>
          </Card>

          <Card hoverLift className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-extrabold flex items-center justify-center text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Transparent Risk Verdict
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive a classification badge (Genuine vs. Potentially Fraudulent), a fraud probability percentage, and itemized warning indicators with explanations.
            </p>
          </Card>
        </div>
      </section>

      {/* Red Flags We Detect */}
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-red-600">
            Threat Detection
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Red Flags We Detect Automatically
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Our engine continuously flags common patterns exploited by scammers to victimize applicants.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card hoverLift className="space-y-3 border-red-100/80 bg-gradient-to-b from-white to-red-50/20">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Upfront Fees &amp; Deposits
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detection of demands for registration fees, equipment deposits, processing charges, or wire transfers prior to employment.
            </p>
          </Card>

          <Card hoverLift className="space-y-3 border-amber-100/80 bg-gradient-to-b from-white to-amber-50/20">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Personal Data Harvesting
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Alerts when postings demand sensitive identity documents (Aadhaar, SSN, passport copies) or bank details during initial screening.
            </p>
          </Card>

          <Card hoverLift className="space-y-3 border-indigo-100/80 bg-gradient-to-b from-white to-indigo-50/20">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Unrealistic Compensation
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Catches disproportionately high salary claims for basic entry-level roles (e.g. $100k+ for typing or data entry).
            </p>
          </Card>

          <Card hoverLift className="space-y-3 border-purple-100/80 bg-gradient-to-b from-white to-purple-50/20">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Messaging-App Redirection
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Flags recruiters operating exclusively via Telegram or WhatsApp while concealing verifiable corporate domains and profiles.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 pt-8 pb-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-700">
          FraudShield &copy; {new Date().getFullYear()} — Fake Job Posting &amp; Recruitment Fraud Detection System.
        </p>
        <p className="text-slate-600">
          Powered by React, Express, MongoDB, and Python FastAPI + scikit-learn.
        </p>
      </footer>
    </div>
  );
}
