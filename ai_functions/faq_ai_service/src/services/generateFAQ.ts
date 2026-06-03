import { FAQResult } from "../interfaces/faq.interface";
import { GENERATE_FAQ_PROMPT } from "../prompts/generateFAQ.prompt";
import { isValidFAQ } from "../validators/faq.validator";

export async function generateFAQ(
  question: string,
  answers: string[]
): Promise<FAQResult> {

  if (!question.trim()) {
    throw new Error(
      "Question cannot be empty"
    );
  }

  if (answers.length === 0) {
    throw new Error(
      "At least one answer is required"
    );
  }

  const finalPrompt = `
${GENERATE_FAQ_PROMPT}

QUESTION:
${question}

ANSWERS:
${answers.join("\n")}
`;

  console.log(
    "FAQ generation prompt built successfully."
  );

  const response = `
{
  "faqQuestion": "${question}",
  "faqAnswer": "${answers[0]}",
  "tags": ["general"],
  "quality_score": 0.85
}
`;

  const parsedResponse =
    JSON.parse(response);

  if (!isValidFAQ(parsedResponse)) {
    throw new Error(
      "Invalid FAQ response"
    );
  }

  return parsedResponse;
}