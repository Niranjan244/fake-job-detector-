import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, AlertTriangle, ArrowRight, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Alert } from '../components/ui';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success('Account created successfully');
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Unable to create account. Please check your information and try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch">
      {/* Left side: Premium Gradient Feature Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 p-12 text-white flex-col justify-between overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-900/40 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold tracking-wide text-indigo-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Recruitment Security Platform
          </div>
          <h2 className="mt-6 text-3xl xl:text-4xl font-extrabold font-heading tracking-tight leading-tight">
            Protect your career and personal identity.
          </h2>
          <p className="mt-3 text-sm text-indigo-100/90 max-w-md leading-relaxed">
            Gain immediate access to our machine learning classifier, suspicious keyword heuristics, and batch analysis tools.
          </p>
        </div>

        <div className="relative z-10 space-y-6 my-8">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="p-2.5 rounded-xl bg-white/10 shrink-0">
              <Cpu className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Machine Learning Pattern Classifier
              </h4>
              <p className="text-xs text-indigo-100/80 mt-0.5">
                Evaluates linguistic subtleties and missing corporate attributes against verified dataset distributions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="p-2.5 rounded-xl bg-white/10 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Rule-Based Red Flag Detection
              </h4>
              <p className="text-xs text-indigo-100/80 mt-0.5">
                Pinpoints upfront fees, sensitive data harvesting, disposable email domains, and Telegram redirection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="p-2.5 rounded-xl bg-white/10 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Bulk Ingestion &amp; Personal Audit History
              </h4>
              <p className="text-xs text-indigo-100/80 mt-0.5">
                Scan whole CSV batches simultaneously and maintain a persistent detection trail with analytical charts.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-indigo-200/70 border-t border-white/10 pt-4">
          FraudShield Enterprise Detection Engine
        </div>
      </div>

      {/* Right side: Clean Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign up to verify job postings and track recruitment safety
            </p>
          </div>

          {errorMessage && (
            <Alert variant="error" title="Registration Error">
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
            />

            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              helperText="Must be at least 6 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full py-2.8 shadow-sm"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
