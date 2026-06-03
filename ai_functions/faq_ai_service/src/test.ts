import { classifyQuery } from "./services/classifyQuery";
import { moderateQuery } from "./services/moderateQuery";
import { generateFAQ } from "./services/generateFAQ";
import { generateTags } from "./services/generateTags";
import { reviewFAQQuality } from "./services/reviewFAQQuality";

async function main() {

  console.log(await classifyQuery("What is the fee structure?"));

  console.log(await moderateQuery("What is the fee structure?"));

  console.log(
    await generateFAQ(
      "What is the fee structure?",
      ["The fee structure is available on the portal."]
    )
  );

  console.log(
    await generateTags(
      "The fee structure is available on the portal."
    )
  );

  console.log(
    await reviewFAQQuality(
  "What is the fee structure?",
  "The fee structure is available on the portal."
)
  );

}

main();