import readline from "readline";

import { classifyQuery } from "./services/classifyQuery";
import { moderateQuery } from "./services/moderateQuery";
import { generateFAQ } from "./services/generateFAQ";
import { generateTags } from "./services/generateTags";
import { reviewFAQQuality } from "./services/reviewFAQQuality";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Enter user query: ",
  async (query) => {

    try {

      console.log("\n====================");
      console.log("CLASSIFICATION");
      console.log("====================");

      const classification =
        await classifyQuery(query);

      console.log(classification);

      console.log("\n====================");
      console.log("MODERATION");
      console.log("====================");

      const moderation =
        await moderateQuery(query);

      console.log(moderation);

      if (!moderation.safe) {

        console.log(
          "\nQuery blocked by moderation."
        );

        rl.close();
        return;
      }

      rl.question(
        "\nEnter community answer: ",
        async (answer) => {

          try {

            console.log("\n====================");
            console.log("FAQ GENERATION");
            console.log("====================");

            const faq =
              await generateFAQ(
                query,
                [answer]
              );

            console.log(faq);

            console.log("\n====================");
            console.log("TAG GENERATION");
            console.log("====================");

            const tags =
              await generateTags(
                faq.faqQuestion +
                " " +
                faq.faqAnswer
              );

            console.log(tags);

            console.log("\n====================");
            console.log("FAQ REVIEW");
            console.log("====================");

            const review =
              await reviewFAQQuality(
                faq.faqQuestion,
                faq.faqAnswer
              );

            console.log(review);

            console.log("\n====================");
            console.log("FINAL RESULT");
            console.log("====================");

            console.log({
              classification,
              moderation,
              faq,
              tags,
              review
            });

          } catch (error) {

            console.error(error);

          } finally {

            rl.close();

          }
        }
      );

    } catch (error) {

      console.error(error);
      rl.close();

    }
  }
);