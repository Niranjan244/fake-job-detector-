import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Eye,
  Trash2,
  Building2,
  User,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';
import api from '../../services/api';
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
} from '../../components/ui';

export default function AdminRecordsTab() {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 15);
      if (search.trim()) params.append('search', search.trim());
      if (labelFilter) params.append('label', labelFilter);
      if (sourceFilter) params.append('source', sourceFilter);

      const response = await api.get(`/admin/analyses?${params.toString()}`);
      setRecords(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to fetch global detection records.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, labelFilter, sourceFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this detection record?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/admin/analyses/${id}`);
      if (selectedRecord?._id === id) {
        setSelectedRecord(null);
      }
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Toolbar */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search title, company, or user..."
              icon={Search}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={labelFilter}
              onChange={(e) => {
                setLabelFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Labels' },
                { value: 'genuine', label: 'Genuine Only' },
                { value: 'fraudulent', label: 'Fraudulent Only' },
              ]}
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Sources' },
                { value: 'single', label: 'Single Form' },
                { value: 'bulk', label: 'Bulk Upload' },
              ]}
            />
          </div>

          <div className="sm:col-span-2 text-right">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
              {total} total records
            </span>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <Alert variant="error" title="Records Error">
          {errorMessage}
        </Alert>
      )}

      {/* Records Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon={FileText}
              title="No records found"
              description="No detection entries match your filter or search query."
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Title &amp; Company</th>
                    <th className="px-4 py-3.5">Submitted By</th>
                    <th className="px-4 py-3.5">Verdict</th>
                    <th className="px-4 py-3.5">Risk Score</th>
                    <th className="px-4 py-3.5">Confidence</th>
                    <th className="px-4 py-3.5">Source</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => {
                    const isFraud = r.result?.label === 'fraudulent';
                    const riskScore = Math.round((r.fraudProbability || 0) * 100);

                    return (
                      <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate">
                            {r.title}
                          </div>
                          {r.companyName && (
                            <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {r.companyName}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600">
                          {r.user?.name || 'Anonymous User'}
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
                          <span
                            className={`text-xs font-bold ${
                              isFraud ? 'text-red-600' : 'text-emerald-600'
                            }`}
                          >
                            {riskScore}%
                          </span>
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600 font-medium">
                          {Math.round((r.confidence || 0) * 100)}%
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 uppercase">
                            {r.source || 'single'}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRecord(r)}
                              icon={Eye}
                            >
                              Inspect
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(r._id)}
                              disabled={deletingId === r._id}
                              icon={Trash2}
                            >
                              {deletingId === r._id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked View */}
            <div className="md:hidden divide-y divide-slate-100">
              {records.map((r) => {
                const isFraud = r.result?.label === 'fraudulent';
                const riskScore = Math.round((r.fraudProbability || 0) * 100);

                return (
                  <div key={r._id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {r.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {r.companyName || '—'}
                        </p>
                      </div>
                      <Badge
                        variant={isFraud ? 'danger' : 'success'}
                        size="sm"
                        dot
                      >
                        {isFraud ? 'Fraud' : 'Genuine'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>By: {r.user?.name || 'Anonymous'}</span>
                      <span>Risk: <strong className={isFraud ? 'text-red-600' : 'text-emerald-600'}>{riskScore}%</strong></span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecord(r)}
                        icon={Eye}
                      >
                        Inspect
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(r._id)}
                        disabled={deletingId === r._id}
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
          </>
        )}
      </Card>

      {/* Global Record Inspect Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.title || 'Global Detection Inspection'}
        maxWidth="max-w-2xl"
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Header Verdict Box */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedRecord.result?.label === 'fraudulent'
                  ? 'bg-red-50/70 border-red-200 text-red-950'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedRecord.result?.label === 'fraudulent' ? (
                  <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Verdict
                  </span>
                  <p className="text-base font-bold">
                    {selectedRecord.result?.label === 'fraudulent'
                      ? 'Potentially Fraudulent'
                      : 'Genuine'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Risk Score
                </span>
                <p className="text-xl font-black font-heading">
                  {Math.round((selectedRecord.fraudProbability || 0) * 100)}%
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 font-medium">User:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedRecord.user?.name || 'Anonymous'} ({selectedRecord.user?.email || 'N/A'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Source:</span>{' '}
                <span className="font-semibold text-slate-800 uppercase">
                  {selectedRecord.source || 'single'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Company:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedRecord.companyName || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Location:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedRecord.location || '—'}
                </span>
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                Triggered Indicators ({selectedRecord.indicators?.length || 0})
              </h4>

              {(!selectedRecord.indicators || selectedRecord.indicators.length === 0) ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                  No risk indicators triggered by the detection pipeline.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedRecord.indicators.map((ind, i) => (
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
                      <p className="text-[11px] text-slate-500">
                        Type: <code className="font-mono text-slate-700">{ind.type}</code>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description Snippet */}
            {selectedRecord.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                  Job Description Content
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {selectedRecord.description}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedRecord(null)}
              >
                Close Inspection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
