import { ReviewResult } from "../interfaces/review.interface";

export function isValidReview(
  data: any
): data is ReviewResult {

  return (
    data &&
    typeof data.approved === "boolean" &&
    typeof data.score === "number" &&
    Array.isArray(data.issues)
  );

}