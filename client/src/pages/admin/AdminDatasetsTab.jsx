import { useState, useEffect } from 'react';
import {
  Database,
  UploadCloud,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  User,
} from 'lucide-react';
import api from '../../services/api';
import { Card, Button, Input, Badge, Alert, EmptyState, Skeleton } from '../../components/ui';

export default function AdminDatasetsTab() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/datasets');
      setDatasets(response.data || []);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to load datasets.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a CSV dataset file.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('file', file);
    if (name.trim()) formData.append('name', name.trim());

    try {
      const response = await api.post('/admin/datasets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMessage(
        `Dataset "${response.data.name}" uploaded successfully (${response.data.rowCount?.toLocaleString()} rows validated).`
      );
      setName('');
      setFile(null);
      e.target.reset();
      fetchDatasets();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to upload dataset.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, datasetName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete dataset "${datasetName}"? Any trained models referencing it will be affected.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/admin/datasets/${id}`);
      fetchDatasets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete dataset.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload Card */}
      <Card>
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Upload New Training Dataset
            </h3>
            <p className="text-xs text-slate-500">
              CSV file must include labelled rows with a target column <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">fraudulent</code> (0 = Genuine, 1 = Fraudulent).
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4">
            <Alert variant="error" title="Upload Error">
              {errorMessage}
            </Alert>
          </div>
        )}

        {successMessage && (
          <div className="mb-4">
            <Alert variant="success" title="Success">
              {successMessage}
            </Alert>
          </div>
        )}

        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <Input
              label="Dataset Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. EMSCAD Benchmark v2"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              CSV File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          <div className="sm:col-span-3">
            <Button
              type="submit"
              loading={uploading}
              disabled={!file}
              icon={UploadCloud}
              className="w-full"
            >
              {uploading ? 'Validating...' : 'Upload Dataset'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Datasets Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Available Datasets ({datasets.length})
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDatasets}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon={Database}
              title="No datasets uploaded yet"
              description="Upload a CSV dataset above to train customized classification models."
            />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Dataset Name</th>
                    <th className="px-4 py-3.5">Uploaded By</th>
                    <th className="px-4 py-3.5">Total Rows</th>
                    <th className="px-4 py-3.5">Fraudulent</th>
                    <th className="px-4 py-3.5">Genuine</th>
                    <th className="px-4 py-3.5">Upload Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {datasets.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {d.name}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {d.uploadedBy?.name || 'Administrator'}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {d.rowCount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="danger" size="sm">
                          {d.fraudCount?.toLocaleString()} Fraud
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="success" size="sm">
                          {d.genuineCount?.toLocaleString()} Genuine
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(d._id, d.name)}
                          disabled={deletingId === d._id}
                          icon={Trash2}
                        >
                          {deletingId === d._id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked View */}
            <div className="md:hidden divide-y divide-slate-100">
              {datasets.map((d) => (
                <div key={d._id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{d.name}</h4>
                    <span className="text-xs text-slate-500">
                      {d.rowCount?.toLocaleString()} rows
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="danger" size="sm">
                      {d.fraudCount?.toLocaleString()} Fraud
                    </Badge>
                    <Badge variant="success" size="sm">
                      {d.genuineCount?.toLocaleString()} Genuine
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(d._id, d.name)}
                      disabled={deletingId === d._id}
                      icon={Trash2}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
