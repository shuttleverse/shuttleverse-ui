import * as React from "react";
import MDEditor from "@uiw/react-md-editor";

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  className,
}) => {
  if (!children) return null;

  return (
    <div data-color-mode="light" className={className}>
      <MDEditor.Markdown
        source={children}
        style={{
          backgroundColor: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
        }}
      />
    </div>
  );
};

export { MarkdownRenderer };
