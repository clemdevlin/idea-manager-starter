"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    ul: false,
    ol: false,
  })

  useEffect(() => {
    const updateState = () => {
      setFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        ul: document.queryCommandState("insertUnorderedList"),
        ol: document.queryCommandState("insertOrderedList"),
      })
    }

    document.addEventListener("selectionchange", updateState)
    return () => document.removeEventListener("selectionchange", updateState)
  }, [])

  const isHeading = (level: number) => {
    const sel = window.getSelection()
    if (!sel || !sel.anchorNode) return false

    const el =
      sel.anchorNode instanceof Element
        ? sel.anchorNode
        : sel.anchorNode.parentElement

    return el?.closest(`h${level}`) !== null
  }


  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const formatBlock = (tag: string) => {
    execCommand("formatBlock", `<${tag}>`)
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={() => formatBlock("h1")} className={cn("h-8 px-2", isHeading(1) && "bg-gray-300")}>
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatBlock("h2")} className={cn("h-8 px-2", isHeading(2) && "bg-gray-300")}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatBlock("h3")} className={cn("h-8 px-2", isHeading(3) && "bg-gray-300")}>
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("bold")} className={cn("h-8 px-2", formats.bold && "bg-gray-300")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("italic")} className={cn("h-8 px-2", formats.italic && "bg-gray-300")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("underline")} className={cn("h-8 px-2", formats.underline && "bg-gray-300")}>
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className={cn("h-8 px-2", formats.ul && "bg-gray-300")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          className={cn("h-8 px-2", formats.ol && "bg-gray-300")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertLink} className="h-8 px-2">
          <Link className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatBlock("blockquote")} className="h-8 px-2">
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "<pre>")}
          className="h-8 px-2"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "min-h-[200px] max-h-[400px] overflow-y-auto p-4 prose prose-sm max-w-none",
          "focus:outline-none",
          !value && !isFocused && "text-muted-foreground",
          "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground",
          "prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground",
          "prose-blockquote:text-muted-foreground prose-code:text-primary",
          "prose-a:text-primary hover:prose-a:text-primary/80",
        )}
        style={{
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
        suppressContentEditableWarning={true}
      />
    </div>
  )
}
