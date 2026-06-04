import { ModerationResult } from "../interfaces/moderation.interface";
import { MODERATE_PROMPT } from "../prompts/moderate.prompt";
import { isValidModeration } from "../validators/moderation.validator";
import { callMiniMax } from "../minimax/minimax.service";

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

  const response =
  await callMiniMax(finalPrompt);

console.log("Raw LLM Response:");
console.log(response);

  const cleanedResponse =
  response
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

console.log("Cleaned Response:");
console.log(cleanedResponse);

const parsedResponse =
  JSON.parse(cleanedResponse);

  if (!isValidModeration(parsedResponse)) {
    throw new Error(
      "Invalid moderation response"
    );
  }

  return parsedResponse;
}