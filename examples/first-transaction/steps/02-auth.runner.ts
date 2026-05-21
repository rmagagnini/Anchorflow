import * as dotenv from "dotenv";
import { Keypair } from "@stellar/stellar-sdk";
import { authenticate } from "./02-auth";
import { AnchorFlow } from "anchorflow-sdk";
import * as fs from "fs";

dotenv.config();

const STELLAR_SECRET = process.env["STELLAR_SECRET_KEY"] ?? "";
const ANCHOR_DOMAIN = process.env["ANCHOR_DOMAIN"] ?? "testanchor.stellar.org";

async function main(): Promise<void> {
  console.log("\n--- Step 02: Authenticate (SEP-10) ---");
  const keypair = Keypair.fromSecret(STELLAR_SECRET);
  const sdk = new AnchorFlow({ network: "testnet" });
  const info = await sdk.getAnchorInfo(ANCHOR_DOMAIN) as any;
  const webAuthEndpoint = info.toml?.WEB_AUTH_ENDPOINT ?? "";
  const networkPassphrase = info.toml?.NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";
  console.log("  Web Auth Endpoint: " + webAuthEndpoint);
  const token = await authenticate(webAuthEndpoint, networkPassphrase, keypair);
  console.log("  JWT Token: " + token.substring(0, 40) + "...");
  fs.writeFileSync(".auth-token", token);
  console.log("  Token saved to .auth-token\nDone.");
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
