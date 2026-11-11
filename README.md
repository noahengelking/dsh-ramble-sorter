# Ramble sorter

**Dictation in. One clean instruction out.**

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) page that
takes a messy voice-to-text ramble and rewrites it into a single, self-contained
instruction a coding agent can execute without guessing.

You dictate on the right, you get a brief on the left of the page — goal,
numbered requirements, hard constraints, reported problems, unverified
hypotheses, parked ideas, and the assumptions the model had to make — then you
copy it into the chat.

## What it does

- **Rewrites, doesn't relabel.** The ramble goes through a model, not a rule
  engine: grammar repaired, filler removed, references resolved, compound asks
  split, duplicates merged, order fixed.
- **Separates intent.** Requests become requirements; "don't touch X" becomes a
  constraint; "I think it's the sort order" becomes a labelled hypothesis;
  "maybe we should also…" becomes a parked idea. Guesses never turn into
  requirements.
- **Keeps you in control of the guesswork.** A review note lists the *large*
  assumptions only (scope, target, ordering, intent) with the phrase each came
  from. **Ask all** opens a dialog where you accept one or type what is actually
  true, and the instruction is re-sorted with your answers.
- **Questions you can answer.** When the ramble genuinely allows two readings,
  the page asks at most three questions with option chips and a free-text field
  instead of guessing.
- **Copy is the instruction.** No questions, no interview text, no meta
  commentary. A clean markdown brief with a goal, requirements, constraints and
  done-when conditions.
- **A tab, not a detour.** Lives in the right Sidebar beside the conversation,
  so dictating and sending don't fight over the same window.

## Dictation

The **Dictate** button records through the same local recognizer as the
microphone in the chat composer (SenseVoice), so audio never leaves the machine.
The button states whether voice is ready; if the voice-input plugin is off or the
model is not prepared, it says so instead of failing silently. Takes are capped
at three minutes.

## Where it runs

- **Right Sidebar tab** — open the Sidebar and pick *Ramble sorter* from its
  guide. The layout is compact for a narrow pane and persists per session.
- **Left-sidebar page** — the same bench as a standalone page, kept as a
  fallback placement.

Both views share one draft.

## How it works

The bundle has two halves:

| File | Runs in | Job |
|:--|:--|:--|
| `client.js` | Browser | Capture, questions, review, copy. Posts the transcript to the local route. |
| `index.js` | Host | `POST /ramble-sorter/sort` — calls the profile's default model and returns a structured brief. |
| `cordis.patch.yml` | Host | Inserts the bundle row. |

The route asks the model for strict JSON:

```json
{
  "goal": "...",
  "requirements": [{ "text": "..." }],
  "constraints": ["..."],
  "bugs": [{ "symptom": "...", "where": "...", "expected": "..." }],
  "hypotheses": [{ "text": "...", "basis": "..." }],
  "parked": ["..."],
  "assumptions": [{ "kind": "scope|target|ordering|intent", "text": "...", "basis": "..." }],
  "questions": [{ "q": "...", "options": ["..."], "blocking": true }],
  "doneWhen": ["..."]
}
```

Follow-up answers (from questions or *Ask all*) are sent as authoritative
clarifications, and the model re-sorts. If the route is unavailable, the page
falls back to the older local rule sorter and says so.

The page never stores or archives anything: the draft lives in memory while the
page is mounted, and audio is never persisted. The transcript is sent to
whichever model provider the profile is configured with — nothing else.

## Requirements

- DeepSeek Harness 0.2.x with a configured model provider.
- A browser with microphone access for dictation (loopback is fine).
- The official **Voice input** plugin enabled for the Dictate button.

## Install

Install the directory as a bundle in the profile you use:

```bash
dsh plugin --profile <profile> add /path/to/dsh-ramble-sorter
```

For the Desktop app, the profile is usually `desktop`; follow the host's
documentation for installing bundles while the app is closed. The bundle then
appears in the right Sidebar guide as *Ramble sorter*.

## Development

Node 22+ is required for the checks only.

```bash
node --check client.js
node --check index.js
node scripts/build.mjs
```

`scripts/build.mjs` validates the manifest, patch, locale files and icon, checks
the client artifact, and runs the fallback sorter against sample transcripts.

## Status

Early. `0.1.0` — the rewrite path, questions, *Ask all* and the right-sidebar
placement work; layout and prompting are still being tuned. Issues and PRs
welcome.

## License

[MIT](LICENSE)
