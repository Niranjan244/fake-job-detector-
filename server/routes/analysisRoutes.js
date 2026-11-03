import express from 'express';
import {
  createAnalysis,
  analyzeBulkCsv,
  getBatchResults,
  exportBatchCsv,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis,
} from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadCsv } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// Bulk batch routes (mounted before :id to prevent path collision)
router.post('/bulk', uploadCsv.single('file'), analyzeBulkCsv);
router.get('/batch/:batchId/export', exportBatchCsv);
router.get('/batch/:batchId', getBatchResults);

// Individual analysis routes
router.post('/', createAnalysis);
router.get('/', getAnalysisHistory);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

export default router;
