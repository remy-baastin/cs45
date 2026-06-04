import readline from "readline";
import { generateTags } from "./services/generateTags";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Enter content: ",
  async (content) => {

    try {

      const result =
        await generateTags(content);

      console.log("\nGenerated Tags:");
      console.log(result);

    } catch (error) {

      console.error(error);

    } finally {

      rl.close();

    }
  }
);