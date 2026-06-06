const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    answer_text: {
      type: String,
      required: [true, "Answer text is required"],
      trim: true,
      minlength: 5,
      maxlength: 5000,
    },

    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Upvote system — prevents duplicate upvotes
    upvotes: {
      type: Number,
      default: 0,
    },

    upvoted_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Moderation
    moderation_status: {
      type: String,
      enum: ["pending", "safe", "toxic", "flagged"],
      default: "pending",
    },

    // Whether this answer was selected as the best / used for FAQ generation
    is_accepted: {
      type: Boolean,
      default: false,
    },

    // SP reward given to author for this answer
    sp_rewarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index: fetch all answers for a question, sorted by upvotes
answerSchema.index({ question_id: 1, upvotes: -1 });

module.exports = mongoose.model("Answer", answerSchema);
