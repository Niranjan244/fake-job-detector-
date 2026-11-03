import express from 'express';
import {
  uploadDataset,
  getDatasets,
  getDatasetById,
  deleteDataset,
  trainModel,
  getModels,
  activateModel,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllAnalyses,
  deleteAnyAnalysis,
  getAdminStats,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadDatasetCsv } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Restrict all routes in this router to authenticated administrators
router.use(protect, authorizeRoles('admin'));

// Stats
router.get('/stats', getAdminStats);

// Datasets
router.post('/datasets', uploadDatasetCsv.single('file'), uploadDataset);
router.get('/datasets', getDatasets);
router.get('/datasets/:id', getDatasetById);
router.delete('/datasets/:id', deleteDataset);

// Training & Models
router.post('/train', trainModel);
router.get('/models', getModels);
router.patch('/models/:id/activate', activateModel);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Detection Records
router.get('/analyses', getAllAnalyses);
router.delete('/analyses/:id', deleteAnyAnalysis);

export default router;
