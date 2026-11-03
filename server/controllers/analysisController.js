import crypto from 'crypto';
import { Readable } from 'stream';
import axios from 'axios';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import Analysis from '../models/Analysis.js';

const getFieldValue = (row, candidates) => {
  for (const key of Object.keys(row)) {
    const cleanKey = key.trim().toLowerCase().replace(/[\s_-]+/g, '');
    for (const candidate of candidates) {
      if (cleanKey === candidate.toLowerCase().replace(/[\s_-]+/g, '')) {
        return row[key] ? String(row[key]).trim() : '';
      }
    }
  }
  return '';
};

const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = Readable.from(buffer);
    stream
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
};

const escapeCsv = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

export const createAnalysis = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      companyProfile,
      description,
      requirements,
      benefits,
      salaryRange,
      location,
      employmentType,
      recruiterEmail,
      recruiterContact,
      applicationMethod,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Job title is required' });
    }

    const mlPayload = {
      title: title.trim(),
      company_name: (companyName || '').trim(),
      company_profile: (companyProfile || '').trim(),
      description: (description || '').trim(),
      requirements: (requirements || '').trim(),
      benefits: (benefits || '').trim(),
      salary_range: (salaryRange || '').trim(),
      location: (location || '').trim(),
      employment_type: (employmentType || '').trim(),
      recruiter_email: (recruiterEmail || '').trim(),
      recruiter_contact: (recruiterContact || '').trim(),
      application_method: (applicationMethod || '').trim(),
    };

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

    let mlResponse;
    try {
      mlResponse = await axios.post(`${mlServiceUrl}/predict`, mlPayload, {
        timeout: 10000,
      });
    } catch (mlErr) {
      if (
        mlErr.code === 'ECONNREFUSED' ||
        mlErr.code === 'ENOTFOUND' ||
        mlErr.code === 'ETIMEDOUT' ||
        mlErr.response?.status === 503
      ) {
        return res.status(503).json({
          message:
            'ML service is currently unavailable or no trained model is active. Please train a model first or check the ML service.',
        });
      }
      return res.status(503).json({
        message:
          mlErr.response?.data?.detail ||
          'Failed to obtain prediction from ML service.',
      });
    }

    const { label, fraud_probability, confidence, indicators } = mlResponse.data;

    const analysis = await Analysis.create({
      user: req.user._id,
      title: title.trim(),
      companyName: (companyName || '').trim(),
      companyProfile: (companyProfile || '').trim(),
      description: (description || '').trim(),
      requirements: (requirements || '').trim(),
      benefits: (benefits || '').trim(),
      salaryRange: (salaryRange || '').trim(),
      location: (location || '').trim(),
      employmentType: (employmentType || '').trim(),
      recruiterEmail: (recruiterEmail || '').trim(),
      recruiterContact: (recruiterContact || '').trim(),
      applicationMethod: (applicationMethod || '').trim(),
      result: {
        label,
      },
      fraudProbability: fraud_probability,
      confidence,
      indicators: indicators || [],
      source: 'single',
    });

    res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
};

export const analyzeBulkCsv = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    let rows;
    try {
      rows = await parseCsvBuffer(req.file.buffer);
    } catch (parseError) {
      return res.status(400).json({
        message: `Failed to parse CSV file: ${parseError.message}`,
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'The uploaded CSV file is empty' });
    }

    const errors = [];
    const validJobs = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +1 for 0-index, +1 for CSV header row

      const title = getFieldValue(row, ['title', 'jobtitle']);
      const description = getFieldValue(row, ['description', 'jobdescription']);

      if (!title && !description) {
        errors.push({
          row: rowNumber,
          reason: 'Missing both title and description',
        });
        return;
      }

      if (!title) {
        errors.push({
          row: rowNumber,
          reason: 'Missing required field: title',
        });
        return;
      }

      if (!description) {
        errors.push({
          row: rowNumber,
          reason: 'Missing required field: description',
        });
        return;
      }

      const jobData = {
        title,
        company_name: getFieldValue(row, ['companyname', 'company_name', 'company']),
        company_profile: getFieldValue(row, ['companyprofile', 'company_profile']),
        description,
        requirements: getFieldValue(row, ['requirements']),
        benefits: getFieldValue(row, ['benefits']),
        salary_range: getFieldValue(row, ['salaryrange', 'salary_range', 'salary']),
        location: getFieldValue(row, ['location']),
        employment_type: getFieldValue(row, ['employmenttype', 'employment_type']),
        recruiter_email: getFieldValue(row, ['recruiteremail', 'recruiter_email', 'email']),
        recruiter_contact: getFieldValue(row, ['recruitercontact', 'recruiter_contact', 'contact']),
        application_method: getFieldValue(row, ['applicationmethod', 'application_method']),
        has_company_logo: parseInt(getFieldValue(row, ['hascompanylogo', 'has_company_logo']) || '0', 10) || 0,
        telecommuting: parseInt(getFieldValue(row, ['telecommuting']) || '0', 10) || 0,
      };

      validJobs.push({ rowNumber, jobData });
    });

    if (validJobs.length === 0) {
      return res.status(400).json({
        message: 'No valid rows found in CSV. All rows failed validation.',
        totalRows: rows.length,
        skipped: errors.length,
        errors,
      });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    let mlResponse;

    try {
      mlResponse = await axios.post(
        `${mlServiceUrl}/predict-batch`,
        { jobs: validJobs.map((v) => v.jobData) },
        { timeout: 30000 }
      );
    } catch (mlErr) {
      if (
        mlErr.code === 'ECONNREFUSED' ||
        mlErr.code === 'ENOTFOUND' ||
        mlErr.code === 'ETIMEDOUT' ||
        mlErr.response?.status === 503
      ) {
        return res.status(503).json({
          message:
            'ML service is currently unavailable or no trained model is active. Please train a model first or check the ML service.',
        });
      }
      return res.status(503).json({
        message:
          mlErr.response?.data?.detail ||
          'Failed to obtain prediction from ML service.',
      });
    }

    const predictions = mlResponse.data;
    const batchId = crypto.randomUUID();

    let genuineCount = 0;
    let fraudulentCount = 0;

    const analysisDocuments = validJobs.map((item, idx) => {
      const pred = predictions[idx];
      if (pred.label === 'fraudulent') {
        fraudulentCount += 1;
      } else {
        genuineCount += 1;
      }

      return {
        user: req.user._id,
        title: item.jobData.title,
        companyName: item.jobData.company_name,
        companyProfile: item.jobData.company_profile,
        description: item.jobData.description,
        requirements: item.jobData.requirements,
        benefits: item.jobData.benefits,
        salaryRange: item.jobData.salary_range,
        location: item.jobData.location,
        employmentType: item.jobData.employment_type,
        recruiterEmail: item.jobData.recruiter_email,
        recruiterContact: item.jobData.recruiter_contact,
        applicationMethod: item.jobData.application_method,
        result: {
          label: pred.label,
        },
        fraudProbability: pred.fraud_probability,
        confidence: pred.confidence,
        indicators: pred.indicators || [],
        source: 'bulk',
        batchId,
      };
    });

    await Analysis.insertMany(analysisDocuments);

    res.status(201).json({
      batchId,
      total: rows.length,
      processed: validJobs.length,
      genuine: genuineCount,
      fraudulent: fraudulentCount,
      skipped: errors.length,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

export const getBatchResults = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const query = { batchId };
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const records = await Analysis.find(query).sort({ createdAt: 1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ message: 'Batch not found or unauthorized' });
    }

    const genuine = records.filter((r) => r.result?.label === 'genuine').length;
    const fraudulent = records.filter((r) => r.result?.label === 'fraudulent').length;

    res.status(200).json({
      batchId,
      total: records.length,
      genuine,
      fraudulent,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

export const exportBatchCsv = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const query = { batchId };
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const records = await Analysis.find(query).sort({ createdAt: 1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ message: 'Batch not found or unauthorized' });
    }

    const headers = [
      'ID',
      'Title',
      'Company',
      'Location',
      'Label',
      'FraudProbability',
      'Confidence',
      'IndicatorsCount',
      'IndicatorsSummary',
      'CreatedAt',
    ];

    const csvRows = [headers.join(',')];

    records.forEach((r) => {
      const indicatorSummary = (r.indicators || [])
        .map((i) => `[${i.severity}] ${i.type}: ${i.detail}`)
        .join('; ');

      const row = [
        escapeCsv(r._id),
        escapeCsv(r.title),
        escapeCsv(r.companyName),
        escapeCsv(r.location),
        escapeCsv(r.result?.label),
        escapeCsv(r.fraudProbability),
        escapeCsv(r.confidence),
        escapeCsv((r.indicators || []).length),
        escapeCsv(indicatorSummary),
        escapeCsv(r.createdAt ? r.createdAt.toISOString() : ''),
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analysis-batch-${batchId}.csv"`
    );
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

export const getAnalysisHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

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

    const total = await Analysis.countDocuments(query);
    const records = await Analysis.find(query)
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

export const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid analysis ID' });
    }

    const analysis = await Analysis.findById(id);

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis record not found' });
    }

    const isOwner =
      analysis.user && analysis.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Not authorized to view this analysis record',
      });
    }

    res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
};

export const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid analysis ID' });
    }

    const analysis = await Analysis.findById(id);

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis record not found' });
    }

    const isOwner =
      analysis.user && analysis.user.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        message: 'Not authorized to delete this analysis record',
      });
    }

    await analysis.deleteOne();

    res.status(200).json({ message: 'Analysis record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
