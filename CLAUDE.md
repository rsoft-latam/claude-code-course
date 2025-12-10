# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator that provides a live preview environment. Users describe components in natural language, and the AI generates React code in a virtual file system (no files written to disk) with instant browser preview.

## Development Commands

### Setup
```bash
npm run setup              # Install deps + Prisma generate + migrations
```

### Running
```bash
npm run dev                # Start Next.js dev server (Turbopack)
npm run dev:daemon         # Start dev server in background, logs to logs.txt
npm run build              # Production build
npm start                  # Start production server
```

### Testing
```bash
npm test                   # Run all Vitest tests
npm test -- [file-path]    # Run specific test file
npm test -- --watch        # Run tests in watch mode
```

### Database
```bash
npx prisma generate        # Generate Prisma client after schema changes
npx prisma migrate dev     # Create and apply new migration
npm run db:reset           # Reset database (force)
npx prisma studio          # Open Prisma Studio GUI
```

### Linting
```bash
npm run lint               # Run ESLint
```

## Architecture

### Core Concept: Virtual File System
The entire app is built around a **VirtualFileSystem** class (`src/lib/file-system.ts`) that maintains an in-memory file tree. No generated code touches the disk. This allows users to experiment freely and enables instant preview updates.

### AI Integration Flow
1. **Chat Interface** → User sends a message via `ChatProvider` (`src/lib/contexts/chat-context.tsx`)
2. **API Route** → `/api/chat/route.ts` handles the request using Vercel AI SDK's `streamText`
3. **LLM with Tools** → Claude (or MockLanguageModel if no API key) uses two tools:
   - `str_replace_editor`: View/create/edit files (string replacement, insertion)
   - `file_manager`: Rename/delete files
4. **Tool Execution** → Tools operate on the VirtualFileSystem instance
5. **Context Updates** → `FileSystemProvider` detects changes and triggers re-render
6. **Preview Update** → `PreviewFrame` transforms code and updates iframe

### File System Architecture
- `VirtualFileSystem`: Core class managing a Map-based file tree with full CRUD operations
- `FileSystemProvider`: React context wrapping VirtualFileSystem, manages selected file state
- Tool handlers sync file system changes with UI state via `handleToolCall()`
- Serialization: Convert VirtualFileSystem to/from plain objects for database persistence

### Preview System
The preview system (`src/lib/transform/jsx-transformer.ts`) transforms JSX/TSX to browser-runnable code:

1. **Babel Transform**: Convert JSX/TSX to plain JS using `@babel/standalone`
2. **Import Map Creation**: Build import maps with:
   - Local files → blob URLs (created from transformed code)
   - React/React-DOM → esm.sh CDN links
   - `@/` path alias → maps to root directory
   - Third-party packages → esm.sh
3. **Preview HTML Generation**: Create sandboxed iframe with:
   - Import map in `<script type="importmap">`
   - Tailwind CSS via CDN
   - Collected CSS from `.css` files
   - Error boundary for runtime errors
   - Syntax error display for transform errors
4. **Iframe Sandbox**: Preview runs in sandboxed iframe with `allow-scripts allow-same-origin allow-forms`

Entry point discovery: Looks for `/App.jsx`, `/App.tsx`, `/index.jsx`, `/index.tsx`, or first `.jsx/.tsx` file.

### Database & Persistence
- **Prisma + SQLite**: Schema in `prisma/schema.prisma`
- **User Model**: Email/password auth with bcrypt
- **Project Model**: Stores serialized messages and VirtualFileSystem data as JSON strings
- Authentication via JWT (jose library) with httpOnly cookies (`src/lib/auth.ts`)
- Anonymous users: Work tracked in localStorage via `src/lib/anon-work-tracker.ts`

### Key Contexts
1. **FileSystemProvider** (`src/lib/contexts/file-system-context.tsx`):
   - Owns VirtualFileSystem instance
   - Manages selected file state
   - Provides CRUD methods that trigger UI updates via `refreshTrigger`
   - Handles tool calls from AI by applying changes to file system

2. **ChatProvider** (`src/lib/contexts/chat-context.tsx`):
   - Uses Vercel AI SDK's `useChat` hook
   - Serializes VirtualFileSystem on every request to `/api/chat`
   - Listens to `onToolCall` and forwards to `FileSystemProvider.handleToolCall()`
   - Tracks anonymous user work in localStorage

### Tool Implementation
Tools are built using Vercel AI SDK's `tool()` helper:
- `buildStrReplaceTool()` in `src/lib/tools/str-replace.ts`: Text editor commands (view, create, str_replace, insert)
- `buildFileManagerTool()` in `src/lib/tools/file-manager.ts`: File operations (rename, delete)

Both accept a VirtualFileSystem instance and return tool definitions with Zod schemas and execute functions.

### Mock Provider
When `ANTHROPIC_API_KEY` is not set, a `MockLanguageModel` (`src/lib/provider.ts`) simulates Claude:
- Creates static Counter/ContactForm/Card components based on keywords
- Executes 4-step workflow: create App.jsx → create component → enhance component → summary
- Includes realistic delays to simulate streaming

### Component Structure
- **UI Components**: shadcn/ui components in `src/components/ui/`
- **Editor Components**: `FileTree.tsx` and `CodeEditor.tsx` (Monaco) in `src/components/editor/`
- **Chat Components**: `ChatInterface.tsx`, `MessageList.tsx`, `MessageInput.tsx`, `MarkdownRenderer.tsx` in `src/components/chat/`
- **Preview**: `PreviewFrame.tsx` handles iframe rendering and error states
- **Auth**: `SignInForm.tsx`, `SignUpForm.tsx`, `AuthDialog.tsx` in `src/components/auth/`

### Testing
- **Vitest** with jsdom environment for React component tests
- Test files colocated with source: `__tests__/` directories
- Key test files:
  - File system operations: `src/lib/__tests__/file-system.test.ts`
  - JSX transformer: `src/lib/transform/__tests__/jsx-transformer.test.ts`
  - Context providers: `src/lib/contexts/__tests__/*.test.tsx`
  - Components: `src/components/**/__tests__/*.test.tsx`

## Important Implementation Notes

### Code Style
Use comments sparingly. Only comment complex code where the logic isn't self-evident.

### Path Aliases
- `@/` → root `src/` directory (configured in `tsconfig.json`)
- VirtualFileSystem normalizes all paths to start with `/`
- Import map builder handles `@/` alias resolution for both local and generated files

### File System Tool Protocol
When the AI uses tools, the flow is:
1. AI calls tool (e.g., `str_replace_editor`)
2. Tool executes on server-side VirtualFileSystem
3. Tool result returned to AI
4. Client receives tool call in `onToolCall` callback
5. Client-side `handleToolCall()` applies same change to client VirtualFileSystem
6. UI updates via `refreshTrigger` state change

This dual-execution ensures server and client stay in sync.

### Monaco Editor Integration
- Uses `@monaco-editor/react` wrapper
- Editor receives file content from VirtualFileSystem via `getFileContent()`
- Changes saved back via `updateFile()` method
- Syntax highlighting based on file extension

### Next.js 15 App Router
- Server components by default (note: most of this app is client-side due to interactivity)
- Dynamic routes: `app/[projectId]/page.tsx` for project loading
- Server actions in `src/actions/` for database operations (create-project, get-projects, get-project)
- Middleware (`src/middleware.ts`) currently minimal

### Styling
- **Tailwind CSS v4** (PostCSS plugin-based, not JIT)
- Global styles in `src/app/globals.css`
- Uses `tailwind-merge` and `clsx` via `src/lib/utils.ts` for className utilities
- Tailwind CDN injected into preview iframe for component styling

## Common Patterns

### Adding a New Tool for the AI
1. Create tool builder in `src/lib/tools/[tool-name].ts`
2. Use Zod schema for parameters
3. Accept VirtualFileSystem instance as parameter
4. Return object matching Vercel AI SDK tool interface
5. Add tool to `tools` object in `src/app/api/chat/route.ts`
6. Handle tool call in `FileSystemProvider.handleToolCall()` if UI updates needed

### Extending VirtualFileSystem
The class provides methods for:
- Standard CRUD: `createFile`, `readFile`, `updateFile`, `deleteFile`
- Directory operations: `createDirectory`, `listDirectory`
- Advanced: `rename` (with recursive path updates), `exists`, `getNode`
- Editor-specific: `viewFile`, `replaceInFile`, `insertInFile`, `createFileWithParents`
- Persistence: `serialize` / `deserialize` / `deserializeFromNodes`

### Preview Error Handling
Transform errors (syntax errors) are collected during `createImportMap()` and displayed in a formatted error UI within the preview iframe. Files with errors are skipped from the import map to prevent cascade failures.
