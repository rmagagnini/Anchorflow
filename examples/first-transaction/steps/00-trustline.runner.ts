import * as dotenv from "dotenv";
import { Keypair } from "@stellar/stellar-sdk";
import { ensureTrustline } from "./00-trustline";

dotenv.config();

const STELLAR_SECRET = process.env["STELLAR_SECRET_KEY"] ?? "";
const ASSET_CODE = process.env["ASSET_CODE"] ?? "SRT";
const ASSET_ISSUER = process.env["ASSET_ISSUER"] ?? "";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

async function main(): Promise<void> {
  console.log("\n--- Step 00: Trustline ---");
  const keypair = Keypair.fromSecret(STELLAR_SECRET);
  await ensureTrustline(keypair, NETWORK_PASSPHRASE, ASSET_CODE, ASSET_ISSUER);
  console.log("Done.");
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
