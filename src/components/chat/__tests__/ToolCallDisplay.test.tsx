import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay } from "../ToolCallDisplay";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div className={className} data-testid="loader-icon">
      Loader
    </div>
  ),
  Check: ({ className }: { className?: string }) => (
    <div className={className} data-testid="check-icon">
      Check
    </div>
  ),
  Plus: ({ className }: { className?: string }) => (
    <div className={className} data-testid="plus-icon">
      Plus
    </div>
  ),
  Edit2: ({ className }: { className?: string }) => (
    <div className={className} data-testid="edit-icon">
      Edit
    </div>
  ),
  RotateCcw: ({ className }: { className?: string }) => (
    <div className={className} data-testid="rotate-icon">
      Rotate
    </div>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <div className={className} data-testid="arrow-icon">
      Arrow
    </div>
  ),
  Trash2: ({ className }: { className?: string }) => (
    <div className={className} data-testid="trash-icon">
      Trash
    </div>
  ),
  FileCode: ({ className }: { className?: string }) => (
    <div className={className} data-testid="file-code-icon">
      FileCode
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

// Helper to create mock tool invocation
function createToolInvocation(
  toolName: string,
  args: Record<string, any>,
  state: "partial-call" | "call" | "result" = "call",
  result?: any
) {
  return {
    toolCallId: "test-id",
    toolName,
    args,
    state,
    result,
  };
}

test("renders pending state with spinner for str_replace_editor create", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/App.tsx" },
    "call"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByTestId("loader-icon")).toBeDefined();
  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText(/App\.tsx/)).toBeDefined();
});

test("renders success state with check icon for str_replace_editor create", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/App.tsx" },
    "result",
    { success: true }
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByTestId("check-icon")).toBeDefined();
  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText(/App\.tsx/)).toBeDefined();
});

test("renders pending state for file_manager rename", () => {
  const toolInvocation = createToolInvocation(
    "file_manager",
    { command: "rename", path: "/old.tsx", new_path: "/new.tsx" },
    "call"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByTestId("loader-icon")).toBeDefined();
  expect(screen.getByText(/Renaming/)).toBeDefined();
});

test("renders success state for file_manager rename", () => {
  const toolInvocation = createToolInvocation(
    "file_manager",
    { command: "rename", path: "/old.tsx", new_path: "/new.tsx" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByTestId("check-icon")).toBeDefined();
  expect(screen.getByText(/Renaming/)).toBeDefined();
});

// str_replace_editor command tests
test('command "view" displays "Viewing `path`"', () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "view", path: "/components/Button.tsx" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Viewing/)).toBeDefined();
  expect(screen.getByText(/Button\.tsx/)).toBeDefined();
  expect(screen.getByTestId("file-code-icon")).toBeDefined();
});

test('command "create" displays "Creating `path`"', () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/Counter.tsx", file_text: "const Counter = () => {}" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText(/Counter\.tsx/)).toBeDefined();
  expect(screen.getByTestId("plus-icon")).toBeDefined();
});

test('command "str_replace" displays "Editing `path`"', () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    {
      command: "str_replace",
      path: "/App.tsx",
      old_str: "old code",
      new_str: "new code",
    },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Editing/)).toBeDefined();
  expect(screen.getByText(/App\.tsx/)).toBeDefined();
  expect(screen.getByTestId("edit-icon")).toBeDefined();
});

test('command "insert" displays "Adding code to `path`"', () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    {
      command: "insert",
      path: "/utils.ts",
      insert_line: 10,
      new_str: "// new function",
    },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Adding code to/)).toBeDefined();
  expect(screen.getByText(/utils\.ts/)).toBeDefined();
  expect(screen.getByTestId("plus-icon")).toBeDefined();
});

test('command "undo_edit" displays "Reverting `path`"', () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "undo_edit", path: "/App.tsx" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Reverting/)).toBeDefined();
  expect(screen.getByText(/App\.tsx/)).toBeDefined();
  expect(screen.getByTestId("rotate-icon")).toBeDefined();
});

// file_manager command tests
test('command "rename" displays "Renaming `old` → `new`"', () => {
  const toolInvocation = createToolInvocation(
    "file_manager",
    { command: "rename", path: "/old-name.tsx", new_path: "/new-name.tsx" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Renaming/)).toBeDefined();
  expect(screen.getByText(/old-name\.tsx/)).toBeDefined();
  expect(screen.getByText(/new-name\.tsx/)).toBeDefined();
  expect(screen.getByTestId("arrow-icon")).toBeDefined();
});

test('command "delete" displays "Deleting `path`"', () => {
  const toolInvocation = createToolInvocation(
    "file_manager",
    { command: "delete", path: "/unused.tsx" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Deleting/)).toBeDefined();
  expect(screen.getByText(/unused\.tsx/)).toBeDefined();
  expect(screen.getByTestId("trash-icon")).toBeDefined();
});

// Edge case tests
test("handles missing args gracefully (displays tool name fallback)", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {}, "result");

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("str_replace_editor")).toBeDefined();
  expect(screen.getByTestId("check-icon")).toBeDefined();
});

test("handles special characters in file paths", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/components/my-special-file (1).tsx" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText(/my-special-file \(1\)\.tsx/)).toBeDefined();
});

test("extracts filename from nested paths", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/src/components/ui/Button.tsx" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText(/Button\.tsx/)).toBeDefined();
});

test("pending state has spinner animation class", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/App.tsx" },
    "call"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  const spinner = screen.getByTestId("loader-icon");
  expect(spinner.className).toContain("animate-spin");
});

test("success state shows check icon with emerald color", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/App.tsx" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  const checkIcon = screen.getByTestId("check-icon");
  expect(checkIcon.className).toContain("text-emerald-500");
});

test("renders as inline-flex element", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/App.tsx" },
    "result"
  );

  const { container } = render(<ToolCallDisplay toolInvocation={toolInvocation} />);
  const element = container.firstChild as HTMLElement;

  expect(element.className).toContain("inline-flex");
});

test("unknown tool command falls back to tool name", () => {
  const toolInvocation = createToolInvocation(
    "unknown_tool",
    { some: "data" },
    "result"
  );

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("unknown_tool")).toBeDefined();
});
