import { ClassificationResult } from "../interfaces/classification.interface";

export function isValidClassification(
  data: any
): data is ClassificationResult {

  return (
    data &&
    (data.type === "generic" ||
     data.type === "personal") &&
    typeof data.confidence === "number"
  );

}