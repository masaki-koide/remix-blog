import fs from "fs";
import dotenv from "dotenv";
import existPages from "../contents/scrapbox/pages.json";

const DIR = "./contents/scrapbox";

let createdCount = 0;
let updatedCount = 0;
let deletedCount = 0;

dotenv.config();

const { SCRAPBOX_PROJECT, SCRAPBOX_SESSION_ID } = process.env;
if (!SCRAPBOX_PROJECT || !SCRAPBOX_SESSION_ID) {
  console.error("Please set SCRAPBOX_PROJECT and SCRAPBOX_SESSION_ID");
  process.exit(1);
}

const publicPages = await fetch(
  `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}?skip=0\&sort=updated\&limit=100\&q=`,
  { headers: { Cookie: `connect.sid=${SCRAPBOX_SESSION_ID}` } }
)
  .then((res) => res.json())
  .then((json) => json["pages"])
  .then(filterPublicPages)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

fs.writeFileSync(`${DIR}/pages.json`, JSON.stringify(publicPages, null, 2));

const deletedPages = publicPages.reduce(async (prev, curr) => {
  const _prev = await prev;
  const existPageIndex = _prev.findIndex((page) => page.id === curr.id);
  if (existPageIndex === -1) {
    // 新規
    const text = await fetchPage(curr.title);
    fs.writeFileSync(`${DIR}/${curr.id}.txt`, text);
    createdCount++;
    return prev;
  }

  if (_prev[existPageIndex].updated !== curr.updated) {
    // 更新
    const text = await fetchPage(curr.title);
    updatedCount++;
    fs.writeFileSync(`${DIR}/${curr.id}.txt`, text);
  }

  // 削除されたページだけが残るように存在するページは配列から削除
  const result = [..._prev];
  result.splice(existPageIndex, 1);
  return result;
}, Promise.resolve(existPages as Page[]));

deletedPages
  .then((pages) => {
    pages.forEach((page) => {
      fs.unlinkSync(`${DIR}/${page.id}.txt`);
      deletedCount++;
    });
  })
  .then(() => {
    console.log(
      `${createdCount} created, ${updatedCount} updated, ${deletedCount} deleted`
    );
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

type Page = {
  id: string;
  title: string;
  pin: number;
  created: number;
  updated: number;
};

function filterPublicPages(pages: Page[]) {
  return pages.filter((page) => page.title.startsWith("public:"));
}

function fetchPage(title: string) {
  return fetch(
    `https://scrapbox.io/api/pages/${SCRAPBOX_PROJECT}/${encodeURIComponent(
      title
    )}/text`,
    { headers: { Cookie: `connect.sid=${SCRAPBOX_SESSION_ID}` } }
  )
    .then((res) => res.text())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
