import mongoose from 'mongoose';

const modelRecordSchema = new mongoose.Schema(
  {
    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true,
    },
    algorithm: {
      type: String,
      required: true,
      trim: true,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    precision: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    recall: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    f1Score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    trainedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    modelFilePath: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

modelRecordSchema.index({ isActive: 1 });
modelRecordSchema.index({ dataset: 1, createdAt: -1 });

const ModelRecord = mongoose.model('ModelRecord', modelRecordSchema);

export default ModelRecord;
