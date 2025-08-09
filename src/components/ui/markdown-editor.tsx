import * as React from "react";
import { cn } from "@/lib/utils";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Heading2, Heading3 } from "lucide-react";

export interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showToolbar?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  tabSize?: number;
  defaultTabEnable?: boolean;
}

const MarkdownEditor = React.forwardRef<
  HTMLTextAreaElement,
  MarkdownEditorProps
>(
  (
    {
      className,
      value = "",
      onChange,
      placeholder,
      maxLength,
      showToolbar = true,
      defaultTabEnable = true,
      ...props
    },
    ref
  ) => {
    const [isPreview, setIsPreview] = React.useState(false);

    const handleChange = (val?: string) => {
      if (onChange) {
        onChange(val ?? "");
      }
    };

    const insertMarkdown = (prefix: string, suffix: string = "") => {
      const textarea = document.querySelector(
        '[data-color-mode="light"] textarea'
      ) as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const newText =
          value.substring(0, start) +
          prefix +
          selectedText +
          suffix +
          value.substring(end);
        handleChange(newText);

        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + prefix.length,
            start + prefix.length + selectedText.length
          );
        }, 0);
      } else {
        // Fallback: just append to the end if textarea not found
        const newText = value + prefix + suffix;
        handleChange(newText);
      }
    };

    const Toolbar = () => (
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("**", "**")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("*", "*")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("## ")}
          className="h-8 w-8 p-0"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("### ")}
          className="h-8 w-8 p-0"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("- ")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="h-8 px-3 text-xs"
        >
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>
    );

    return (
      <div className={cn("w-full", className)}>
        {showToolbar && <Toolbar />}
        <div data-color-mode="light">
          <MDEditor
            value={value}
            onChange={handleChange}
            preview={isPreview ? "preview" : "edit"}
            hideToolbar={true}
            defaultTabEnable={defaultTabEnable}
            textareaProps={{
              ...props,
              placeholder,
              maxLength,
            }}
            className="min-h-[120px] border-0 focus:ring-0 [&_.w-md-editor-preview]:p-4 [&_.w-md-editor-preview_ul]:list-disc [&_.w-md-editor-preview_ul]:list-inside [&_.w-md-editor-preview_li]:ml-1"
          />
        </div>
        {maxLength && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {value.length}/{maxLength} characters
          </div>
        )}
      </div>
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";

export { MarkdownEditor };
