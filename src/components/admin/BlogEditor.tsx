"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback } from "react";
import {
  Bold, Italic, UnderlineIcon, Link2, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Minus,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function BlogEditor({ content, onChange, onImageUpload }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({ allowBase64: false, inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary-container underline" } }),
      Placeholder.configure({ placeholder: "Begin hier met schrijven…" }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[400px] px-6 py-5 focus:outline-none",
      },
    },
  });

  const handleImageUpload = useCallback(async () => {
    if (!editor || !onImageUpload) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  }, [editor, onImageUpload]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string ?? "";
    const url = window.prompt("URL:", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean, onClick: () => void, children: React.ReactNode, title?: string) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${active ? "bg-primary-container text-white" : "text-on-surface-variant hover:bg-surface-container"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-outline-variant/20 bg-surface-container-low">
        {/* Headings */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-outline-variant/20">
          {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 size={16} />, "H1")}
          {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={16} />, "H2")}
          {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 size={16} />, "H3")}
        </div>

        {/* Text formatting */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-outline-variant/20">
          {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold size={15} />, "Vet")}
          {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic size={15} />, "Cursief")}
          {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon size={15} />, "Onderstrepen")}
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-outline-variant/20">
          {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), <AlignLeft size={15} />, "Links")}
          {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), <AlignCenter size={15} />, "Gecentreerd")}
          {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), <AlignRight size={15} />, "Rechts")}
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-outline-variant/20">
          {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List size={15} />, "Lijst")}
          {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={15} />, "Genummerde lijst")}
          {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <Quote size={15} />, "Citaat")}
          {btn(false, () => editor.chain().focus().setHorizontalRule().run(), <Minus size={15} />, "Horizontale lijn")}
        </div>

        {/* Link & Image */}
        <div className="flex items-center gap-0.5">
          {btn(editor.isActive("link"), setLink, <Link2 size={15} />, "Link")}
          {onImageUpload && btn(false, handleImageUpload, <ImageIcon size={15} />, "Afbeelding")}
        </div>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
