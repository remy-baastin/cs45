import { ClassificationResult } from "../interfaces/classification.interface";
import { CLASSIFY_PROMPT } from "../prompts/classify.prompt";
import { isValidClassification } from "../validators/classification.validator";
import { callMiniMax } from "../minimax/minimax.service";

export async function classifyQuery(
  query: string
): Promise<ClassificationResult> {

  if (!query.trim()) {
    throw new Error("Query cannot be empty");
  }

  const finalPrompt = `
${CLASSIFY_PROMPT}

USER QUERY:
${query}
`;

  console.log("Classification prompt built successfully.");
  const response = `
{
  "type": "generic",
  "confidence": 0.95
}
`;
  const parsedResponse = JSON.parse(response);

  if (!isValidClassification(parsedResponse)) {
    throw new Error(
      "Invalid classification response"
    );
  }

  return parsedResponse;
}