import { NextResponse } from "next/server";
import OpenAI from "openai";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = import("@supabase/supabase-js").SupabaseClient<any, any, any>;
import { createClient } from "@/lib/supabase/server";
import { loadOrgConfig } from "@/lib/org/loader";
import { parseDocument } from "@/lib/document-parser";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

/* ── client-side tools (forwarded to UI) ── */
const clientTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
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
          location: {
            type: "string",
            description: "Event location or venue",
          },
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
          subject: {
            type: "string",
            description: "Newsletter subject line",
          },
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

/* ── server-side tools (executed against Supabase, results fed back to AI) ── */
const serverTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "lookup_events",
      description:
        "Search the database for events. Can filter by date range, category, or keyword. Returns matching events with title, date, location, category, and description.",
      parameters: {
        type: "object",
        properties: {
          start_date: {
            type: "string",
            description: "Start of date range (ISO 8601, e.g. 2026-04-01)",
          },
          end_date: {
            type: "string",
            description: "End of date range (ISO 8601, e.g. 2026-04-30)",
          },
          category: {
            type: "string",
            description: "Filter by category name",
          },
          search: {
            type: "string",
            description: "Search keyword to match in title or description",
          },
          upcoming_only: {
            type: "boolean",
            description:
              "If true, only return events from today onwards (default true)",
          },
          limit: {
            type: "number",
            description: "Max events to return (default 20)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_member_stats",
      description:
        "Get membership statistics: total members, active members, new members this month, admins, board members.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_newsletters",
      description:
        "Get recent newsletters. Returns subject, status, sent date.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Max newsletters to return (default 10)",
          },
          status: {
            type: "string",
            description: "Filter by status: draft, sent, published",
          },
        },
        required: [],
      },
    },
  },
];

const CLIENT_TOOL_NAMES = new Set(
  clientTools.map(
    (t) => (t as { type: "function"; function: { name: string } }).function.name
  )
);
const allTools = [...clientTools, ...serverTools];

/* ── server-side tool execution ── */
async function executeServerTool(
  name: string,
  args: Record<string, unknown>,
  supabase: AnySupabase,
  isAdmin: boolean
): Promise<string> {
  switch (name) {
    case "lookup_events": {
      const startDate = args.start_date as string | undefined;
      const endDate = args.end_date as string | undefined;
      const category = args.category as string | undefined;
      const search = args.search as string | undefined;
      const upcomingOnly = args.upcoming_only !== false;
      const limit = Math.min(Number(args.limit) || 20, 50);

      let query = supabase
        .from("events")
        .select("title, start, location, category, description")
        .eq("is_published", true)
        .order("start", { ascending: true })
        .limit(limit);

      if (startDate) query = query.gte("start", startDate);
      if (endDate) query = query.lte("start", endDate + "T23:59:59");
      if (upcomingOnly && !startDate)
        query = query.gte("start", new Date().toISOString());
      if (category) query = query.ilike("category", `%${category}%`);
      if (search)
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`
        );

      const { data, error } = await query;
      if (error) return `Error querying events: ${error.message}`;
      if (!data || data.length === 0)
        return "No events found matching those criteria.";

      const lines = data.map((e) => {
        const d = new Date(e.start as string).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        return `- ${e.title} | ${d}${e.location ? ` | ${e.location}` : ""}${e.category ? ` [${e.category}]` : ""}`;
      });
      return `Found ${data.length} event(s):\n${lines.join("\n")}`;
    }
    case "get_member_stats": {
      if (!isAdmin) return "Member statistics are only available to admins.";

      const [total, active, admins, board, recent] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "board"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          ),
      ]);

      return [
        `Total members: ${total.count ?? "unknown"}`,
        `Active members: ${active.count ?? "unknown"}`,
        `Admins: ${admins.count ?? "unknown"}`,
        `Board: ${board.count ?? "unknown"}`,
        `New this month: ${recent.count ?? "unknown"}`,
      ].join("\n");
    }
    case "lookup_newsletters": {
      const nlLimit = Math.min(Number(args.limit) || 10, 25);
      const status = args.status as string | undefined;

      let query = supabase
        .from("newsletters")
        .select("subject, status, sent_at, published_at, created_at")
        .order("created_at", { ascending: false })
        .limit(nlLimit);

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) return `Error querying newsletters: ${error.message}`;
      if (!data || data.length === 0) return "No newsletters found.";

      const lines = data.map((n) => {
        const date = n.sent_at || n.published_at || n.created_at;
        const d = date
          ? new Date(date as string).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "no date";
        return `- "${n.subject}" (${n.status}) — ${d}`;
      });
      return `${data.length} newsletter(s):\n${lines.join("\n")}`;
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

function buildSystemPrompt(orgName: string, isAdmin: boolean): string {
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
- You have access to real data via tools. When asked about events, members, or newsletters, USE the lookup tools to get actual data — do NOT tell the user to go check a page.
- Never invent data. If a lookup returns no results, say so.
- Use create_event_draft or draft_newsletter when asked to create/draft content.
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
          return NextResponse.json(
            { error: parsed.error },
            { status: 400 }
          );
        }
        documentContext = `\n\n--- UPLOADED DOCUMENT: ${parsed.fileName} (${parsed.fileType}) ---\n${parsed.text}\n--- END DOCUMENT ---`;
      }
    } else {
      const body = (await request.json()) as { messages?: ChatMessage[] };
      messages = body.messages ?? [];
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages required" },
        { status: 400 }
      );
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
        const oaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
          [
            { role: "system", content: systemPrompt },
            ...messages.map((m, i) => ({
              role: m.role as "user" | "assistant",
              content:
                documentContext &&
                m.role === "user" &&
                i === messages.length - 1
                  ? m.content + documentContext
                  : m.content,
            })),
          ];

        const enabledTools = isAdmin ? allTools : serverTools;

        let loops = 0;
        const MAX_LOOPS = 5;

        while (loops < MAX_LOOPS) {
          loops++;

          const toolCallBuffers: Record<
            number,
            { id: string; name: string; arguments: string }
          > = {};

          const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 2048,
            messages: oaiMessages,
            tools: enabledTools.length > 0 ? enabledTools : undefined,
            tool_choice: enabledTools.length > 0 ? "auto" : undefined,
            stream: true,
          });

          let assistantContent = "";
          let finishReason = "";

          for await (const chunk of completion) {
            const choice = chunk.choices[0];
            if (!choice) continue;

            const delta = choice.delta;

            if (delta.content) {
              assistantContent += delta.content;
              send(controller, { type: "text", text: delta.content });
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index;
                if (!toolCallBuffers[idx]) {
                  toolCallBuffers[idx] = {
                    id: tc.id ?? `call_${idx}`,
                    name: tc.function?.name ?? "",
                    arguments: "",
                  };
                }
                if (tc.id) toolCallBuffers[idx].id = tc.id;
                if (tc.function?.name)
                  toolCallBuffers[idx].name = tc.function.name;
                if (tc.function?.arguments)
                  toolCallBuffers[idx].arguments += tc.function.arguments;
              }
            }

            if (choice.finish_reason) finishReason = choice.finish_reason;
          }

          if (
            finishReason !== "tool_calls" ||
            Object.keys(toolCallBuffers).length === 0
          ) {
            break;
          }

          const toolCalls = Object.values(toolCallBuffers);
          const serverCalls: {
            id: string;
            name: string;
            args: Record<string, unknown>;
          }[] = [];

          oaiMessages.push({
            role: "assistant",
            content: assistantContent || null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments },
            })),
          });

          for (const tc of toolCalls) {
            let args: Record<string, unknown>;
            try {
              args = JSON.parse(tc.arguments) as Record<string, unknown>;
            } catch {
              continue;
            }

            if (CLIENT_TOOL_NAMES.has(tc.name)) {
              send(controller, {
                type: "tool_use",
                name: tc.name,
                input: args,
              });
              oaiMessages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: "Action sent to user interface.",
              });
            } else {
              serverCalls.push({ id: tc.id, name: tc.name, args });
            }
          }

          if (serverCalls.length > 0) {
            const results = await Promise.all(
              serverCalls.map(async (sc) => ({
                id: sc.id,
                result: await executeServerTool(
                  sc.name,
                  sc.args,
                  supabase,
                  isAdmin
                ),
              }))
            );
            for (const r of results) {
              oaiMessages.push({
                role: "tool",
                tool_call_id: r.id,
                content: r.result,
              });
            }
            continue;
          }

          break;
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
