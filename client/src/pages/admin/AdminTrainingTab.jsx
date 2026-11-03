import { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Activity,
  Layers,
  Zap,
  Target,
  BarChart2,
} from 'lucide-react';
import api from '../../services/api';
import {
  Card,
  Button,
  Select,
  Badge,
  Alert,
  EmptyState,
  Skeleton,
} from '../../components/ui';

export default function AdminTrainingTab() {
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [algorithm, setAlgorithm] = useState('logistic_regression');
  const [setActive, setSetActive] = useState(true);
  const [training, setTraining] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    try {
      const [dsRes, modelsRes] = await Promise.all([
        api.get('/admin/datasets'),
        api.get('/admin/models'),
      ]);
      setDatasets(dsRes.data || []);
      setModels(modelsRes.data || []);
      if (dsRes.data?.length > 0 && !selectedDataset) {
        setSelectedDataset(dsRes.data[0]._id);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to load training resources.'
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTrain = async (e) => {
    e.preventDefault();
    if (!selectedDataset) {
      setErrorMessage('Please select a dataset to train on.');
      return;
    }

    setTraining(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post('/admin/train', {
        datasetId: selectedDataset,
        algorithm,
        setActive,
      });

      const metrics = response.data;
      setSuccessMessage(
        `Model trained successfully using ${algorithm.replace(/_/g, ' ')}! F1 Score: ${metrics.f1Score || metrics.f1_score}`
      );
      loadData();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Training failed. Ensure the Python ML service is running with scikit-learn.'
      );
    } finally {
      setTraining(false);
    }
  };

  const handleActivate = async (id) => {
    setActivatingId(id);
    try {
      await api.patch(`/admin/models/${id}/activate`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set model as active.');
    } finally {
      setActivatingId(null);
    }
  };

  // Find active model if any
  const activeModel = models.find((m) => m.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Training Configuration Card */}
      <Card>
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Train New Classifier Model
            </h3>
            <p className="text-xs text-slate-500">
              Executes TF-IDF feature extraction and stratified k-fold classification on the ML backend.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4">
            <Alert variant="error" title="Training Error">
              {errorMessage}
            </Alert>
          </div>
        )}

        {successMessage && (
          <div className="mb-4">
            <Alert variant="success" title="Training Complete">
              {successMessage}
            </Alert>
          </div>
        )}

        {datasets.length === 0 ? (
          <Alert variant="warning" title="No Datasets Available">
            Please upload a training CSV in the <strong>Datasets</strong> tab first before launching a model training cycle.
          </Alert>
        ) : (
          <form onSubmit={handleTrain} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Target Dataset"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                options={datasets.map((d) => ({
                  value: d._id,
                  label: `${d.name} (${d.rowCount?.toLocaleString()} rows)`,
                }))}
              />

              <Select
                label="Classification Algorithm"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                options={[
                  {
                    value: 'logistic_regression',
                    label: 'Logistic Regression (Fast, Linear, Interpretable)',
                  },
                  {
                    value: 'random_forest',
                    label: 'Random Forest (Ensemble Trees, Non-linear)',
                  },
                ]}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="setActiveCheck"
                checked={setActive}
                onChange={(e) => setSetActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="setActiveCheck"
                className="text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Automatically activate this model for inference upon successful training
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                loading={training}
                icon={Zap}
                className="w-full sm:w-auto px-8"
              >
                {training ? 'Training Classifier Pipeline (15-60s)...' : 'Start Model Training'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Active Model Snapshot Card (if active model exists) */}
      {activeModel && (
        <Card className="bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 border-indigo-100">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Currently Serving In Production
              </span>
            </div>
            <Badge variant="success" size="sm" dot>
              Active Model
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-white/80 rounded-xl border border-indigo-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Accuracy
              </span>
              <p className="text-xl font-black text-slate-900 font-heading mt-0.5">
                {Math.round((activeModel.accuracy || 0) * 1000) / 10}%
              </p>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-indigo-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Precision
              </span>
              <p className="text-xl font-black text-slate-900 font-heading mt-0.5">
                {Math.round((activeModel.precision || 0) * 1000) / 10}%
              </p>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-indigo-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Recall
              </span>
              <p className="text-xl font-black text-slate-900 font-heading mt-0.5">
                {Math.round((activeModel.recall || 0) * 1000) / 10}%
              </p>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-indigo-50">
              <span className="text-[11px] font-semibold text-indigo-700 uppercase">
                F1 Score
              </span>
              <p className="text-xl font-black text-indigo-600 font-heading mt-0.5">
                {Math.round((activeModel.f1Score || 0) * 1000) / 10}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Model Performance Comparison Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Trained Models Comparison ({models.length})
            </h3>
            <p className="text-xs text-slate-500">
              Benchmark metrics across all trained model iterations
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>

        {models.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon={Cpu}
              title="No models trained yet"
              description="Configure training options above to produce your first evaluated classification checkpoint."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Algorithm</th>
                  <th className="px-4 py-3.5">Dataset</th>
                  <th className="px-4 py-3.5">Accuracy</th>
                  <th className="px-4 py-3.5">Precision</th>
                  <th className="px-4 py-3.5">Recall</th>
                  <th className="px-4 py-3.5">F1 Score</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {models.map((m) => (
                  <tr
                    key={m._id}
                    className={`transition-colors ${
                      m.isActive ? 'bg-indigo-50/50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900 capitalize">
                      {m.algorithm?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {m.dataset?.name || 'Dataset'}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {Math.round((m.accuracy || 0) * 1000) / 10}%
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {Math.round((m.precision || 0) * 1000) / 10}%
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {Math.round((m.recall || 0) * 1000) / 10}%
                    </td>
                    <td className="px-4 py-4 font-bold text-indigo-600">
                      {Math.round((m.f1Score || 0) * 1000) / 10}%
                    </td>
                    <td className="px-4 py-4">
                      {m.isActive ? (
                        <Badge variant="success" size="sm" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Standby
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!m.isActive && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleActivate(m._id)}
                          disabled={activatingId === m._id}
                        >
                          {activatingId === m._id ? 'Activating...' : 'Set Active'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
