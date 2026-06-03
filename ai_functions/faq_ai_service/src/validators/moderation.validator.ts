import { ModerationResult } from "../interfaces/moderation.interface";

export function isValidModeration(
  data: any
): data is ModerationResult {

  return (
    data &&
    typeof data.safe === "boolean"
  );

}