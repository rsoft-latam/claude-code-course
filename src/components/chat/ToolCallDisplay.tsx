"use client";

import {
  Loader2,
  Check,
  Plus,
  Edit2,
  RotateCcw,
  ArrowRight,
  Trash2,
  FileCode
} from "lucide-react";

interface ToolCallDisplayProps {
  toolInvocation: {
    toolCallId: string;
    args: Record<string, any>;
    toolName: string;
    state: "partial-call" | "call" | "result";
    result?: any;
  };
}

interface ToolMessage {
  prefix: string;
  description: string;
  icon: React.ReactNode;
}

function getToolMessage(toolInvocation: ToolCallDisplayProps["toolInvocation"]): ToolMessage {
  const { toolName, args } = toolInvocation;

  // Helper to extract filename from path
  const getFileName = (path: string): string => {
    if (!path) return "";
    const parts = path.split("/");
    return parts[parts.length - 1] || path;
  };

  // Handle str_replace_editor tool
  if (toolName === "str_replace_editor" && args) {
    const path = args.path;
    const fileName = getFileName(path);
    const command = args.command;

    switch (command) {
      case "view":
        return {
          prefix: "Viewing",
          description: `\`${fileName}\``,
          icon: <FileCode className="w-3 h-3" />,
        };
      case "create":
        return {
          prefix: "Creating",
          description: `\`${fileName}\``,
          icon: <Plus className="w-3 h-3" />,
        };
      case "str_replace":
        return {
          prefix: "Editing",
          description: `\`${fileName}\``,
          icon: <Edit2 className="w-3 h-3" />,
        };
      case "insert":
        return {
          prefix: "Adding code to",
          description: `\`${fileName}\``,
          icon: <Plus className="w-3 h-3" />,
        };
      case "undo_edit":
        return {
          prefix: "Reverting",
          description: `\`${fileName}\``,
          icon: <RotateCcw className="w-3 h-3" />,
        };
    }
  }

  // Handle file_manager tool
  if (toolName === "file_manager" && args) {
    const path = args.path;
    const fileName = getFileName(path);
    const command = args.command;

    switch (command) {
      case "rename":
        const newPath = args.new_path;
        const newFileName = getFileName(newPath);
        return {
          prefix: "Renaming",
          description: `\`${fileName}\` → \`${newFileName}\``,
          icon: <ArrowRight className="w-3 h-3" />,
        };
      case "delete":
        return {
          prefix: "Deleting",
          description: `\`${fileName}\``,
          icon: <Trash2 className="w-3 h-3" />,
        };
    }
  }

  // Fallback to showing tool name
  return {
    prefix: "",
    description: toolName,
    icon: null,
  };
}

export function ToolCallDisplay({ toolInvocation }: ToolCallDisplayProps) {
  const { prefix, description, icon } = getToolMessage(toolInvocation);
  const isPending = toolInvocation.state !== "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      ) : (
        <Check className="w-3 h-3 text-emerald-500" />
      )}

      {icon && <span className="text-neutral-600">{icon}</span>}

      <span className="text-neutral-700">
        {prefix && <span>{prefix} </span>}
        <span dangerouslySetInnerHTML={{ __html: description }} />
      </span>
    </div>
  );
}
