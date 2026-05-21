import * as dotenv from "dotenv";
import { AnchorFlow } from "anchorflow-sdk";

dotenv.config();

const ANCHOR_DOMAIN = process.env["ANCHOR_DOMAIN"] ?? "testanchor.stellar.org";

async function main(): Promise<void> {
  const sdk = new AnchorFlow({ network: "testnet" });
  const info = await sdk.getAnchorInfo(ANCHOR_DOMAIN) as any;
  console.log("info completo:", JSON.stringify(info, null, 2));
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
