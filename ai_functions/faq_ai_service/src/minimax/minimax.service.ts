import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY =
  process.env.GROQ_API_KEY;

export async function callMiniMax(
  prompt: string
): Promise<string> {

  if (!API_KEY) {
    throw new Error(
      "Groq API key not found"
    );
  }

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
}