"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 transition",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none px-6 py-4 text-slate-700 min-h-full",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-8 text-center text-gray-500">
        در حال بارگذاری ادیتور...
      </div>
    );
  }

  return (
    <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl shadow-lg flex flex-col h-full max-h-[600px] overflow-hidden">
      {/* Toolbar - کاملاً Sticky */}
     <div className="sticky top-0 z-50 border-b border-emerald-500/20 p-2 flex flex-wrap gap-1 bg-[#1f242d] shadow-md">
         <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-3 rounded-lg transition ${
            editor.isActive("bold")
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="بولد"
        >
          <Bold className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-3 rounded-lg transition ${
            editor.isActive("italic")
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="ایتالیک"
        >
          <Italic className="w-5 h-5" />
        </button>

        <div className="w-px bg-emerald-500/30" />

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-3 rounded-lg transition ${
            editor.isActive("heading", { level: 1 })
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="عنوان ۱"
        >
          <Heading1 className="w-5 h-5" />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-3 rounded-lg transition ${
            editor.isActive("heading", { level: 2 })
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="عنوان ۲"
        >
          <Heading2 className="w-5 h-5" />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-3 rounded-lg transition ${
            editor.isActive("heading", { level: 3 })
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="عنوان ۳"
        >
          <Heading3 className="w-5 h-5" />
        </button>

        <div className="w-px bg-emerald-500/30" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-3 rounded-lg transition ${
            editor.isActive("bulletList")
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="لیست نقطه‌ای"
        >
          <List className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-3 rounded-lg transition ${
            editor.isActive("orderedList")
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="لیست شماره‌دار"
        >
          <ListOrdered className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-3 rounded-lg transition ${
            editor.isActive("blockquote")
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="نقل قول"
        >
          <Quote className="w-5 h-5" />
        </button>

        <div className="w-px bg-emerald-500/30" />

        <button
          onClick={() => {
            const url = prompt("آدرس لینک را وارد کنید:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={`p-3 rounded-lg transition ${
            editor.isActive("link")
              ? "bg-emerald-500 text-white shadow-md"
              : "hover:bg-emerald-500/20 text-gray-300"
          }`}
          title="لینک"
        >
          <Link2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-3 rounded-lg hover:bg-emerald-500/20 text-gray-300 disabled:opacity-40"
          title="بازگردانی"
        >
          <Undo className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-3 rounded-lg hover:bg-emerald-500/20 text-gray-300 disabled:opacity-40"
          title="باز انجام"
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>

      {/* محتوای ادیتور - اینجا اسکرول می‌شود */}
      <div className="flex-1 overflow-y-auto bg-white rounded-b-xl scrollbar-thin scrollbar-thumb-emerald-500/20">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          direction: rtl;
          text-align: right;
          font-family: inherit;
          padding: 1.5rem;
          min-height: 400px;
        }
        /* بقیه استایل‌ها مثل قبل */
        .ProseMirror h1 {
          font-size: 3rem;
          font-weight: 900;
          margin: 3rem 0 2rem;
          line-height: 1.2;
          color: #0f172a;
        }
        .ProseMirror h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 4rem 0 1.5rem;
          line-height: 1.3;
          color: #0f172a;
          border-bottom: 2px solid #e0e7ff;
          padding-bottom: 1rem;
        }
        .ProseMirror h3 {
          font-size: 2rem;
          font-weight: 700;
          margin: 3rem 0 1rem;
          color: #1e293b;
        }
        .ProseMirror p {
          font-size: 1.125rem;
          line-height: 2.25;
          margin-bottom: 1.5rem;
          color: #334155;
        }
        .ProseMirror strong {
          font-weight: 800;
          color: #2563eb;
        }
        .ProseMirror blockquote {
          border-right: 6px solid #3b82f6;
          background: #eff6ff;
          padding: 1.5rem 2rem;
          border-radius: 1rem;
          margin: 2rem 0;
          font-style: italic;
          color: #1e40af;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-right: 2rem;
          margin: 1.5rem 0;
        }
        .ProseMirror li {
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
          line-height: 2;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
