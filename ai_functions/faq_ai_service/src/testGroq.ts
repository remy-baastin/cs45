import { callMiniMax }
from "./minimax/minimax.service";

async function main() {

  const response =
    await callMiniMax(
      "Reply with exactly: Hello Samarpit"
    );

  console.log(response);
}

main();