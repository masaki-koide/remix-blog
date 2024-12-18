import { parse, type Line } from "@progfay/scrapbox-parser";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { readPage } from "server/readPage.server";
import invariant from "tiny-invariant";
import { ScrapboxPage } from "~/components/ScrapboxPage";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.pageId, "Missing pageId param");
  let text: string;
  try {
    text = await readPage(params.pageId);
  } catch {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ page: parse(text) });
};

export default function Page() {
  const { page } = useLoaderData<typeof loader>();

  return <ScrapboxPage page={page} />;
}
