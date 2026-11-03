import { useState } from 'react';
import {
  Briefcase,
  Building2,
  UserCheck,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  RotateCcw,
  Sparkles,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Send,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import {
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Alert,
} from '../components/ui';

const SEVERITY_CONFIG = {
  high: {
    icon: ShieldAlert,
    badgeVariant: 'danger',
    borderClass: 'border-l-4 border-l-red-500 bg-red-50/40 border-slate-200',
    iconColor: 'text-red-600',
  },
  medium: {
    icon: AlertTriangle,
    badgeVariant: 'warning',
    borderClass: 'border-l-4 border-l-amber-500 bg-amber-50/40 border-slate-200',
    iconColor: 'text-amber-600',
  },
  low: {
    icon: Info,
    badgeVariant: 'blue',
    borderClass: 'border-l-4 border-l-blue-500 bg-blue-50/40 border-slate-200',
    iconColor: 'text-blue-600',
  },
};

const EXPLANATIONS = {
  suspicious_keywords:
    'Requests for upfront fees, wire transfers, or rapid onboarding without interviews are strong signals of recruitment scams.',
  sensitive_data_request:
    'Legitimate companies never ask for banking details, identity documents (Aadhaar/SSN), or OTPs during initial application stages.',
  free_email_domain:
    'Authentic recruiters use verified corporate domains rather than disposable or free email providers.',
  messaging_app_contact:
    'Redirecting communication entirely to Telegram or WhatsApp is frequently used by scammers to avoid traceability.',
  missing_company_profile:
    'The absence of company history or website details prevents verification of legitimate business operations.',
  missing_company_logo:
    'Lack of recognized brand assets is common in mass-generated fraudulent job listings.',
  unrealistic_compensation:
    'Abnormally high compensation for basic or entry-level roles is a deceptive hook to attract victims.',
};

export default function AnalyzeJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    companyProfile: '',
    description: '',
    requirements: '',
    benefits: '',
    salaryRange: '',
    location: '',
    employmentType: 'Full-time',
    recruiterEmail: '',
    recruiterContact: '',
    applicationMethod: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResult(null);

    if (!formData.title.trim()) {
      setErrorMessage('Job title is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/analysis', formData);
      setResult(response.data);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Analysis failed. Ensure the ML service and server are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMessage('');
  };

  // Group indicators by severity
  const groupedIndicators = (result?.indicators || []).reduce((acc, curr) => {
    const sev = curr.severity || 'low';
    if (!acc[sev]) acc[sev] = [];
    acc[sev].push(curr);
    return acc;
  }, {});

  const isFraudulent = result?.result?.label === 'fraudulent';
  const fraudPercent = result ? Math.round(result.fraudProbability * 100) : 0;
  const confidencePercent = result ? Math.round(result.confidence * 100) : 0;

  // Gauge calculations (Radius 48, Circumference = 2 * PI * 48 = 301.59)
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fraudPercent / 100) * circumference;

  const gaugeColor =
    fraudPercent > 60
      ? 'stroke-red-500'
      : fraudPercent >= 30
      ? 'stroke-amber-500'
      : 'stroke-emerald-500';

  const gaugeTextColor =
    fraudPercent > 60
      ? 'text-red-600'
      : fraudPercent >= 30
      ? 'text-amber-600'
      : 'text-emerald-600';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Real-time AI Verification
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Analyze Job Posting
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-600">
          Inspect linguistic cues, recruiter metadata, and compensation patterns to spot recruitment scams before applying.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="error" title="Analysis Error">
          {errorMessage}
        </Alert>
      )}

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Grouped Form (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Job Details */}
          <Card>
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  Job Details
                </h2>
                <p className="text-xs text-slate-500">
                  Core position specifications and compensation structure
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Remote Data Entry Specialist"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Employment Type"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  options={[
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Part-time', label: 'Part-time' },
                    { value: 'Contract', label: 'Contract' },
                    { value: 'Temporary', label: 'Temporary' },
                    { value: 'Internship', label: 'Internship' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />

                <Input
                  label="Compensation / Salary Range"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  placeholder="e.g. $45,000 - $60,000"
                  icon={DollarSign}
                />
              </div>

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Austin, TX / Remote"
                icon={MapPin}
              />
            </div>
          </Card>

          {/* Section 2: Company Information */}
          <Card>
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  Company Information
                </h2>
                <p className="text-xs text-slate-500">
                  Organization name, operating history, and overview
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Apex Global Solutions LLC"
                icon={Building2}
              />

              <Textarea
                label="Company Profile & Background"
                name="companyProfile"
                rows={3}
                value={formData.companyProfile}
                onChange={handleChange}
                placeholder="Briefly describe the company history, verified website, or operating industry..."
              />
            </div>
          </Card>

          {/* Section 3: Recruiter Details */}
          <Card>
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  Recruiter Information
                </h2>
                <p className="text-xs text-slate-500">
                  Contact channels used during communication
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Recruiter Email Address"
                type="email"
                name="recruiterEmail"
                value={formData.recruiterEmail}
                onChange={handleChange}
                placeholder="recruiter@company.com"
                icon={Mail}
              />

              <Input
                label="Phone or Messaging ID"
                name="recruiterContact"
                value={formData.recruiterContact}
                onChange={handleChange}
                placeholder="+1-555-0199 / @telegram_tag"
                icon={Phone}
              />
            </div>
          </Card>

          {/* Section 4: Application Details & Descriptions */}
          <Card>
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  Application Details & Content
                </h2>
                <p className="text-xs text-slate-500">
                  Job posting copy evaluated by linguistic NLP model
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea
                label="Full Job Description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Paste the daily responsibilities, role expectations, and tasks here..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textarea
                  label="Candidate Requirements"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Required qualifications, tools, or degrees..."
                />

                <Textarea
                  label="Benefits & Offerings"
                  name="benefits"
                  rows={3}
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Remote allowance, healthcare, bonus..."
                />
              </div>

              <Input
                label="Application Method & Instructions"
                name="applicationMethod"
                value={formData.applicationMethod}
                onChange={handleChange}
                placeholder="e.g. Email resume, direct link, or Google Form"
                icon={Send}
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full sm:w-auto px-8"
              icon={Sparkles}
            >
              {loading ? 'Evaluating Fraud Risk...' : 'Run Fraud Analysis'}
            </Button>
          </div>
        </form>

        {/* Right Column: Sticky Result Panel (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          {result ? (
            <Card className="animate-fade-in border-slate-200 shadow-soft-lg space-y-6">
              {/* Verdict Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Detection Verdict
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-heading mt-0.5 line-clamp-1">
                    {result.title}
                  </h3>
                  {result.companyName && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {result.companyName}
                    </p>
                  )}
                </div>

                <Badge
                  variant={isFraudulent ? 'danger' : 'success'}
                  size="md"
                  dot
                  className="shrink-0"
                >
                  {isFraudulent ? 'Potentially Fraudulent' : 'Genuine'}
                </Badge>
              </div>

              {/* Circular Gauge & Confidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                {/* SVG Gauge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg
                      className="w-full h-full -rotate-90 transform"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        className="stroke-slate-200 fill-none"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        className={`${gaugeColor} fill-none transition-all duration-1000 ease-out`}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className={`text-2xl font-black font-heading ${gaugeTextColor}`}>
                        {fraudPercent}%
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-500">
                        Risk Score
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 font-medium text-center">
                    Fraud Probability
                  </p>
                </div>

                {/* Model Confidence Metric */}
                <div className="space-y-3 sm:border-l sm:border-slate-200 sm:pl-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-600">Model Confidence</span>
                      <span className="text-slate-900 font-bold">{confidencePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-indigo-600 transition-all duration-700 ease-out"
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Evaluated by trained ensemble NLP classifier against high-frequency recruitment fraud patterns.
                  </div>
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                    Detected Indicators ({result.indicators?.length || 0})
                  </h4>
                  {result.indicators?.length > 0 && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Ordered by risk impact
                    </span>
                  )}
                </div>

                {(!result.indicators || result.indicators.length === 0) ? (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">No high-risk indicators detected</p>
                      <p className="text-emerald-700 mt-0.5">
                        This job posting conforms to common legitimate hiring practices.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {['high', 'medium', 'low'].map((severity) => {
                      const items = groupedIndicators[severity];
                      if (!items || items.length === 0) return null;
                      const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
                      const IconComp = config.icon;

                      return items.map((ind, idx) => (
                        <div
                          key={`${severity}-${idx}`}
                          className={`p-3.5 rounded-xl border ${config.borderClass} space-y-1.5 transition`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <IconComp className={`w-3.5 h-3.5 ${config.iconColor} shrink-0`} />
                              <span className="text-xs font-bold text-slate-900 leading-snug">
                                {ind.detail}
                              </span>
                            </div>
                            <Badge
                              variant={config.badgeVariant}
                              size="sm"
                              className="capitalize shrink-0"
                            >
                              {severity}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            <span className="font-semibold text-slate-700">Why this matters: </span>
                            {EXPLANATIONS[ind.type] ||
                              'This pattern deviates from verified employment practices.'}
                          </p>
                        </div>
                      ));
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  icon={RotateCcw}
                >
                  Clear Results
                </Button>
                <span className="text-[11px] text-slate-400">
                  ID: {result._id ? result._id.slice(-6) : 'Local'}
                </span>
              </div>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-slate-200/90 bg-white/60 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Awaiting Analysis Input
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Fill in the job details on the left and click <strong>Run Fraud Analysis</strong> to generate a comprehensive risk verdict, probability gauge, and indicator breakdown.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
