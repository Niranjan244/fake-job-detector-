import { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCheck2,
  FileWarning,
  Sparkles,
  Building2,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import {
  Card,
  Button,
  Badge,
  Alert,
  StatCard,
} from '../components/ui';

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [exporting, setExporting] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a valid .csv file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a valid .csv file.');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select or drag a CSV file first.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSummary(null);
    setBatchResults([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/analysis/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSummary(response.data);

      if (response.data.batchId) {
        const batchResponse = await api.get(
          `/analysis/batch/${response.data.batchId}`
        );
        setBatchResults(batchResponse.data.data || []);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to process CSV file. Ensure the server and ML service are active.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!summary?.batchId) return;

    setExporting(true);
    try {
      const response = await api.get(
        `/analysis/batch/${summary.batchId}/export`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis-batch-${summary.batchId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to download batch export.'
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Batch Ingestion
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Bulk CSV Job Analysis
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-600">
          Upload a batch of job postings in CSV format to classify multiple listings simultaneously and export auditable reports.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="error" title="Upload Failed">
          {errorMessage}
        </Alert>
      )}

      {/* Upload Zone Card */}
      <Card>
        <form onSubmit={handleUpload} className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/60 ring-4 ring-indigo-500/10'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50/80'
            }`}
          >
            <div className="mx-auto flex flex-col items-center justify-center space-y-3.5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
                  isDragging ? 'scale-110 bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <label className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-700 focus-within:outline-none">
                  <span className="text-sm">Click to choose a CSV file</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>{' '}
                <span className="text-sm text-slate-600">or drag and drop your file here</span>
              </div>

              <p className="text-xs text-slate-500 max-w-sm">
                Requires standard columns such as <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-[11px] text-slate-800">title</code> and <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-[11px] text-slate-800">description</code> (Max 10MB per batch).
              </p>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-sm">
              <div className="flex items-center gap-3 truncate">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-900 truncate">
                  {file.name}
                </span>
                <Badge variant="blue" size="sm">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={!file}
              icon={Sparkles}
              className="w-full sm:w-auto px-8"
            >
              {loading ? 'Processing Batch...' : 'Process Batch CSV'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Summary Section */}
      {summary && (
        <div className="space-y-6 animate-fade-in">
          <Card className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Batch Execution Completed
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-heading mt-0.5">
                  Batch Processing Summary
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Batch ID: {summary.batchId}
                </p>
              </div>

              <Button
                variant="secondary"
                size="md"
                onClick={handleDownload}
                loading={exporting}
                icon={Download}
              >
                {exporting ? 'Exporting...' : 'Export Results CSV'}
              </Button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <StatCard
                title="Total Rows"
                value={summary.total}
                icon={Layers}
              />
              <StatCard
                title="Processed"
                value={summary.processed}
                icon={FileCheck2}
              />
              <StatCard
                title="Genuine"
                value={summary.genuine}
                icon={CheckCircle2}
                trend={{ value: `${Math.round(((summary.genuine || 0) / (summary.processed || 1)) * 100)}% of total`, positive: true }}
              />
              <StatCard
                title="Fraudulent"
                value={summary.fraudulent}
                icon={AlertTriangle}
                trend={{ value: `${Math.round(((summary.fraudulent || 0) / (summary.processed || 1)) * 100)}% high risk`, positive: false }}
              />
              <StatCard
                title="Skipped"
                value={summary.skipped}
                icon={FileWarning}
              />
            </div>

            {/* Skipped Errors Accordion/Box */}
            {summary.errors && summary.errors.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Skipped or Malformed Rows ({summary.errors.length})</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 text-xs text-amber-800 pr-1">
                  {summary.errors.map((err, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-mono font-bold text-amber-900 shrink-0">
                        Row {err.row}:
                      </span>
                      <span>{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Results Table Card */}
          {batchResults.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Batch Evaluation Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing all {batchResults.length} parsed listings
                  </p>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Job Title &amp; Company</th>
                      <th className="px-4 py-3.5">Verdict</th>
                      <th className="px-4 py-3.5">Fraud Risk</th>
                      <th className="px-4 py-3.5">Confidence</th>
                      <th className="px-4 py-3.5">Risk Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchResults.map((item) => {
                      const isFraud = item.result?.label === 'fraudulent';
                      const riskScore = Math.round((item.fraudProbability || 0) * 100);
                      const confScore = Math.round((item.confidence || 0) * 100);

                      return (
                        <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 max-w-xs">
                            <div className="font-semibold text-slate-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {item.companyName || '—'}
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
                            <span
                              className={`text-xs font-bold ${
                                isFraud ? 'text-red-600' : 'text-emerald-600'
                              }`}
                            >
                              {riskScore}%
                            </span>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                            {confScore}%
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge
                              variant={item.indicators?.length > 0 ? 'warning' : 'neutral'}
                              size="sm"
                            >
                              {item.indicators?.length || 0} Flags
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {batchResults.map((item) => {
                  const isFraud = item.result?.label === 'fraudulent';
                  const riskScore = Math.round((item.fraudProbability || 0) * 100);

                  return (
                    <div key={item._id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                            {item.companyName || '—'}
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

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Risk: <strong className={isFraud ? 'text-red-600' : 'text-emerald-600'}>{riskScore}%</strong></span>
                        <span>Confidence: {Math.round((item.confidence || 0) * 100)}%</span>
                        <span>{item.indicators?.length || 0} flags</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
