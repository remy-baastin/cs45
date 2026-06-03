import { ReviewResult } from "../interfaces/review.interface";
import { REVIEW_FAQ_PROMPT } from "../prompts/reviewFAQQuality.prompt";
import { isValidReview } from "../validators/review.validator";

export async function reviewFAQQuality(
  faqQuestion: string,
  faqAnswer: string
): Promise<ReviewResult> {

  if (!faqQuestion.trim()) {
    throw new Error(
      "FAQ question cannot be empty"
    );
  }

  if (!faqAnswer.trim()) {
    throw new Error(
      "FAQ answer cannot be empty"
    );
  }

  const finalPrompt = `
${REVIEW_FAQ_PROMPT}

FAQ QUESTION:
${faqQuestion}

FAQ ANSWER:
${faqAnswer}
`;

  console.log(
    "FAQ review prompt built successfully."
  );

  const response = `
{
  "approved": true,
  "score": 0.85,
  "issues": []
}
`;

  const parsedResponse =
    JSON.parse(response);

  if (!isValidReview(parsedResponse)) {
    throw new Error(
      "Invalid review response"
    );
  }

  return parsedResponse;
}