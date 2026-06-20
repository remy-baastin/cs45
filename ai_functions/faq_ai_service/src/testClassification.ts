import readline from "readline";
import { classifyQuery } from "./services/classifyQuery";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter your query: ", async (query) => {
  try {
    const result = await classifyQuery(query);

    console.log("\nClassification Result:");
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    rl.close();
  }
});