import * as dotenv from "dotenv";
import axios from "axios";
import * as fs from "fs";

dotenv.config();

async function main(): Promise<void> {
  const sep24Endpoint = "https://testanchor.stellar.org/sep24";
  const token = fs.readFileSync(".auth-token", "utf8").trim();
  const transactionId = fs.readFileSync(".transaction-id", "utf8").trim();

  console.log("Token (primeiros 50 chars):", token.substring(0, 50));
  console.log("Transaction ID:", transactionId);

  try {
    const { data } = await axios.get(`${sep24Endpoint}/transaction`, {
      params: { id: transactionId },
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Resposta:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.log("Status:", err.response?.status);
    console.log("Erro:", JSON.stringify(err.response?.data, null, 2));
  }
}

main();