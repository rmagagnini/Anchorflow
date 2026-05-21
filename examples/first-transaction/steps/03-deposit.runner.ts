import * as dotenv from "dotenv";
import { Keypair } from "@stellar/stellar-sdk";
import { initiateDeposit } from "./03-deposit";
import { AnchorFlow } from "anchorflow-sdk";
import * as fs from "fs";

dotenv.config();

const STELLAR_SECRET = process.env["STELLAR_SECRET_KEY"] ?? "";
const ANCHOR_DOMAIN = process.env["ANCHOR_DOMAIN"] ?? "testanchor.stellar.org";
const ASSET_CODE = process.env["ASSET_CODE"] ?? "SRT";
const ASSET_ISSUER = process.env["ASSET_ISSUER"] ?? "";

async function main(): Promise<void> {
  console.log("\n--- Step 03: Deposit (SEP-24) ---");
  const keypair = Keypair.fromSecret(STELLAR_SECRET);
  const sdk = new AnchorFlow({ network: "testnet" });
  const info = await sdk.getAnchorInfo(ANCHOR_DOMAIN) as any;
  const sep24Endpoint = info.toml?.TRANSFER_SERVER_SEP0024 ?? "";
  const token = fs.readFileSync(".auth-token", "utf8").trim();

  console.log("  SEP-24 Endpoint: " + sep24Endpoint);
  console.log("  Asset: " + ASSET_CODE);

  const result = await initiateDeposit(sep24Endpoint, token, keypair.publicKey(), ASSET_CODE, ASSET_ISSUER);
  console.log("  Transaction ID: " + result.id);
  console.log("  Deposit URL: " + result.url);
  fs.writeFileSync(".transaction-id", result.id);
  console.log("  Transaction ID saved to .transaction-id\nDone.");
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
