import { TagResult } from "../interfaces/tag.interface";

export function isValidTagResult(
  data: any
): data is TagResult {

  return (
    data &&
    Array.isArray(data.tags)
  );

}