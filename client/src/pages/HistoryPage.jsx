import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  UploadCloud,
  Eye,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Mail,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  Alert,
  EmptyState,
  Pagination,
  Skeleton,
} from '../components/ui';

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

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (labelFilter) params.append('label', labelFilter);

      const response = await api.get(`/analysis?${params.toString()}`);
      setAnalyses(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to load analysis history.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, labelFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis record?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/analysis/${id}`);
      if (selectedAnalysis?._id === id) {
        setSelectedAnalysis(null);
      }
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Analysis History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review past evaluations, risk indicators, and fraud classification audit trails.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/analyze">
            <Button size="md" icon={Plus}>
              New Analysis
            </Button>
          </Link>
          <Link to="/bulk">
            <Button variant="secondary" size="md" icon={UploadCloud}>
              Bulk Upload
            </Button>
          </Link>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="error" title="Error">
          {errorMessage}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by job title or company name..."
              icon={Search}
            />
          </div>

          <div className="sm:col-span-4">
            <Select
              value={labelFilter}
              onChange={(e) => {
                setLabelFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Verdicts' },
                { value: 'genuine', label: 'Genuine Only' },
                { value: 'fraudulent', label: 'Fraudulent Only' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Content Section */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={Search}
          title={search || labelFilter ? 'No matching records' : 'No analyses yet'}
          description={
            search || labelFilter
              ? 'Try modifying your search keywords or clearing active filters.'
              : 'You have not evaluated any job postings yet. Analyze a job listing to start building your fraud audit trail.'
          }
          actionLabel={!search && !labelFilter ? 'Analyze First Job' : undefined}
          onAction={!search && !labelFilter ? () => (window.location.href = '/analyze') : undefined}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Job Title &amp; Company</th>
                  <th className="px-4 py-3.5">Verdict</th>
                  <th className="px-4 py-3.5">Fraud Risk</th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyses.map((item) => {
                  const isFraud = item.result?.label === 'fraudulent';
                  const riskScore = Math.round((item.fraudProbability || 0) * 100);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {item.companyName || 'Unspecified Organization'}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge
                          variant={isFraud ? 'danger' : 'success'}
                          size="sm"
                          dot
                        >
                          {isFraud ? 'Fraudulent' : 'Genuine'}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                isFraud ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${riskScore}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isFraud ? 'text-red-600' : 'text-emerald-600'
                            }`}
                          >
                            {riskScore}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 uppercase">
                          {item.source || 'single'}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAnalysis(item)}
                            icon={Eye}
                          >
                            Details
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            icon={Trash2}
                          >
                            {deletingId === item._id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {analyses.map((item) => {
              const isFraud = item.result?.label === 'fraudulent';
              const riskScore = Math.round((item.fraudProbability || 0) * 100);

              return (
                <div key={item._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.companyName || 'Unspecified Company'}
                      </p>
                    </div>
                    <Badge
                      variant={isFraud ? 'danger' : 'success'}
                      size="sm"
                      dot
                    >
                      {isFraud ? 'Fraudulent' : 'Genuine'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Risk: <strong className={isFraud ? 'text-red-600' : 'text-emerald-600'}>{riskScore}%</strong></span>
                    <span className="capitalize">{item.source || 'single'}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAnalysis(item)}
                      icon={Eye}
                    >
                      View Report
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      icon={Trash2}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={total}
            />
          </div>
        </Card>
      )}

      {/* Detailed Analysis Modal */}
      <Modal
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        title={selectedAnalysis?.title || 'Job Analysis Report'}
        maxWidth="max-w-2xl"
      >
        {selectedAnalysis && (
          <div className="space-y-6">
            {/* Header Verdict Box */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedAnalysis.result?.label === 'fraudulent'
                  ? 'bg-red-50/70 border-red-200 text-red-950'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedAnalysis.result?.label === 'fraudulent' ? (
                  <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Classification
                  </span>
                  <p className="text-base font-bold">
                    {selectedAnalysis.result?.label === 'fraudulent'
                      ? 'Potentially Fraudulent Offer'
                      : 'Genuine Job Posting'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Risk Score
                </span>
                <p className="text-xl font-black font-heading">
                  {Math.round((selectedAnalysis.fraudProbability || 0) * 100)}%
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Company:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedAnalysis.companyName || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Location:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedAnalysis.location || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Salary Range:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedAnalysis.salaryRange || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Employment Type:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedAnalysis.employmentType || '—'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-medium">Recruiter Email:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedAnalysis.recruiterEmail || '—'}
                </span>
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                Identified Indicators ({selectedAnalysis.indicators?.length || 0})
              </h4>

              {(!selectedAnalysis.indicators ||
                selectedAnalysis.indicators.length === 0) ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                  No fraud risk indicators flagged for this listing.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedAnalysis.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {ind.detail}
                        </span>
                        <Badge
                          variant={
                            ind.severity === 'high'
                              ? 'danger'
                              : ind.severity === 'medium'
                              ? 'warning'
                              : 'blue'
                          }
                          size="sm"
                          className="capitalize"
                        >
                          {ind.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">Explanation: </span>
                        {EXPLANATIONS[ind.type] ||
                          'This characteristic diverges from standard recruitment benchmarks.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description Snippet */}
            {selectedAnalysis.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                  Job Description Excerpt
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {selectedAnalysis.description}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAnalysis(null)}
              >
                Close Report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
