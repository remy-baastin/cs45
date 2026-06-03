import dotenv from "dotenv";

dotenv.config();

const API_KEY =
  process.env.MINIMAX_API_KEY;

export async function callMiniMax(
  prompt: string
): Promise<string> {

  if (!API_KEY) {
    throw new Error(
      "MiniMax API key not found"
    );
  }

  throw new Error(
    "MiniMax API not connected yet"
  );
}