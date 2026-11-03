import mongoose from 'mongoose';

const indicatorSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    companyProfile: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    requirements: {
      type: String,
      default: '',
    },
    benefits: {
      type: String,
      default: '',
    },
    salaryRange: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    employmentType: {
      type: String,
      default: '',
    },
    recruiterEmail: {
      type: String,
      trim: true,
      default: '',
    },
    recruiterContact: {
      type: String,
      trim: true,
      default: '',
    },
    applicationMethod: {
      type: String,
      default: '',
    },
    result: {
      label: {
        type: String,
        enum: ['genuine', 'fraudulent'],
        required: true,
      },
    },
    fraudProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    indicators: [indicatorSchema],
    source: {
      type: String,
      enum: ['single', 'bulk'],
      default: 'single',
    },
    batchId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ batchId: 1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
