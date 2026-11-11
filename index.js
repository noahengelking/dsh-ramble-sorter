/**
 * Host half of the Ramble sorter bundle.
 *
 * Exposes one local route, `POST /ramble-sorter/sort`, that rewrites a raw
 * dictation transcript into a structured instruction using the profile's
 * default model. The browser half does the capture, review and copy; the model
 * call never leaves the host.
 */
const ROUTE = '/ramble-sorter/sort';
const MAX_BODY_BYTES = 120000;
const MAX_TRANSCRIPT_CHARS = 24000;
const TIMEOUT_MS = 120000;

const SYSTEM = `You are a dictation sorter. The user dictated a ramble with speech-to-text; it is messy, repetitive, self-correcting, and may contain ASR errors. You rewrite it into ONE self-contained instruction that a coding agent can execute with zero guessing.

You are a rewriter, not a summariser. Relabelling the transcript or merely removing punctuation is a failure. The output must read as written prose someone composed deliberately: correct grammar, resolved pronouns, merged duplicates, logical order, split compound asks.

Hard rules:
- Rewrite freely, invent never. Every fact must come from the transcript or be marked as an assumption you made.
- Later corrections win: "actually", "no wait", "scratch that" override what came before; delete the superseded statement.
- "I think / maybe / probably / not sure" is an unverified hypothesis. Never turn it into a requirement. Put it in hypotheses with the phrase it came from.
- Ideas the user did not ask for ("maybe we should also…", "someday…") go in parked, never in requirements.
- "Don't touch X" / "keep Y as is" is a hard constraint. Always keep it in constraints.
- Resolve references: "it", "that thing", "the panel" become the concrete noun found in the transcript. If the noun cannot be resolved from the transcript, ask one question instead of guessing.
- If the user asked themselves a question ("does it even do X?"), it is not a task. Resolve it as an assumption or put it in questions. Never leave it in background.
- background is only context that changes how the work is done. No filler, no "one last thing", no meta commentary.
- questions must be answerable and few: at most 3. Give 2-4 concrete options each. Ask only when the answer changes the instruction.
- doneWhen lists observable conditions stated or directly implied by the user. Do not invent acceptance criteria; an empty list is correct when none were given.
- Keep identifiers, file paths, code, numbers, names and quoted strings exactly as dictated.
- The instruction must not contain questions or interview text. Questions live only in questions.

Be compact: every string is one short sentence, no repetition, no restating the rules.

Return ONLY a JSON object, no markdown fence, no prose, matching exactly:
{
  "goal": "one imperative sentence",
  "requirements": [{ "text": "one testable requirement" }],
  "constraints": ["hard constraint"],
  "bugs": [{ "symptom": "...", "where": "...", "expected": "..." }],
  "hypotheses": [{ "text": "...", "basis": "the phrase it came from" }],
  "parked": ["idea not to build now"],
  "assumptions": [{ "kind": "scope|target|ordering|intent", "text": "...", "basis": "..." }],
  "questions": [{ "q": "...", "options": ["...", "..."], "blocking": true }],
  "doneWhen": ["observable condition"]
}`;

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('request body too large');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function userPrompt(transcript, answers) {
  const lines = ['TRANSCRIPT:', '"""', transcript, '"""'];
  const entries = Object.entries(answers || {}).filter(
    ([, value]) => typeof value === 'string' && value.trim() !== ''
  );
  if (entries.length > 0) {
    lines.push('', 'CLARIFICATIONS (authoritative answers from the person who dictated):');
    for (const [question, answer] of entries) {
      lines.push(`- ${question} => ${String(answer).trim()}`);
    }
    lines.push('Resolve the instruction with these answers; do not ask them again.');
  }
  return lines.join('\n');
}

function parseBrief(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error(`the model returned no JSON object: ${text.slice(0, 400)}`);
  const parsed = JSON.parse(text.slice(start, end + 1));
  const strings = (value) =>
    Array.isArray(value) ? value.map((entry) => String(entry).trim()).filter(Boolean) : [];
  const list = (value, keys) =>
    Array.isArray(value)
      ? value
          .map((entry) => {
            if (typeof entry === 'string') return { text: entry.trim() };
            const out = {};
            for (const key of keys) {
              if (entry && entry[key] != null) out[key] = String(entry[key]).trim();
            }
            return out;
          })
          .filter((entry) => Object.values(entry).some(Boolean))
      : [];
  return {
    goal: typeof parsed.goal === 'string' ? parsed.goal.trim() : '',
    requirements: list(parsed.requirements, ['text']),
    constraints: strings(parsed.constraints),
    bugs: list(parsed.bugs, ['symptom', 'where', 'expected']),
    hypotheses: list(parsed.hypotheses, ['text', 'basis']),
    parked: strings(parsed.parked),
    assumptions: list(parsed.assumptions, ['kind', 'text', 'basis']),
    questions: list(parsed.questions, ['q', 'blocking']).map((question, index) => ({
      q: question.q || `Question ${index + 1}`,
      options: Array.isArray((parsed.questions || [])[index]?.options)
        ? (parsed.questions[index].options || []).map((option) => String(option).trim()).filter(Boolean)
        : [],
      blocking: (parsed.questions || [])[index]?.blocking !== false,
    })),
    doneWhen: strings(parsed.doneWhen),
  };
}

async function sortTranscript(ctx, transcript, answers) {
  const selection = ctx.agentDefaultModel.currentSelection();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const call = await ctx.llm.prepareCall(
      { provider: selection.provider, model: selection.model, maxTokens: 4000 },
      controller.signal
    );
    const options = {
      ...call.config,
      system: SYSTEM,
      messages: [
        { role: 'user', content: [{ type: 'text', text: userPrompt(transcript, answers) }] },
      ],
      signal: controller.signal,
    };
    let text = '';
    for await (const chunk of call.stream(options)) {
      if (chunk && chunk.type === 'text-delta' && typeof chunk.text === 'string') text += chunk.text;
    }
    if (!text.trim()) throw new Error('the model returned no text');
    return parseBrief(text);
  } finally {
    clearTimeout(timer);
  }
}

export const name = 'ramble-sorter';
export const inject = ['webServer', 'llm', 'agentDefaultModel'];

export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE,
        handler: async (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405, { allow: 'POST' });
            res.end();
            return;
          }
          const origin = req.headers.origin;
          if (origin !== undefined && origin !== ctx.webServer.getOrigin()) {
            send(res, 403, { ok: false, error: 'cross-origin request refused' });
            return;
          }
          try {
            const body = await readJson(req);
            const transcript = String(body.transcript || '').trim().slice(0, MAX_TRANSCRIPT_CHARS);
            if (!transcript) {
              send(res, 400, { ok: false, error: 'transcript is empty' });
              return;
            }
            const brief = await sortTranscript(ctx, transcript, body.answers);
            send(res, 200, { ok: true, brief });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            ctx.logger.warn(new Error(`ramble-sorter: ${message}`));
            send(res, 500, { ok: false, error: message });
          }
        },
      }),
    'ramble-sorter: sort route'
  );
}
