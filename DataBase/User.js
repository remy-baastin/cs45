const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "moderator", "admin"],
      default: "student",
    },
    sp_points: {
      type: Number,
      default: 0,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    // For tracking feedback given to Yaksha answers
    feedback_history: [
      {
        faq_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FaqElement",
        },
        rating: {
          type: String,
          enum: ["helpful", "not_helpful"],
        },
        dissimilarity_note: {
          type: String, // user explains what was dissimilar (1-2 lines)
          maxlength: 300,
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("User", userSchema);
