import readline from "readline";
import { generateFAQ } from "./services/generateFAQ";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Enter question: ",
  (question) => {

    rl.question(
      "Enter answer: ",
      async (answer) => {

        try {

          const result =
            await generateFAQ(
              question,
              [answer]
            );

          console.log(
            "\nGenerated FAQ:"
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