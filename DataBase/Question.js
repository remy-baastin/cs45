const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question_text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // AI Classification Layer (Phase 3)
    classification: {
      type: String,
      enum: ["generic", "personal", "unclassified"],
      default: "unclassified",
    },

    // Toxicity / Safety Check (Phase 3)
    moderation_status: {
      type: String,
      enum: ["pending", "safe", "toxic", "flagged"],
      default: "pending",
    },

    // Yaksha-mini semantic similarity score (Phase 2)
    // If < 0.80, user is allowed to raise this query
    similarity_confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },

    // Routing: where does this question go?
    routing: {
      type: String,
      enum: ["community", "admin", "resolved_by_faq", "pending"],
      default: "pending",
    },

    // Community board filters
    is_answered: {
      type: Boolean,
      default: false,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Bookmarks / saves count
    bookmark_count: {
      type: Number,
      default: 0,
    },

    bookmarked_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // If sent to admin (personal query)
    admin_reviewed: {
      type: Boolean,
      default: false,
    },

    admin_response: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient community board queries (sort by newest, most active)
questionSchema.index({ classification: 1, moderation_status: 1, createdAt: -1 });
questionSchema.index({ is_answered: 1, routing: 1 });

module.exports = mongoose.model("Question", questionSchema);
