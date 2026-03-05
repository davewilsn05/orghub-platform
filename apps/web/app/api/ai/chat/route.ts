import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { loadOrgConfig } from "@/lib/org/loader";
import { parseDocument } from "@/lib/document-parser";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_event_draft",
      description:
        "Extract event details from natural language or pasted text to pre-fill the event creation form.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Event title" },
          date_time: {
            type: "string",
            description: "ISO 8601 datetime, e.g. 2026-03-14T18:00:00",
          },
          location: { type: "string", description: "Event location or venue" },
          description: { type: "string", description: "Event description" },
          category: {
            type: "string",
            description: "Event category, e.g. Social, Meeting, Fundraiser",
          },
          contact_name: { type: "string" },
          contact_email: { type: "string" },
          contact_phone: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_newsletter",
      description:
        "Draft a newsletter with a subject line and HTML body content.",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string", description: "Newsletter subject line" },
          preheader: {
            type: "string",
            description: "Short preview text shown in email inboxes",
          },
          html_body: {
            type: "string",
            description:
              "Newsletter body as simple HTML using <h2>, <p>, <ul>/<li>, <strong>, <em>. No inline styles needed.",
          },
        },
        required: ["subject", "html_body"],
      },
    },
  },
];

function buildSystemPrompt(
  orgName: string,
  isAdmin: boolean
): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const adminNav = isAdmin
    ? `
ADMIN TOOLS:
- To parse an event from text, paste the event information and I'll extract it into a draft.
- To draft a newsletter, describe the topic or paste bullet points and I'll write it.
- You can also attach documents (.rtf, .txt, .pdf, .docx) and I'll read them.`
    : "";

  return `You are a helpful assistant for ${orgName}, powered by OrgHub.
Today is ${today}.

Organization: ${orgName}

You help members and admins navigate the platform, answer questions, create events from text, and draft newsletters.
${adminNav}

RULES:
- Be concise, friendly, and helpful.
- Never invent events, member names, or data you don't have.
- Only call functions when explicitly asked to create an event or draft a newsletter.
- If a member asks how to do something, walk them through it step by step.`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI assistant is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: ChatMessage[];
  let documentContext = "";
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const messagesRaw = formData.get("messages");
      messages = messagesRaw ? JSON.parse(messagesRaw as string) : [];

      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        const parsed = await parseDocument(file);
        if (!parsed.ok) {
          return NextResponse.json({ error: parsed.error }, { status: 400 });
        }
        documentContext = `\n\n--- UPLOADED DOCUMENT: ${parsed.fileName} (${parsed.fileType}) ---\n${parsed.text}\n--- END DOCUMENT ---`;
      }
    } else {
      const body = (await request.json()) as { messages?: ChatMessage[] };
      messages = body.messages ?? [];
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const orgRole = user.app_metadata?.org_role as string | undefined;
  const isAdmin = orgRole === "admin" || orgRole === "board";

  const orgConfig = await loadOrgConfig();
  const orgName = orgConfig.name || "your organization";
  const systemPrompt = buildSystemPrompt(orgName, isAdmin);

  const client = new OpenAI({ apiKey });

  const encoder = new TextEncoder();
  const send = (
    controller: ReadableStreamDefaultController,
    data: unknown
  ) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const toolCallBuffers: Record<
          number,
          { name: string; arguments: string }
        > = {};

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 2048,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m, i) => ({
              role: m.role,
              content:
                documentContext &&
                m.role === "user" &&
                i === messages.length - 1
                  ? m.content + documentContext
                  : m.content,
            })),
          ],
          tools: isAdmin ? tools : undefined,
          tool_choice: isAdmin ? "auto" : undefined,
          stream: true,
        });

        for await (const chunk of completion) {
          const choice = chunk.choices[0];
          if (!choice) continue;

          const delta = choice.delta;

          if (delta.content) {
            send(controller, { type: "text", text: delta.content });
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index;
              if (!toolCallBuffers[idx]) {
                toolCallBuffers[idx] = {
                  name: tc.function?.name ?? "",
                  arguments: "",
                };
              }
              if (tc.function?.name) {
                toolCallBuffers[idx].name = tc.function.name;
              }
              if (tc.function?.arguments) {
                toolCallBuffers[idx].arguments += tc.function.arguments;
              }
            }
          }

          if (choice.finish_reason === "tool_calls") {
            for (const buf of Object.values(toolCallBuffers)) {
              try {
                const input = JSON.parse(buf.arguments) as Record<
                  string,
                  unknown
                >;
                send(controller, {
                  type: "tool_use",
                  name: buf.name,
                  input,
                });
              } catch {
                // Malformed JSON — skip
              }
            }
          }
        }

        send(controller, { type: "done" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unexpected error";
        send(controller, { type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
