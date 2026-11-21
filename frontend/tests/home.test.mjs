import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the home page renders the TicketIA heading in Brazilian Portuguese", async () => {
  const page = await readFile(new URL("../.next/server/app/index.html", import.meta.url), "utf8");

  assert.match(page, /<html\b[^>]*\blang="pt-BR"/);
  assert.match(page, /<h1\b[^>]*>TicketIA<\/h1>/);
});
