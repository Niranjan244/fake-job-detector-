import fs from 'fs';
import path from 'path';
import axios from 'axios';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import Dataset from '../models/Dataset.js';
import ModelRecord from '../models/ModelRecord.js';
import User from '../models/User.js';
import Analysis from '../models/Analysis.js';

// ==========================================
// Datasets
// ==========================================

export const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV dataset file' });
    }

    const filePath = path.resolve(req.file.path);
    const columns = [];
    let rowCount = 0;
    let fraudCount = 0;
    let genuineCount = 0;
    let hasFraudulentColumn = false;
    let fraudulentKey = '';

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          headers.forEach((h) => {
            const cleanHeader = h.trim();
            columns.push(cleanHeader);
            if (cleanHeader.toLowerCase() === 'fraudulent') {
              hasFraudulentColumn = true;
              fraudulentKey = cleanHeader;
            }
          });
        })
        .on('data', (row) => {
          rowCount += 1;
          const val = String(row[fraudulentKey] || '').trim();
          if (val === '1' || val.toLowerCase() === 'true') {
            fraudCount += 1;
          } else {
            genuineCount += 1;
          }
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    if (!hasFraudulentColumn) {
      await fs.promises.unlink(filePath).catch(() => {});
      return res.status(400).json({
        message: "Dataset is missing the required 'fraudulent' column.",
      });
    }

    if (rowCount === 0) {
      await fs.promises.unlink(filePath).catch(() => {});
      return res.status(400).json({
        message: 'The uploaded dataset contains no data rows.',
      });
    }

    const datasetName = req.body.name?.trim() || req.file.originalname;

    const dataset = await Dataset.create({
      name: datasetName,
      uploadedBy: req.user._id,
      filePath,
      rowCount,
      fraudCount,
      genuineCount,
      columns,
    });

    res.status(201).json(dataset);
  } catch (error) {
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

export const getDatasets = async (req, res, next) => {
  try {
    const datasets = await Dataset.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(datasets);
  } catch (error) {
    next(error);
  }
};

export const getDatasetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid dataset ID' });
    }

    const dataset = await Dataset.findById(id).populate(
      'uploadedBy',
      'name email'
    );

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    res.status(200).json(dataset);
  } catch (error) {
    next(error);
  }
};

export const deleteDataset = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid dataset ID' });
    }

    const dataset = await Dataset.findById(id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    if (fs.existsSync(dataset.filePath)) {
      await fs.promises.unlink(dataset.filePath).catch(() => {});
    }

    await dataset.deleteOne();

    res.status(200).json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Training & Models
// ==========================================

export const trainModel = async (req, res, next) => {
  try {
    const { datasetId, algorithm, setActive } = req.body;

    if (!datasetId) {
      return res.status(400).json({ message: 'datasetId is required' });
    }

    const validAlgorithms = ['logistic_regression', 'random_forest'];
    const chosenAlgorithm = algorithm || 'logistic_regression';

    if (!validAlgorithms.includes(chosenAlgorithm)) {
      return res.status(400).json({
        message: `Algorithm must be one of: ${validAlgorithms.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(datasetId)) {
      return res.status(400).json({ message: 'Invalid dataset ID' });
    }

    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    if (!fs.existsSync(dataset.filePath)) {
      return res.status(400).json({
        message: 'Dataset file is missing from server storage.',
      });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    let mlResponse;

    try {
      mlResponse = await axios.post(
        `${mlServiceUrl}/train`,
        {
          csv_path: dataset.filePath,
          algorithm: chosenAlgorithm,
        },
        { timeout: 120000 } // Allow 2 minutes for training
      );
    } catch (mlErr) {
      if (
        mlErr.code === 'ECONNREFUSED' ||
        mlErr.code === 'ENOTFOUND' ||
        mlErr.code === 'ETIMEDOUT' ||
        mlErr.response?.status === 503
      ) {
        return res.status(503).json({
          message: 'ML service is currently unavailable. Please verify it is running.',
        });
      }
      return res.status(400).json({
        message:
          mlErr.response?.data?.detail || 'Training failed on ML service.',
      });
    }

    const { metrics, model_path } = mlResponse.data;
    const shouldActivate = Boolean(setActive);

    if (shouldActivate) {
      await ModelRecord.updateMany({ isActive: true }, { isActive: false });
    }

    const modelRecord = await ModelRecord.create({
      dataset: dataset._id,
      algorithm: chosenAlgorithm,
      accuracy: metrics.accuracy,
      precision: metrics.precision,
      recall: metrics.recall,
      f1Score: metrics.f1_score,
      trainedBy: req.user._id,
      isActive: shouldActivate,
      modelFilePath: model_path,
    });

    const populatedRecord = await ModelRecord.findById(modelRecord._id)
      .populate('dataset', 'name rowCount')
      .populate('trainedBy', 'name email');

    res.status(201).json(populatedRecord);
  } catch (error) {
    next(error);
  }
};

export const getModels = async (req, res, next) => {
  try {
    const models = await ModelRecord.find()
      .populate('dataset', 'name rowCount')
      .populate('trainedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(models);
  } catch (error) {
    next(error);
  }
};

export const activateModel = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid model record ID' });
    }

    const model = await ModelRecord.findById(id);
    if (!model) {
      return res.status(404).json({ message: 'Model record not found' });
    }

    await ModelRecord.updateMany({ isActive: true }, { isActive: false });

    model.isActive = true;
    await model.save();

    res.status(200).json({
      message: `Model (${model.algorithm}) marked as active.`,
      model,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Users
// ==========================================

export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['jobseeker', 'admin'].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'jobseeker' or 'admin'",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        message: 'Administrators cannot demote their own account.',
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Administrators cannot delete their own account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Detection Records (Across All Users)
// ==========================================

export const getAllAnalyses = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { companyName: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (req.query.label && ['genuine', 'fraudulent'].includes(req.query.label.toLowerCase())) {
      query['result.label'] = req.query.label.toLowerCase();
    }

    if (req.query.source && ['single', 'bulk'].includes(req.query.source.toLowerCase())) {
      query.source = req.query.source.toLowerCase();
    }

    const total = await Analysis.countDocuments(query);
    const records = await Analysis.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnyAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid analysis ID' });
    }

    const analysis = await Analysis.findById(id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis record not found' });
    }

    await analysis.deleteOne();

    res.status(200).json({ message: 'Analysis record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Stats Endpoint
// ==========================================

export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAnalyses, genuineCount, fraudulentCount] =
      await Promise.all([
        User.countDocuments(),
        Analysis.countDocuments(),
        Analysis.countDocuments({ 'result.label': 'genuine' }),
        Analysis.countDocuments({ 'result.label': 'fraudulent' }),
      ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analysesPerDay = await Analysis.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: 1 },
          fraudulent: {
            $sum: {
              $cond: [{ $eq: ['$result.label', 'fraudulent'] }, 1, 0],
            },
          },
          genuine: {
            $sum: {
              $cond: [{ $eq: ['$result.label', 'genuine'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topIndicators = await Analysis.aggregate([
      { $unwind: '$indicators' },
      {
        $group: {
          _id: '$indicators.type',
          count: { $sum: 1 },
          severity: { $first: '$indicators.severity' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      totalUsers,
      totalAnalyses,
      genuineCount,
      fraudulentCount,
      analysesPerDay,
      topIndicators,
    });
  } catch (error) {
    next(error);
  }
};
