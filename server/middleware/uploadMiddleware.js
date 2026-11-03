import fs from 'fs';
import path from 'path';
import multer from 'multer';

const memoryStorage = multer.memoryStorage();

const datasetsDir = path.resolve('uploads/datasets');
if (!fs.existsSync(datasetsDir)) {
  fs.mkdirSync(datasetsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, datasetsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${cleanName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isCsvMime =
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'text/plain';
  const isCsvExt = file.originalname.toLowerCase().endsWith('.csv');

  if (isCsvMime || isCsvExt) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files (.csv) are allowed'), false);
  }
};

export const uploadCsv = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for bulk predictions
  fileFilter,
});

export const uploadDatasetCsv = multer({
  storage: diskStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for training datasets
  fileFilter,
});
