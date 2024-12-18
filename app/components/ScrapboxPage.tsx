import type { Page, Line, Node } from "@progfay/scrapbox-parser";
import { ScrapboxNodes } from "./ScrapboxNodes";

type Props = {
  page: Page;
};

export const ScrapboxPage: React.FC<Props> = ({ page }) => {
  const [title, ...lines] = page;

  return (
    <>
      {title.type === "title" && <h2>{title.text}</h2>}
      <ul>
        {(lines as Line[]).map((line, idx) => {
          if (line.nodes?.length > 0) {
            return isHeadingOnly(line.nodes) ? (
              <ScrapboxNodes key={idx} depth={0} nodes={line.nodes} />
            ) : (
              <li
                key={idx}
                style={{
                  margin: "8px " + line.indent * 24 + "px",
                }}
              >
                <ScrapboxNodes depth={0} nodes={line.nodes} />
              </li>
            );
          } else {
            return null;
          }
        })}
      </ul>
    </>
  );
};

function isHeadingOnly(nodes: Node[]) {
  return nodes.length === 1 && nodes[0].type === "decoration";
}
