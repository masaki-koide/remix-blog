import fs from "fs/promises";
import path from "path";

export async function readPage(pageId: string) {
  const file = await fs.readFile(`./contents/scrapbox/${pageId}.txt`);
  return file.toString();
}
