import { ModerationResult } from "../interfaces/moderation.interface";
import { MODERATE_PROMPT } from "../prompts/moderate.prompt";
import { isValidModeration } from "../validators/moderation.validator";

export async function moderateQuery(
  query: string
): Promise<ModerationResult> {

  if (!query.trim()) {
    throw new Error("Query cannot be empty");
  }

  const finalPrompt = `
${MODERATE_PROMPT}

USER QUERY:
${query}
`;

  console.log("Moderation prompt built successfully.");

  const response = `
{
  "safe": true,
  "reason": ""
}
`;

  const parsedResponse = JSON.parse(response);

  if (!isValidModeration(parsedResponse)) {
    throw new Error(
      "Invalid moderation response"
    );
  }

  return parsedResponse;
}