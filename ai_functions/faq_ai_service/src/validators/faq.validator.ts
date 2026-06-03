import { FAQResult } from "../interfaces/faq.interface";

export function isValidFAQ(
  data: any
): data is FAQResult {

  return (
    data &&
    typeof data.faqQuestion === "string" &&
    typeof data.faqAnswer === "string" &&
    Array.isArray(data.tags) &&
    typeof data.quality_score === "number"
  );

}