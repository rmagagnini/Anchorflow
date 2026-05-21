import * as dotenv from "dotenv";
import { pollTransaction } from "./04-poll";
import { AnchorFlow } from "anchorflow-sdk";
import * as fs from "fs";

dotenv.config();

const ANCHOR_DOMAIN = process.env["ANCHOR_DOMAIN"] ?? "testanchor.stellar.org";

async function main(): Promise<void> {
  console.log("\n--- Step 04: Poll Transaction ---");
  const sdk = new AnchorFlow({ network: "testnet" });
  const info = await sdk.getAnchorInfo(ANCHOR_DOMAIN) as any;
  const sep24Endpoint = info.toml?.TRANSFER_SERVER_SEP0024 ?? "";
  const token = fs.readFileSync(".auth-token", "utf8").trim();
  const transactionId = fs.readFileSync(".transaction-id", "utf8").trim();

  console.log("  Transaction ID: " + transactionId);
  console.log("  Polling...");

  const result = await pollTransaction(sep24Endpoint, token, transactionId);
  console.log("  Final Status: " + result.status);
  if (result.amount_in) console.log("  Amount In: " + result.amount_in);
  if (result.amount_out) console.log("  Amount Out: " + result.amount_out);
  if (result.stellar_transaction_id) console.log("  Stellar TX: " + result.stellar_transaction_id);
  console.log("\nDone.");
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});