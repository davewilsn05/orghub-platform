"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string };

type EventDraft = {
  title: string;
  date_time?: string;
  location?: string;
  description?: string;
  category?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
};

type NewsletterDraft = {
  subject: string;
  preheader?: string;
  html_body: string;
};

type PendingAction =
  | { kind: "event"; data: EventDraft }
  | { kind: "newsletter"; data: NewsletterDraft };

type Props = { orgName: string; orgSlug: string; widgetMode?: boolean };

const SUGGESTED_PROMPTS = [
  "Create an event from this:\nPotluck dinner March 14 at 6pm, Main Hall.",
  "Write a newsletter about our upcoming fundraiser.",
  "How do I manage membership plans?",
  "How do I send invites to new members?",
];

export default function AssistantChat({
  orgName,
  orgSlug,
  widgetMode = false,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && !attachedFile) || streaming) return;

    const displayText = attachedFile
      ? `${text.trim() || "Please read this document."}\n📎 ${attachedFile.name}`
      : text.trim();
    const userMsg: Message = { role: "user", content: displayText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    const currentFile = attachedFile;
    setAttachedFile(null);
    setStreaming(true);
    setPendingAction(null);
    scrollToBottom();

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      let res: Response;

      if (currentFile) {
        const formData = new FormData();
        formData.append("messages", JSON.stringify(newMessages));
        formData.append("file", currentFile);
        res = await fetch("/api/ai/chat", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });
      }

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw) as {
              type: string;
              text?: string;
              name?: string;
              input?: Record<string, unknown>;
              message?: string;
            };

            if (event.type === "text" && event.text) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + event.text!,
                  };
                }
                return updated;
              });
              scrollToBottom();
            } else if (
              event.type === "tool_use" &&
              event.name &&
              event.input
            ) {
              if (event.name === "create_event_draft") {
                setPendingAction({
                  kind: "event",
                  data: event.input as EventDraft,
                });
              } else if (event.name === "draft_newsletter") {
                setPendingAction({
                  kind: "newsletter",
                  data: event.input as NewsletterDraft,
                });
              }
            } else if (event.type === "error") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: event.message ?? "Something went wrong.",
                  };
                }
                return updated;
              });
            }
          } catch {
            // skip malformed SSE line
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content:
              err instanceof Error
                ? `Error: ${err.message}`
                : "Something went wrong. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setStreaming(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const openEventForm = (draft: EventDraft) => {
    const params = new URLSearchParams();
    if (draft.title) params.set("title", draft.title);
    if (draft.date_time) params.set("date", draft.date_time);
    if (draft.location) params.set("location", draft.location);
    if (draft.description) params.set("description", draft.description);
    if (draft.category) params.set("category", draft.category);
    router.push(`/${orgSlug}/admin/events/new?${params.toString()}`);
  };

  const openNewsletterEditor = (draft: NewsletterDraft) => {
    sessionStorage.setItem(
      "newsletterAiDraft",
      JSON.stringify({
        subject: draft.subject,
        preheader: draft.preheader ?? "",
        html_body: draft.html_body,
      })
    );
    router.push(`/${orgSlug}/admin/newsletters`);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    lineHeight: 1.5,
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: widgetMode ? "100%" : "calc(100vh - 160px)",
        minHeight: widgetMode ? 0 : "500px",
        maxWidth: widgetMode ? "none" : "780px",
        margin: widgetMode ? 0 : "0 auto",
      }}
    >
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                ✦
              </div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  margin: "0 0 0.5rem",
                }}
              >
                {orgName} Assistant
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                Ask questions, create events from text, or draft newsletters.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                maxWidth: "600px",
                margin: "0 auto",
                width: "100%",
              }}
            >
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void sendMessage(prompt)}
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    color: "#374151",
                    cursor: "pointer",
                    textAlign: "left",
                    lineHeight: 1.4,
                    fontFamily: "inherit",
                  }}
                >
                  {prompt.length > 80 ? prompt.slice(0, 80) + "..." : prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "0.75rem 1rem",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    msg.role === "user" ? "#1d4ed8" : "#f1f5f9",
                  color: msg.role === "user" ? "#fff" : "#1e293b",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content || (
                  <span style={{ opacity: 0.5 }}>
                    <span style={{ animation: "pulse 1s infinite" }}>
                      ●
                    </span>{" "}
                    Thinking...
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Action cards */}
        {pendingAction && pendingAction.kind === "event" && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "12px",
              padding: "1.25rem",
              maxWidth: "85%",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#166534",
              }}
            >
              Event Draft
            </span>
            <div
              style={{
                display: "grid",
                gap: "0.35rem",
                fontSize: "0.875rem",
                color: "#1e293b",
                marginTop: "0.5rem",
              }}
            >
              <div>
                <strong>Title:</strong> {pendingAction.data.title}
              </div>
              {pendingAction.data.location && (
                <div>
                  <strong>Location:</strong> {pendingAction.data.location}
                </div>
              )}
              {pendingAction.data.description && (
                <div>
                  <strong>Description:</strong>{" "}
                  {pendingAction.data.description.slice(0, 120)}
                </div>
              )}
            </div>
            <button
              onClick={() => openEventForm(pendingAction.data)}
              style={{
                marginTop: "0.75rem",
                padding: "0.5rem 1rem",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Open Event Form
            </button>
          </div>
        )}

        {pendingAction && pendingAction.kind === "newsletter" && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #93c5fd",
              borderRadius: "12px",
              padding: "1.25rem",
              maxWidth: "85%",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#1e40af",
              }}
            >
              Newsletter Draft
            </span>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#1e293b",
                marginTop: "0.5rem",
              }}
            >
              <strong>Subject:</strong> {pendingAction.data.subject}
            </div>
            <button
              onClick={() => openNewsletterEditor(pendingAction.data)}
              style={{
                marginTop: "0.75rem",
                padding: "0.5rem 1rem",
                background: "#1d4ed8",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Open in Newsletter Editor
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem" }}>
        {attachedFile && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.65rem",
              background: "#eff6ff",
              border: "1px solid #93c5fd",
              borderRadius: "8px",
              fontSize: "0.78rem",
              color: "#1e40af",
              marginBottom: "0.5rem",
            }}
          >
            <span>📎 {attachedFile.name}</span>
            <button
              onClick={() => setAttachedFile(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
                fontSize: "0.85rem",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div
          style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".rtf,.txt,.pdf,.docx,text/plain,text/rtf,application/rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAttachedFile(file);
              e.target.value = "";
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={streaming}
            title="Attach a document (.rtf, .txt, .pdf, .docx)"
            style={{
              padding: "0.6rem",
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              cursor: streaming ? "not-allowed" : "pointer",
              opacity: streaming ? 0.5 : 1,
              fontSize: "1.1rem",
              lineHeight: 1,
              flexShrink: 0,
              color: "#64748b",
            }}
          >
            📎
          </button>

          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question, paste event text, or attach a document..."
            disabled={streaming}
            style={{ ...inputStyle, opacity: streaming ? 0.6 : 1 }}
          />
          <button
            onClick={() => void sendMessage(input)}
            disabled={streaming || (!input.trim() && !attachedFile)}
            style={{
              padding: "0.75rem 1.25rem",
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor:
                streaming || (!input.trim() && !attachedFile)
                  ? "not-allowed"
                  : "pointer",
              opacity:
                streaming || (!input.trim() && !attachedFile) ? 0.5 : 1,
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            {streaming ? "..." : "Send →"}
          </button>
        </div>
      </div>
    </div>
  );
}
