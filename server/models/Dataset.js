import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    rowCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    fraudCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    genuineCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    columns: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

datasetSchema.index({ uploadedBy: 1, createdAt: -1 });

const Dataset = mongoose.model('Dataset', datasetSchema);

export default Dataset;
