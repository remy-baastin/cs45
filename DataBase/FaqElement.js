const mongoose = require("mongoose");

const faqElementSchema = new mongoose.Schema(
  {
    // Links back to original community question
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    // The best community answer that was summarized
    answer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
    },

    // Status of this FAQ entry
    status: {
      type: String,
      enum: ["resolved", "not-resolved", "under-review", "archived"],
      default: "not-resolved",
    },

    // AI-polished versions (from POST /ai/generate-faq)
    ai_faq_question: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    ai_faq_answer: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: null,
    },

    // Tags from POST /ai/generate-tags
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Quality score from POST /ai/review-faq (0.0 to 1.0)
    quality_score: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },

    // Embedding vector reference (for Yaksha semantic search)
    // Store as array of floats — used by POST /ai/search
    embedding: {
      type: [Number],
      default: [],
      select: false, // don't return in normal queries (heavy field)
    },

    // Feedback signals (from POST /feedback — Riddhima's endpoint)
    helpful_count: {
      type: Number,
      default: 0,
    },
    not_helpful_count: {
      type: Number,
      default: 0,
    },

    // View count for ranking most-seen FAQs
    view_count: {
      type: Number,
      default: 0,
    },

    // Admin who approved this FAQ going live
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    is_published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for Yaksha FAQ page — published, sorted by quality
faqElementSchema.index({ is_published: 1, quality_score: -1 });
faqElementSchema.index({ tags: 1 });
faqElementSchema.index({ status: 1, is_published: 1 });

module.exports = mongoose.model("FaqElement", faqElementSchema);
