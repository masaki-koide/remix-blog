import React from "react";
import type { Node } from "@progfay/scrapbox-parser";
import { Link } from "@remix-run/react";

export const ScrapboxNodes: React.FC<{ depth: number; nodes: Node[] }> = ({
  depth,
  nodes,
}) => {
  return (
    <>
      {nodes.map((node, idx) => {
        switch (node.type) {
          case "plain":
            return (
              <span style={{ fontSize: "1em" }} key={depth + "-" + idx}>
                {node.text}
              </span>
            );
          case "strong":
            return (
              <span
                key={depth + "-" + idx}
                style={{
                  fontWeight: "bold",
                  fontSize: "1em",
                }}
              >
                <ScrapboxNodes depth={depth++} nodes={node.nodes} />
              </span>
            );
          case "decoration":
            const size = parseInt(node.decos[0].substring(2));
            return React.createElement(
              `h${5 - size}`,
              {
                key: depth + "-" + idx,
                style: { borderBottom: "1px solid", padding: "16px 0" },
              },
              <ScrapboxNodes depth={depth++} nodes={node.nodes} />
            );
          case "image":
            return (
              <span
                key={depth + "-" + idx}
                style={{
                  display: "inline-block",
                  maxWidth: "300px",
                  maxHeight: "300px",
                }}
              >
                <img
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  alt=""
                  src={node.src}
                />
              </span>
            );
          case "link":
            switch (node.pathType) {
              case "relative":
                return (
                  <Link
                    key={depth + "-" + idx}
                    to={"/" + node.href}
                    style={{ fontSize: "1em" }}
                  >
                    {node.content.length !== 0 ? node.content : node.href}
                  </Link>
                );
              case "absolute":
                return (
                  <Link
                    key={depth + "-" + idx}
                    to={node.href}
                    style={{ fontSize: "1em" }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {node.content.length !== 0 ? node.content : node.href}
                  </Link>
                );
              default:
                break;
            }
          default:
            break;
        }
      })}
    </>
  );
};
