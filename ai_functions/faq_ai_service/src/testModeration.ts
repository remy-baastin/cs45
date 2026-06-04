import readline from "readline";
import { moderateQuery }
from "./services/moderateQuery";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Enter query: ",
  async (query) => {
    try {
      const result =
        await moderateQuery(query);

      console.log(result);
    } catch (error) {
      console.error(error);
    } finally {
      rl.close();
    }
  }
);