import readline from "readline";
import { reviewFAQQuality }
from "./services/reviewFAQQuality";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Enter FAQ Question: ",
  (question) => {

    rl.question(
      "Enter FAQ Answer: ",
      async (answer) => {

        try {

          const result =
            await reviewFAQQuality(
              question,
              answer
            );

          console.log(
            "\nReview Result:"
          );

          console.log(result);

        } catch (error) {

          console.error(error);

        } finally {

          rl.close();

        }
      }
    );
  }
);