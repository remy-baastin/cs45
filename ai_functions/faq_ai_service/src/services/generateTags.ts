import { TagResult } from "../interfaces/tag.interface";
import { GENERATE_TAGS_PROMPT } from "../prompts/generateTags.prompt";
import { isValidTagResult } from "../validators/tag.validator";

export async function generateTags(
  content: string
): Promise<TagResult> {

  if (!content.trim()) {
    throw new Error(
      "Content cannot be empty"
    );
  }

  const finalPrompt = `
${GENERATE_TAGS_PROMPT}

CONTENT:
${content}
`;

  console.log(
    "Tag generation prompt built successfully."
  );

  const response = `
{
  "tags": [
    "general"
  ]
}
`;

  const parsedResponse =
    JSON.parse(response);

  if (!isValidTagResult(parsedResponse)) {
    throw new Error(
      "Invalid tag response"
    );
  }

  return parsedResponse;
}