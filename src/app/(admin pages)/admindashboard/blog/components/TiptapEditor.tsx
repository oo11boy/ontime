"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import { Node } from "@tiptap/core";
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

// ========== Extension برای ویدیوی آپارات ==========
const AparatVideoExtension = Node.create({
  name: "aparatVideo",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      videoId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-aparat-video]",
        getAttrs: (dom: any) => ({
          videoId: dom.getAttribute("data-video-id"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        "data-aparat-video": "",
        "data-video-id": HTMLAttributes.videoId,
        class: "aparat-video-wrapper",
      },
    ];
  },

  addCommands() {
    return {
      setAparatVideo:
        (options: { videoId: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ({ node }: any) => {
      const videoId = node.attrs.videoId;
      const container = document.createElement("div");
      container.className = "aparat-video-container my-4";
      container.innerHTML = `
        <style>
          .h_iframe-aparat-embed-frame {
            position: relative;
            margin: 1rem 0;
          }
          .h_iframe-aparat-embed-frame .ratio {
            display: block;
            width: 100%;
            height: auto;
            padding-top: 56.25%;
          }
          .h_iframe-aparat-embed-frame iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
        </style>
        <div class="h_iframe-aparat-embed-frame">
          <span class="ratio"></span>
          <iframe 
            src="https://www.aparat.com/video/video/embed/videohash/${videoId}/vt/frame?titleShow=true" 
            allowFullScreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true"
            loading="lazy"
          ></iframe>
        </div>
      `;
      return {
        dom: container,
      };
    };
  },
});

// اضافه کردن تایپ برای دستورات
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aparatVideo: {
      setAparatVideo: (options: { videoId: string }) => ReturnType;
    };
  }
}

// استخراج آیدی ویدیو از لینک آپارات
const extractAparatVideoId = (url: string): string | null => {
  const patterns = [
    /aparat\.com\/v\/([a-zA-Z0-9]+)/,
    /aparat\.com\/video\/([a-zA-Z0-9]+)/,
    /videohash\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
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
      AparatVideoExtension,
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none px-6 py-4 text-slate-700 min-h-full",
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

  const addAparatVideo = () => {
    const aparatUrl = prompt("لینک ویدیو آپارات را وارد کنید:");
    if (!aparatUrl) return;
    
    const videoId = extractAparatVideoId(aparatUrl);
    if (!videoId) {
      alert("لینک آپارات معتبر نیست! مثال: https://www.aparat.com/v/abc123");
      return;
    }
    
    if (editor) {
      editor.chain().focus().setAparatVideo({ videoId }).run();
    }
  };

  if (!editor) {
    return (
      <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-8 text-center text-gray-500">
        در حال بارگذاری ادیتور...
      </div>
    );
  }

  return (
    <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl shadow-lg flex flex-col h-full max-h-[600px] overflow-hidden">
      {/* Toolbar */}
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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

        {/* دکمه آپارات */}
        <button
          onClick={addAparatVideo}
          className="p-3 rounded-lg hover:bg-emerald-500/20 text-gray-300 transition"
          title="افزودن ویدیو از آپارات"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 15l5-3-5-3v6z" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </button>

        <div className="w-px bg-emerald-500/30" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-3 rounded-lg hover:bg-emerald-500/20 text-gray-300 disabled:opacity-40 transition"
          title="بازگردانی"
        >
          <Undo className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-3 rounded-lg hover:bg-emerald-500/20 text-gray-300 disabled:opacity-40 transition"
          title="باز انجام"
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>

      {/* محتوای ادیتور */}
      <div className="flex-1 overflow-y-auto bg-white rounded-b-xl">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          direction: rtl;
          text-align: right;
          font-family: inherit;
          padding: 1.5rem;
          min-height: 400px;
          outline: none;
        }
        .ProseMirror h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 2rem 0 1rem;
          color: #0f172a;
        }
        .ProseMirror h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
          color: #1e293b;
        }
        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0;
          color: #334155;
        }
        .ProseMirror p {
          font-size: 1rem;
          line-height: 1.75;
          margin-bottom: 1rem;
          color: #334155;
        }
        .ProseMirror blockquote {
          border-right: 4px solid #3b82f6;
          background: #f0f9ff;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          color: #1e40af;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-right: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}