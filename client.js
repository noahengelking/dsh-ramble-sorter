window.__ModuleLoader__.load({
  id: 'dsh-ramble-sorter',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const PANEL_ID = 'ramble-sorter';
    const NS = 'ramble-sorter';
    const PANEL_ORDER = 12;

    /* ------------------------------------------------------------------ *
     * UI copy (English-only product text for this v1; the generated
     * brief itself is always English spec text).
     * ------------------------------------------------------------------ */
    const EN = {
      'entry.label': 'Ramble sorter',
      'guide.description': 'Dictate a ramble, get one clean brief',
      'page.eyebrow': 'Ramble sorter',
      'page.title': 'Dictation in. One clean brief out.',
      'page.subtitle':
        'Paste a raw voice transcript. It becomes one ambiguity-free brief in a must / must-not spec tone, with only the larger assumptions called out above it.',
      'page.back': 'Back to conversation',
      'mode.label': 'Sorting mode',
      'mode.draft': 'Draft',
      'mode.interview': 'Interview',
      'mode.draftHint': 'Drafts immediately. Use Interview to resolve a contradiction first.',
      'mode.interviewHint': 'Only available once the transcript contradicts itself.',
      'capture.label': 'Raw transcript',
      'capture.placeholder':
        'Paste or dictate the ramble here, for example: “ok so the sidebar, the session list — it keeps jumping to the top whenever a new message comes in, super annoying. I think it’s the sort order, not sure. I want it to stay where it is unless I’m already at the top. oh and maybe pinning? not important. and don’t touch the title generation, that works. actually wait, the jumping is only on mobile I think.”',
      'capture.hint': 'Cmd/Ctrl + Enter sorts. Nothing is uploaded or archived.',
      'capture.words': '{count} words',
      'action.sort': 'Sort into a brief',
      'action.sorting': 'Sorting…',
      'action.dictate': 'Dictate',
      'action.stopDictate': 'Stop and insert',
      'action.dictateHint':
        'Record your voice and insert the transcript above. Uses the same local recognizer as the microphone in the chat box.',
      'dictation.working': 'Transcribing…',
      'dictation.off':
        'Voice input is not available here. Enable Voice input in Plugins → Experimental plugins.',
      'dictation.permission': 'Microphone access was denied.',
      'dictation.unavailable': 'No microphone is available.',
      'dictation.empty': 'No speech was recognized.',
      'dictation.failed': 'Transcription failed:',
      'dictation.listening': 'Listening — speak, then press Stop and insert.',
      'dictation.state.ready': 'Voice ready',
      'dictation.state.off': 'Voice unavailable',
      'action.clear': 'Clear',
      'action.copy': 'Copy brief',
      'action.copied': 'Copied',
      'action.original': 'Show original',
      'action.hideOriginal': 'Hide original',
      'action.diagram': 'Open Archify page',
      'action.diagramHint': 'Needs at least three moving parts (requirements, constraints or bug reports).',
      'action.draftAnyway': 'Draft anyway',
      'action.apply': 'Apply',
      'action.ask': 'Ask it',
      'action.dismiss': 'Dismiss',
      'action.reopen': 'Open interview',
      'action.sortAgain': 'Sort again',
      'action.close': 'Back to conversation',
      'empty.title': 'Nothing sorted yet',
      'empty.body':
        'Paste the transcript above and press Sort. The first pass drafts immediately; the interview appears only when two instructions cannot both be true.',
      'stale.title': 'The transcript changed.',
      'stale.body': 'Sort again to refresh the brief. The old draft is still here until you do.',
      'review.title': 'Assumptions it jumped to',
      'review.notPart': 'Not part of the message',
      'review.sub':
        'Only larger assumptions — scope, target, ordering, intent. Spelling, grammar and filler changes are never listed.',
      'review.basis': 'from',
      'review.asked': 'Asked',
      'assumption.scope': 'Scope',
      'assumption.target': 'Target',
      'assumption.ordering': 'Ordering',
      'assumption.intent': 'Intent',
      'interview.title': 'Two instructions disagree',
      'interview.sub':
        'Answer the short questions below and the draft resolves itself. Every question has option chips and a free-text answer.',
      'interview.progress': '{answered} of {total} answered',
      'interview.reason': 'Why it blocks',
      'interview.other': 'Or type the answer',
      'interview.otherPlaceholder': 'Type the exact resolution…',
      'interview.draftAnywayHint':
        'Draft anyway leaves every unanswered question as a labelled assumption and an explicit open question.',
      'interview.none':
        'No contradiction was found in this transcript, so there is nothing to interview. The draft is already the honest answer.',
      'interview.cap': 'Only the first {max} conflicts are shown; this ramble should probably be split.',
      'interview.answered': 'Answered',
      'bug.symptom': 'Symptom',
      'bug.where': 'Where',
      'bug.trigger': 'Trigger',
      'bug.expected': 'Expected',
      'bug.actual': 'Actual',
      'notice.copyFailed': 'Could not reach the clipboard. Select the brief and copy it by hand.',
      'notice.popupBlocked': 'The diagram page was downloaded instead of opened because the browser blocked a new tab.',
      'notice.copied': 'Brief copied.',
      'foot.privacy': 'Runs entirely in this page. No transcript leaves the browser and nothing is archived.',
      'foot.scope': 'The working draft lives here only while this page is open.',
      'result.title': 'The brief',
      'result.workflow': 'Workflow preview',
      'result.wordsIn': '{count} words in',
      'notice.diagramFailed': 'Could not create the diagram page.',
    };

    /* ------------------------------------------------------------------ *
     * Small text helpers
     * ------------------------------------------------------------------ */
    function capitalize(text) {
      if (!text) return text;
      return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function lowerFirst(text) {
      if (!text) return text;
      if (/^[A-Z]{2,}/.test(text)) return text;
      return text.charAt(0).toLowerCase() + text.slice(1);
    }

    function trimSentence(text) {
      let s = String(text || '').replace(/\s+/g, ' ').trim();
      s = s.replace(/^[,;:.\s]+/, '').replace(/[,;:\s]+$/, '');
      if (!s) return '';
      if (!/[.!?]$/.test(s)) s += '.';
      return capitalize(s);
    }

    function quote(text) {
      const s = String(text || '').trim().replace(/\s+/g, ' ');
      return s.length > 120 ? s.slice(0, 117).trimEnd() + '…' : s;
    }

    function escapeHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    const CONTRACTIONS = [
      [/\bcan't\b/gi, 'cannot'],
      [/\bwon't\b/gi, 'will not'],
      [/\bdon't\b/gi, 'do not'],
      [/\bdoesn't\b/gi, 'does not'],
      [/\bdidn't\b/gi, 'did not'],
      [/\bisn't\b/gi, 'is not'],
      [/\baren't\b/gi, 'are not'],
      [/\bwasn't\b/gi, 'was not'],
      [/\bweren't\b/gi, 'were not'],
      [/\bhaven't\b/gi, 'have not'],
      [/\bhasn't\b/gi, 'has not'],
      [/\bhadn't\b/gi, 'had not'],
      [/\bshouldn't\b/gi, 'should not'],
      [/\bwouldn't\b/gi, 'would not'],
      [/\bcouldn't\b/gi, 'could not'],
      [/\bmustn't\b/gi, 'must not'],
      [/\bit's\b/gi, 'it is'],
      [/\bthat's\b/gi, 'that is'],
      [/\bi'm\b/gi, 'I am'],
      [/\bi've\b/gi, 'I have'],
      [/\bi'd\b/gi, 'I would'],
      [/\blet's\b/gi, 'let us'],
      [/\bwe're\b/gi, 'we are'],
      [/\bwe've\b/gi, 'we have'],
      [/\bthey're\b/gi, 'they are'],
      [/\byou're\b/gi, 'you are'],
    ];

    function expandContractions(text) {
      let s = text;
      for (const [pattern, replacement] of CONTRACTIONS) s = s.replace(pattern, replacement);
      return s;
    }

    const LEAD_FILLER =
      /^(?:(?:ok(?:ay)?|so|um+|uh+|erm?|well|right|yeah|yep|oh|hey|and|also|plus|now|basically|honestly|anyway|actually|wait)\b[,:\s]*)+/i;
    const MID_FILLER = /\b(?:um+|uh+|erm?|you know|i mean|sort of|kind of|honestly|to be honest)\b[,:\s]*/gi;

    function stripFiller(text) {
      let s = text;
      s = s.replace(LEAD_FILLER, '');
      s = s.replace(MID_FILLER, '');
      s = s.replace(/\b(\w+)(?:\s+\1\b)+/gi, '$1');
      s = s.replace(/\s{2,}/g, ' ').trim();
      return s;
    }

    const CONNECTOR_RE =
      /^(oh,?\s+and|and\s+also|and\s+then|actually,?\s+wait|i\s+mean|also|plus|then|but|so(?!\s+that)|because|actually|wait)\b[,:]?\s*/i;
    const DISCOURSE_SPLIT =
      /\s+(?=(?:oh,?\s+and|and\s+also|and\s+then|actually,?\s+wait|i\s+mean|then|but|because|actually|wait)\b)|\s*,\s*and\s+|\s+and\s+(?=(?:do not|never)\b)/i;

    function splitDiscourse(sentence) {
      return sentence.split(DISCOURSE_SPLIT).filter((part) => part.trim().length > 0);
    }

    function makeClause(part, index) {
      let text = part.trim();
      const question = /\?\s*$/.test(text);
      let connector = '';
      const match = text.match(CONNECTOR_RE);
      if (match) {
        connector = match[1].toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();
        text = text.slice(match[0].length);
      }
      text = text.replace(/[.!?]+\s*$/, '').trim();
      return {
        id: 'c' + index,
        raw: part.trim(),
        connector,
        question,
        text,
        lower: text.toLowerCase(),
      };
    }

    function segmentClauses(raw) {
      const list = [];
      const paragraphs = String(raw || '').replace(/\r\n?/g, '\n').split(/\n+/);
      for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        if (!trimmed) continue;
        const sentences = trimmed.match(/[^.!?]+[.!?]*/g) || [trimmed];
        for (const sentence of sentences) {
          if (!sentence.trim()) continue;
          for (const part of splitDiscourse(sentence)) {
            const clause = makeClause(part.trim(), list.length);
            if (clause.text) list.push(clause);
            if (list.length >= 260) return list;
          }
        }
      }
      return list;
    }

    /* ------------------------------------------------------------------ *
     * Noun phrases, content words, and reference resolution
     * ------------------------------------------------------------------ */
    const STOPWORDS = new Set(
      (
        'a an the and or but if then than that this these those it its they them their ' +
        'i me my we us our you your he she his her who whom which what when where why how ' +
        'is are was were be been being am do does did done has have had having will would ' +
        'shall should can could may might must not no nor so as at by for from in into of on ' +
        'onto over to up with within without about after before during while unless until ' +
        'again also just only very really too much many more most some any all each every ' +
        'there here now please okay ok yeah oh hey well right'
      ).split(' ')
    );

    const GENERIC_NOUNS = new Set(
      (
        'thing things stuff way ways time times point points reason reasons rest same other ' +
        'first second third last next whole new old top bottom left right bit lot kind sort ' +
        'issue issues problem problems fix fixes change changes update updates bug bugs ' +
        'request requests feature features task tasks work works case cases part parts ' +
        'instance example side end start middle course matter idea ideas question questions'
      ).split(' ')
    );

    const VERB_CUTS = new Set(
      (
        'is are was were be been being am stay stays stayed keep keeps kept have has had do ' +
        'does did will would should can could may might must need needs needed want wants ' +
        'wanted let lets make makes made get gets got go goes went come comes came seem seems ' +
        'seemed look looks looked feel feels felt become becomes became ' +
        'fail fails failed failing crash crashes crashed jump jumps jumped jumping break breaks broke ' +
        'broken disappear disappears disappeared freeze freezes froze hang hangs hung error errors ' +
        'work works worked happen happens happened occur occurs occurred show shows showed appear ' +
        'appears appeared load loads loaded render renders rendered move moves moved change changes ' +
        'changed add adds added remove removes removed keep keeps'
      ).split(' ')
    );

    const PREPOSITIONS = new Set(
      (
        'about above after before behind below beneath beside between beyond by despite down ' +
        'during except for from in inside into like near of off on onto out outside over past ' +
        'since through throughout till to toward under underneath until up upon with within ' +
        'without via per than then so because although though unless when whenever while if ' +
        'where which who whom whose that'
      ).split(' ')
    );

    const GENERIC_NPS = new Set(['it', 'this', 'that', 'these', 'those']);

    const VERB_HINTS = (
      'is are was were keeps keeps jumping jumps fails fail breaks break works work shows show ' +
      'opens open closes close renders render loads load crashes crash happens happen occurs ' +
      'occur moves move changes change adds add removes remove deletes delete displays display ' +
      'sorts sort scrolls scroll flickers flicker freezes freeze hangs hang gets get goes go ' +
      'comes come makes make has have stays stay needs need wants want should must can could ' +
      'will would uses use resets reset loses lose cuts cut'
    ).split(' ');

    function nounPhraseEntries(text) {
      const found = [];
      const re = /\b(?:the|this|that|these|those|my|our|your|its)\s+([a-z][a-z0-9'-]*(?:\s+[a-z][a-z0-9'-]*){0,3})/gi;
      let match;
      while ((match = re.exec(String(text))) !== null) {
        const words = match[1].split(/\s+/).filter(Boolean);
        let phrase = [];
        for (const word of words) {
          const w = word.toLowerCase();
          if (PREPOSITIONS.has(w) || STOPWORDS.has(w) || VERB_CUTS.has(w)) break;
          phrase.push(word);
        }
        while (phrase.length && GENERIC_NOUNS.has(phrase[phrase.length - 1].toLowerCase())) phrase.pop();
        if (!phrase.length) continue;
        const joined = phrase.join(' ').toLowerCase();
        if (joined.length < 3) continue;
        if (GENERIC_NOUNS.has(joined) || GENERIC_NPS.has(joined)) continue;
        if (phrase.length === 1 && /ing$/.test(joined) && joined.length <= 12) continue;
        const clean = joined.replace(/[’']s$/, '');
        if (!found.some((entry) => entry.phrase === clean)) found.push({ phrase: clean, index: match.index });
      }
      return found;
    }

    function nounPhrases(text) {
      return nounPhraseEntries(text).map((entry) => entry.phrase);
    }

    function subjectPhrase(text) {
      const entries = nounPhraseEntries(text);
      if (!entries.length) return '';
      const lower = String(text).toLowerCase();
      let verbIndex = -1;
      for (const verb of VERB_HINTS) {
        const index = lower.search(new RegExp('\\b' + verb + '\\b'));
        if (index >= 0 && (verbIndex < 0 || index < verbIndex)) verbIndex = index;
      }
      if (verbIndex >= 0) {
        const before = entries.filter((entry) => entry.index < verbIndex);
        if (before.length) return before[before.length - 1].phrase;
      }
      return entries[0].phrase;
    }

    function contentKeys(text) {
      const words = String(text).toLowerCase().match(/[a-z][a-z0-9'-]{2,}/g) || [];
      const out = new Set();
      for (const word of words) {
        const w = word.replace(/[’']s$/, '');
        if (STOPWORDS.has(w) || GENERIC_NOUNS.has(w)) continue;
        if (PREPOSITIONS.has(w) || VERB_CUTS.has(w)) continue;
        out.add(w);
      }
      return out;
    }

    function rawContentKeys(text) {
      const words = String(text).toLowerCase().match(/[a-z][a-z0-9'-]{2,}/g) || [];
      const out = new Set();
      for (const word of words) {
        const w = word.replace(/[’']s$/, '');
        if (STOPWORDS.has(w) || GENERIC_NOUNS.has(w) || PREPOSITIONS.has(w)) continue;
        out.add(w);
      }
      return out;
    }

    function sharedKeys(a, b) {
      const out = [];
      for (const key of a) {
        if (b.has(key) && key.length > 3) out.push(key);
      }
      return out;
    }

    function sharedPhrases(a, b) {
      const out = [];
      for (const phrase of a) {
        if (b.includes(phrase) && phrase.includes(' ') && phrase.length > 4) out.push(phrase);
      }
      return out;
    }

    /* ------------------------------------------------------------------ *
     * Classification
     * ------------------------------------------------------------------ */
    const ASK_VERBS = [
      'make', 'add', 'remove', 'delete', 'drop', 'fix', 'change', 'update', 'move', 'rename',
      'show', 'hide', 'stop', 'start', 'let', 'ensure', 'use', 'build', 'create', 'put', 'set',
      'open', 'close', 'switch', 'support', 'allow', 'prevent', 'replace', 'reduce', 'increase',
      'improve', 'split', 'merge', 'write', 'render', 'display', 'sort', 'filter', 'toggle',
      'limit', 'cap', 'store', 'save', 'load', 'send', 'copy', 'paste', 'bring', 'turn', 'check',
      'verify', 'test', 'run', 'collapse', 'expand', 'scroll', 'pin', 'unpin', 'group', 'order',
      'format', 'align', 'attach', 'include', 'exclude', 'ignore', 'handle', 'treat', 'apply',
      'require', 'expose', 'document', 'keep', 'preserve', 'leave', 'retain', 'maintain',
    ];
    const IMPERATIVE_RE = new RegExp('^(?:please\\s+)?(?:' + ASK_VERBS.join('|') + ')\\b', 'i');
    const ASK_MODAL_RE =
      /\b(?:i|we)\s+(?:want|need|would like)\b|\b(?:i|we)\s+should\b|\b(?:can|could|would)\s+(?:you|we)\s+[a-z]+|\b(?:it|this|that)\s+(?:should|must|needs? to|has to)\b|^the\s+.+?\s+(?:should|must|needs? to|has to)\b/i;
    const HEDGE_RE =
      /\b(?:i think|i guess|i suspect|probably|possibly|might be|could be|may be|not sure|unsure|no idea|my guess)\b/i;
    const PARK_RE =
      /\b(?:someday|not important|not a priority|not now|nice to have|would be nice|eventually|one day|later on|in the future|not needed|do not need|no need|parked|parking)\b/i;
    const MUST_NOT_RE =
      /\b(?:do not|never|must not|should not|cannot|avoid)\b/i;
    const BUG_RE =
      /\b(?:bug|broken|breaks?|broke|crash(?:es|ed)?|fails?|failing|error|wrong|jump(?:s|ing)?|freez(?:e|es|ing)|hang(?:s|ing)?|glitch(?:y)?|flicker(?:s|ing)?|disappears?|disappearing|stuck|re-?sorts?|does not work|not working|misbehav\w*|off by|instead of)\b/i;
    const CONTEXT_RE =
      /\b(?:the reason|background|for context|we tried|we already|just so you know|fyi|for reference|previously)\b/i;
    const QUESTION_START_RE =
      /^(?:wait,?\s*)?(?:what|why|how|when|where|which|who|does|do|is|are|did)\b/i;

    function isCorrectionClause(clause) {
      return (
        /^(?:actually|wait|actually wait|i mean)$/.test(clause.connector) ||
        /^(?:no|nope|scratch that|correction|rather|i mean)\b/i.test(clause.lower)
      );
    }

    function isParkedExplicit(text) {
      return /(?:someday|not important|not a priority|not now|nice to have|would be nice|eventually|one day|later on|in the future|not needed|do not need|no need|parked|parking)/i.test(
        text
      );
    }

    function isHoldConstraint(text) {
      if (/\b(?:leave|preserve|retain|maintain|unchanged|as is|without changing|without touching)\b/i.test(text)) {
        return true;
      }
      const keep = text.match(/\bkeep(?:s|ing)?\b/i);
      if (!keep) return false;
      const after = text.slice(keep.index + keep[0].length);
      return !/^\s+(?:seeing|getting|having|doing|jumping|flickering|crashing|failing|breaking|resetting|losing)\b/i.test(
        after
      );
    }

    function classify(clause) {
      const t = clause.lower;
      if (clause.explicitPark) return 'parked';
      if (/^maybe\b/i.test(t) && /\balso\b|\bsomeday\b/.test(t)) return 'parked';
      if (/^maybe\b/i.test(t) && !ASK_MODAL_RE.test(t) && t.split(/\s+/).length <= 6) return 'parked';
      if (clause.question && QUESTION_START_RE.test(t)) return 'question';
      if (PARK_RE.test(t)) return 'parked';
      if (HEDGE_RE.test(t) && !ASK_MODAL_RE.test(t) && !IMPERATIVE_RE.test(t)) return 'hypothesis';
      if (MUST_NOT_RE.test(t) || isHoldConstraint(t)) return 'constraint';
      if (ASK_MODAL_RE.test(t) || IMPERATIVE_RE.test(t)) return 'ask';
      if (BUG_RE.test(t)) return 'bug';
      if (clause.connector === 'because' || CONTEXT_RE.test(t)) return 'context';
      if (clause.question) return 'question';
      return 'context';
    }

    const ONLY_SCOPE_RE = /\bonly\b[^.!?]*\b(mobile|phone|tablet|desktop|laptop|sidebar)\b|\b(mobile|phone|tablet|desktop|laptop|sidebar)\b[^.!?]*\bonly\b/i;
    const WIDE_SCOPE_RE = /\b(desktop too|also on desktop|all platforms|everywhere|both mobile and desktop|mobile and desktop|desktop and mobile)\b/i;

    function scopeTagsOf(text) {
      const t = String(text).toLowerCase();
      const tags = [];
      const exclusive = ONLY_SCOPE_RE.test(t);
      const wide = WIDE_SCOPE_RE.test(t);
      if (/\bmobile\b|\bphone\b/.test(t)) tags.push('mobile');
      if (/\bdesktop\b|\blaptop\b|\bcomputer\b/.test(t)) tags.push('desktop');
      if (/\btablet\b/.test(t)) tags.push('tablet');
      if (/\bsidebar\b/.test(t)) tags.push('sidebar');
      return { tags, exclusive, wide };
    }

    /* ------------------------------------------------------------------ *
     * Analysis
     * ------------------------------------------------------------------ */
    function makeAssumption(state, kind, text, basis) {
      return { id: 'a' + state.assumptionSeq++, kind, text, basis: quote(basis) };
    }

    function findCorrectionTarget(items, clause) {
      const keys = rawContentKeys(clause.text);
      let target = null;
      let best = 0;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.superseded) continue;
        if (item.role !== 'ask' && item.role !== 'bug' && item.role !== 'constraint') continue;
        const overlap = sharedKeys(keys, rawContentKeys(item.text)).length;
        if (overlap > best) {
          best = overlap;
          target = item;
        }
      }
      if (best > 0) return target;
      if (/^(?:no|nope|scratch that|correction)\b/i.test(clause.lower)) {
        for (let i = items.length - 1; i >= 0; i--) {
          if (!items[i].superseded && items[i].role !== 'context') return items[i];
        }
      }
      return null;
    }

    function analyze(raw) {
      const source = String(raw || '');
      const state = { assumptionSeq: 0 };
      const items = [];
      const assumptions = [];
      const clauses = segmentClauses(source);
      const mergedClauses = [];
      for (const clause of clauses) {
        const bare = clause.text.replace(/[.!?]+$/, '').trim().toLowerCase();
        if (
          /^(?:not important|not a priority|not now|not needed|nice to have|would be nice)$/.test(bare) &&
          mergedClauses.length
        ) {
          mergedClauses[mergedClauses.length - 1].explicitPark = true;
          continue;
        }
        mergedClauses.push(clause);
      }
      let corrections = 0;

      for (const clause of mergedClauses) {
        const cleaned = stripFiller(expandContractions(clause.text));
        if (!cleaned) continue;
        clause.text = cleaned;
        clause.lower = cleaned.toLowerCase();

        if (isCorrectionClause(clause)) {
          const target = findCorrectionTarget(items, clause);
          if (target) {
            const scope = scopeTagsOf(clause.text);
            if (scope.tags.length && (target.role === 'bug' || target.role === 'ask' || target.role === 'constraint')) {
              target.scopeTags = Array.from(new Set([...(target.scopeTags || []), ...scope.tags]));
              target.scopeExclusive = Boolean(target.scopeExclusive || scope.exclusive);
              target.scopeBasis = target.scopeBasis || clause.raw;
              assumptions.push(
                makeAssumption(
                  state,
                  'scope',
                  `assumed “${scope.tags.join(', ')}” is the scope of “${quote(target.text)}”`,
                  clause.raw
                )
              );
              corrections += 1;
              continue;
            }
            if (sharedKeys(rawContentKeys(clause.text), rawContentKeys(target.text)).length > 0) {
              target.superseded = true;
              const role = classify(clause);
              items.push({
                clause,
                role: role === 'context' ? target.role : role,
                text: clause.text,
                index: items.length,
                superseded: false,
                scopeTags: scopeTagsOf(clause.text).tags,
                scopeExclusive: scopeTagsOf(clause.text).exclusive,
                correctionOf: target.clause.id,
              });
              assumptions.push(
                makeAssumption(
                  state,
                  'ordering',
                  `assumed the later correction replaces “${quote(target.text)}”`,
                  clause.raw
                )
              );
              corrections += 1;
              continue;
            }
          }
        }

        const role = classify(clause);
        const clauseScope = scopeTagsOf(clause.text);
        items.push({
          clause,
          role,
          text: clause.text,
          index: items.length,
          superseded: false,
          scopeTags: clauseScope.tags,
          scopeExclusive: clauseScope.exclusive,
          parkedExplicit: role === 'parked' ? Boolean(clause.explicitPark || isParkedExplicit(clause.text)) : true,
        });
      }

      /* Reference resolution in reading order. */
      const resolvedItems = [];
      const unresolved = [];
      const history = [];
      let resolvedRefs = 0;

      for (const item of items) {
        const currentNps = nounPhrases(item.text);
        const pronounMatch = item.text.match(/\b(it|they|them|their)\b/i);
        if (
          pronounMatch &&
          (item.role === 'ask' || item.role === 'bug' || item.role === 'constraint')
        ) {
          let antecedent = '';
          let alternatives = [];
          if (currentNps.length) {
            antecedent = subjectPhrase(item.text) || currentNps[currentNps.length - 1];
          } else if (history.length) {
            const currentKeys = contentKeys(item.text);
            const scored = history
              .slice(-6)
              .map((entry, order) => ({
                entry,
                order,
                score: sharedKeys(currentKeys, entry.keys).length,
              }))
              .sort((a, b) => b.score - a.score || b.order - a.order);
            const best = scored[0];
            if (best && best.entry.phrases.length) {
              antecedent =
                best.entry.subject ||
                best.entry.phrases[best.entry.phrases.length - 1] ||
                '';
              alternatives = Array.from(
                new Set(
                  best.entry.phrases
                    .filter((phrase) => phrase !== antecedent)
                    .concat(
                      scored
                        .slice(1)
                        .filter(
                          (candidate) =>
                            candidate.score === best.score &&
                            candidate.entry.item.index !== best.entry.item.index &&
                            candidate.entry.phrases.length
                        )
                        .map((candidate) => candidate.entry.subject || candidate.entry.phrases[0])
                    )
                )
              ).filter((phrase) => phrase && phrase !== antecedent);
            }
          }
          if (antecedent) {
            const article = /^(?:the|a|an|this|that|my|our|your|its)\b/i.test(antecedent) ? '' : 'the ';
            const phrase = article + antecedent;
            let replaced = 0;
            item.text = item.text.replace(/\b(it|they|them|their)\b/gi, (match) => {
              if (replaced++ === 0) return phrase;
              return match;
            });
            item.resolvedFrom = pronounMatch[1].toLowerCase();
            item.resolvedTo = phrase;
            resolvedRefs += 1;
            if (alternatives.length) {
              assumptions.push(
                makeAssumption(
                  state,
                  'target',
                  `read “${pronounMatch[1].toLowerCase()}” as “${phrase}” (also possible: “${alternatives[0]}”)`,
                  item.clause.raw
                )
              );
            }
          } else {
            unresolved.push({ pronoun: pronounMatch[1].toLowerCase(), item });
          }
        }
        if (item.role === 'ask' || item.role === 'bug' || item.role === 'constraint') {
          history.push({
            item,
            phrases: nounPhrases(item.text),
            subject: subjectPhrase(item.text),
            keys: contentKeys(item.text),
          });
        }
        resolvedItems.push(item);
      }

      const requirements = [];
      const constraints = [];
      const bugs = [];
      const parked = [];
      const hypotheses = [];
      const questions = [];
      const background = [];
      const openQuestions = [];
      let requirementSeq = 0;
      let constraintSeq = 0;
      let bugSeq = 0;
      let parkedSeq = 0;
      let hypothesisSeq = 0;

      for (const item of resolvedItems) {
        const text = item.text.trim();
        if (!text) continue;
        if (item.role === 'ask') {
          for (const part of splitCompoundAsks(text)) {
            const built = requirementFromAsk(part);
            if (!built) continue;
            requirements.push({
              id: 'r' + ++requirementSeq,
              clauseId: item.clause.id,
              text: trimSentence(built.text),
              polarity: built.polarity,
              source: item.clause.raw,
              objects: nounPhrases(part).concat(nounPhrases(item.text)),
            });
          }
        } else if (item.role === 'constraint') {
          const built = constraintFromText(text);
          if (!built) continue;
          constraints.push({
            id: 'k' + ++constraintSeq,
            clauseId: item.clause.id,
            text: trimSentence(built.text),
            kind: built.kind,
            polarity: 'negative',
            source: item.clause.raw,
            objects: nounPhrases(text),
            scopeTags: item.scopeTags || [],
          });
        } else if (item.role === 'bug') {
          const bugScope = scopeTagsOf(item.text);
          bugs.push({
            id: 'b' + ++bugSeq,
            clauseId: item.clause.id,
            text,
            source: item.clause.raw,
            scopeTags: item.scopeTags || bugScope.tags,
            scopeExclusive: Boolean(item.scopeExclusive || bugScope.exclusive),
            scopeWide: bugScope.wide,
            objects: nounPhrases(text),
            resolvedTo: item.resolvedTo || '',
          });
        } else if (item.role === 'parked') {
          const body = parkedBody(text);
          if (!body) continue;
          parked.push({
            id: 'p' + ++parkedSeq,
            clauseId: item.clause.id,
            text: body,
            source: item.clause.raw,
            explicit: item.parkedExplicit !== false,
          });
        } else if (item.role === 'hypothesis') {
          const body = hypothesisBody(text);
          if (!body) continue;
          hypotheses.push({
            id: 'h' + ++hypothesisSeq,
            clauseId: item.clause.id,
            text: trimSentence(body),
            source: item.clause.raw,
          });
        } else if (item.role === 'question') {
          questions.push(trimSentence(text.replace(/[?]+$/, '') + '?'));
        } else {
          if (isNoise(text)) continue;
          background.push(trimSentence(text));
        }
      }

      /* An inferred (not explicitly marked) parked idea is a large intent assumption. */
      for (const idea of parked) {
        if (!idea.explicit) {
          assumptions.push(
            makeAssumption(state, 'intent', `assumed “${quote(idea.text)}” is a parked idea, not a request`, idea.source)
          );
        }
      }

      for (const ref of unresolved) {
        openQuestions.push(
          `What does “${ref.pronoun}” refer to in “${quote(ref.item.clause.raw)}”?`
        );
      }

      /* A comparative with no number is a real gap, not something to guess. */
      const VAGUE_TARGET_RE =
        /\b(faster|quicker|slower|better|cleaner|nicer|simpler|smaller|lighter|smoother|more responsive|less cluttered|more intuitive|more efficient)\b/i;
      const vagueSeen = new Set();
      for (const entry of requirements.concat(constraints)) {
        const match = entry.text.match(VAGUE_TARGET_RE);
        if (!match || /\d/.test(entry.text)) continue;
        const target = match[1].toLowerCase();
        if (vagueSeen.has(target)) continue;
        vagueSeen.add(target);
        openQuestions.push(
          `No measurable target was given for “${target}”; state a number before implementation.`
        );
      }

      /* Focused bug records. */
      for (const bug of bugs) {
        const details = bugDetails(bug, requirements);
        bug.title = details.title;
        bug.symptom = details.symptom;
        bug.where = details.where;
        bug.trigger = details.trigger;
        bug.expected = details.expected;
        bug.actual = details.actual;
        if (!details.expected) {
          openQuestions.push(`What should happen instead of: “${quote(details.symptom)}”?`);
        }
      }

      const metrics = {
        words: source.trim() ? source.trim().split(/\s+/).length : 0,
        clauses: clauses.length,
        requirements: requirements.length,
        constraints: constraints.length,
        bugs: bugs.length,
        parked: parked.length,
        hypotheses: hypotheses.length,
        corrections,
        resolvedRefs,
        fillerRemoved: clauses.some((clause) => clause.raw.trim().length !== clause.text.length),
      };

      const analysisObj = {
        raw: source.trim(),
        requirements,
        constraints,
        bugs,
        parked,
        hypotheses,
        questions,
        background,
        openQuestions,
        assumptions,
        metrics,
        contradictions: [],
        cappedContradictions: 0,
      };

      analysisObj.contradictions = detectContradictions(analysisObj);
      analysisObj.cappedContradictions = analysisObj.contradictions.capped || 0;

      return analysisObj;
    }

    /* ------------------------------------------------------------------ *
     * Record builders
     * ------------------------------------------------------------------ */
    const ASK_SPLIT_RE = new RegExp(
      '(?:,\\s*and\\s+|\\s+and\\s+|;\\s*)(?=(?:also\\s+)?(?:' + ASK_VERBS.join('|') + ')\\b)',
      'i'
    );

    function splitCompoundAsks(text) {
      const parts = text.split(ASK_SPLIT_RE).map((part) => part.trim()).filter(Boolean);
      return parts.length ? parts : [text];
    }

    function requirementFromAsk(text) {
      let s = text.trim().replace(/^(?:so\s+that\s+)/i, '');
      s = s.replace(/^(?:please\s+)?(?:can|could|would)\s+(?:you|we)\s+/i, '');
      s = s.replace(/^(?:please\s+)/i, '');

      let match = s.match(/^(?:i|we)\s+(?:want|need|would like)\s+(.+?)\s+to\s+(.+)$/i);
      if (match) return declarative(match[1], match[2]);

      match = s.match(/^(?:i|we)\s+(?:do not|do not want|never want)\s+(.+)$/i);
      if (match) {
        const negative = negativeObject(match[1]);
        if (negative) return negative;
      }

      match = s.match(/^(?:i|we)\s+(?:do not|never)\s+(?:want|need)\s+(.+)$/i);
      if (match) {
        const negative = negativeObject(match[1]);
        if (negative) return negative;
      }

      match = s.match(/^(?:i|we)\s+(?:want|need|would like)\s+(.+)$/i);
      if (match) {
        const object = match[1].trim();
        if (!/^(?:to|it|this|that)\b/i.test(object)) {
          return { text: `The implementation must add ${lowerFirst(object)}.`, polarity: 'positive' };
        }
      }

      match = s.match(/^(.+?)\s+(?:should|must|needs? to|has to|need to|have to)\s+(.+)$/i);
      if (match) return declarative(match[1], match[2]);

      match = s.match(/^(?:it|this|that)\s+(?:should|must|needs? to|has to)\s+(.+)$/i);
      if (match) return { text: `The implementation must ${lowerFirst(match[1])}.`, polarity: 'positive' };

      s = s.replace(/^(?:let us|let's)\s+/i, '');
      s = s.replace(/^(?:i|we)\s+should\s+/i, '');
      return { text: `The implementation must ${lowerFirst(s)}.`, polarity: 'positive' };
    }

    function declarative(subject, predicate) {
      let subj = subject.trim();
      let pred = predicate.trim();
      let negative = false;
      if (/^not\s+/i.test(pred)) {
        negative = true;
        pred = pred.replace(/^not\s+/i, '');
      }
      subj = subj.replace(/^(?:that|this|those|these)\s+/i, (m) => (/(?:those|these)/i.test(m) ? 'the ' : 'the '));
      if (!subj || !pred) return null;
      return {
        text: `${subj} must ${negative ? 'not ' : ''}${lowerFirst(pred)}.`,
        polarity: negative ? 'negative' : 'positive',
      };
    }

    function negativeObject(object) {
      const participle = object.match(
        /^(.+?)\s+(changed|touched|modified|removed|added|moved|renamed|deleted|rewritten)$/i
      );
      if (participle) {
        const base = {
          changed: 'change',
          touched: 'change',
          modified: 'change',
          removed: 'remove',
          added: 'add',
          moved: 'move',
          renamed: 'rename',
          deleted: 'delete',
          rewritten: 'rewrite',
        }[participle[2].toLowerCase()];
        return {
          text: `The implementation must not ${base} ${lowerFirst(participle[1])}.`,
          polarity: 'negative',
        };
      }
      const objectText = object.trim();
      if (!objectText) return null;
      return { text: `The implementation must not add ${lowerFirst(objectText)}.`, polarity: 'negative' };
    }

    function constraintFromText(text) {
      let s = text.trim();
      s = s.replace(/,\s*(?:that|it|this)\s+(?:works?|is fine|is good|is okay)\b.*$/i, '');
      s = s.replace(/^(?:please\s+)?/i, '');

      let match = s.match(/^(?:i|we)\s+(?:do not|never)\s+want\s+(?:you|us)\s+to\s+(.+)$/i);
      if (match) return { text: `The implementation must not ${lowerFirst(match[1])}.`, kind: 'mustnot' };
      match = s.match(/^(?:i|we)\s+(?:do not|never)\s+want\s+to\s+(.+)$/i);
      if (match) return { text: `The implementation must not ${lowerFirst(match[1])}.`, kind: 'mustnot' };
      match = s.match(/^(?:i|we)\s+(?:do not|never)\s+want\s+(.+)$/i);
      if (match) {
        const negative = negativeObject(match[1]);
        if (negative) return { text: negative.text, kind: 'mustnot' };
      }

      const mustNot = /^(?:do not|never|must not|should not|cannot|avoid)\s+/i.test(s);
      s = s.replace(/^(?:do not|never|must not|should not|cannot|avoid)\s+/i, '');
      s = s.replace(/^(?:touch|touching)\s+/i, 'change ');
      s = s.replace(/^not\s+/i, '');
      if (!s) return null;
      if (mustNot || /\b(?:do not|never|must not|should not|cannot|avoid)\b/i.test(text)) {
        return { text: `The implementation must not ${lowerFirst(s)}.`, kind: 'mustnot' };
      }
      return { text: `The implementation must ${lowerFirst(s)}.`, kind: 'hold' };
    }

    function parkedBody(text) {
      let s = text.replace(/[?]+$/, '').trim();
      s = s.replace(/^(?:maybe|perhaps|possibly)\s+/i, '');
      s = s.replace(/^(?:we|i)\s+(?:could|might|may|should)\s+(?:also\s+)?/i, '');
      s = s.replace(/^(?:oh\s+and\s+|and\s+|also\s+)/i, '');
      s = s.replace(/\b(?:someday|eventually|one day|in the future|later on)\b/gi, '');
      s = s.replace(/\b(?:not important|not a priority|not now|not needed|nice to have|would be nice)\b/gi, '');
      s = s.replace(/[,\s;]+$/g, '').trim();
      s = s.replace(/^[,;:\s]+/, '');
      if (!s) return '';
      return lowerFirst(s);
    }

    function hypothesisBody(text) {
      let s = text.trim();
      s = s.replace(
        /^(?:i think|i guess|i suspect|my guess is|probably|possibly|maybe|not sure,?)\s*/i,
        ''
      );
      s = s.replace(/^(?:it is|it is|that is|this is|the (?:cause|problem|issue|reason) is)\s+/i, '');
      s = s.replace(/,?\s*(?:not sure|i think|i guess|maybe)\s*$/i, '');
      s = s.replace(/[.]+$/, '').trim();
      if (!s) return '';
      if (/^(?:why|how|what|when|where|who|which)$/i.test(s)) return '';
      return lowerFirst(s);
    }

    function isNoise(text) {
      return /^(?:(?:super|really|very)\s+)?(?:annoying|frustrating|weird|strange|fine|okay|ok|cool|great|nice|huh|right)$/i.test(
        text.trim()
      );
    }

    function bugDetails(bug, requirements) {
      let symptom = bug.text
        .replace(/\s*[,;]?\s*(?:super|really|very)\s+(?:annoying|frustrating|weird|strange)\b.*$/i, '')
        .trim();
      if (bug.resolvedTo) {
        const first = symptom.indexOf(bug.resolvedTo);
        const second = first >= 0 ? symptom.indexOf(bug.resolvedTo, first + bug.resolvedTo.length) : -1;
        if (first >= 0 && second > first) {
          const before = symptom.slice(0, first).replace(/[,\s]+$/, '');
          const after = symptom.slice(first + bug.resolvedTo.length).replace(/^\s*[,]+\s*/, ' ');
          symptom = `${before} ${after}`.replace(/\s{2,}/g, ' ').trim();
        }
      }
      symptom = symptom.replace(/\s+/g, ' ');
      const dashIndex = symptom.indexOf('—');
      if (dashIndex > 0) {
        const preface = symptom.slice(0, dashIndex).trim();
        const prefaceWords = preface.split(/\s+/).filter(Boolean);
        if (prefaceWords.length <= 4 && !/\b(?:is|are|was|were|keeps?|jumps?|fails?|breaks?)\b/i.test(preface)) {
          symptom = symptom.slice(dashIndex + 1).trim();
        }
      }
      symptom = capitalize(symptom);
      const triggerMatch = symptom.match(/\b(?:when(?:ever)?|after|before|while)\s+(.+)$/i);
      const trigger = triggerMatch ? capitalize(triggerMatch[1].replace(/[.]+$/, '').trim()) : '';
      let titleSource = symptom.split(/\s+(?:when|whenever|if|after|before|while)\b/i)[0].trim();
      if (titleSource.includes('—')) titleSource = titleSource.split('—').pop().trim();
      const titleWords = titleSource.split(/\s+/).filter(Boolean).slice(0, 12);
      while (
        titleWords.length &&
        /^(?:the|a|an|to|of|for|in|on|at|and|or|with|from|by|as|that|this)$/i.test(titleWords[titleWords.length - 1])
      ) {
        titleWords.pop();
      }
      const title = capitalize(titleWords.join(' ').replace(/[,;:]$/, ''));
      const whereFromText = nounPhrases(bug.text).filter((phrase) => phrase !== 'session');
      const scope = (bug.scopeTags || []).map((tag) =>
        bug.scopeExclusive && (tag === 'mobile' || tag === 'desktop') ? `${tag} only` : tag
      );
      const where = Array.from(new Set([...whereFromText.slice(0, 3), ...scope])).join(', ');

      let expected = '';
      const bugKeys = contentKeys(symptom);
      for (const requirement of requirements) {
        if (requirement.polarity !== 'positive') continue;
        const phraseMatch = sharedPhrases(bug.objects || [], requirement.objects || []);
        const keyMatch = sharedKeys(bugKeys, contentKeys(requirement.text));
        if (phraseMatch.length === 0 && keyMatch.length < 2) continue;
        expected = requirement.text;
        break;
      }

      return {
        title: title || 'Reported problem',
        symptom,
        where,
        trigger,
        expected,
        actual: symptom,
      };
    }

    /* ------------------------------------------------------------------ *
     * Contradictions
     * ------------------------------------------------------------------ */
    const NUMBER_WORDS = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    };

    function numbersWithNouns(text) {
      const out = [];
      const re = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+([a-z][a-z-]*(?:\s+[a-z][a-z-]*)?)/gi;
      let match;
      while ((match = re.exec(text)) !== null) {
        const value = /^\d+$/.test(match[1]) ? Number(match[1]) : NUMBER_WORDS[match[1].toLowerCase()];
        const noun = match[2].toLowerCase().replace(/\s+(?:in|on|at|for|to|from|with|and|or)$/, '');
        const lead = (text.slice(0, match.index).trim().split(/\s+/).pop() || '').toLowerCase();
        if (noun && noun.length > 3 && !STOPWORDS.has(noun)) out.push({ value, noun, lead });
      }
      return out;
    }

    function conflictOptionLabels(entries, kind) {
      if (kind === 'keep-change') {
        return [
          { value: 'keep', label: `Keep it as is — “${quote(entries.constraint.source)}”` },
          { value: 'change', label: `Apply the change — “${quote(entries.requirement.source)}”` },
          { value: 'both', label: 'Keep it, except for the specific change requested' },
        ];
      }
      return [
        { value: 'remove', label: `Remove it — “${quote(entries.requirement.source)}”` },
        { value: 'keep', label: `Keep it — “${quote(entries.constraint.source)}”` },
      ];
    }

    function detectContradictions(analysis) {
      const found = [];
      let seq = 0;
      let overflow = 0;
      const register = (entry) => {
        if (found.length >= 5) {
          overflow += 1;
          return;
        }
        found.push({ id: 'x' + ++seq, ...entry });
      };

      for (const constraint of analysis.constraints) {
        const cPhrases = nounPhrases(constraint.source);
        const cKeys = contentKeys(constraint.source);
        for (const requirement of analysis.requirements) {
          if (requirement.polarity !== 'positive') continue;
          const rPhrases = nounPhrases(requirement.source);
          const rKeys = contentKeys(requirement.source);
          const phrases = sharedPhrases(cPhrases, rPhrases);
          const keys = sharedKeys(cKeys, rKeys);
          const changing = /\b(?:remove|delete|drop|replace|rename|move|change|rewrite|update|add)\b/i.test(
            requirement.text
          );
          const incompatible =
            constraint.kind === 'mustnot' ? phrases.length > 0 || keys.length >= 2 : phrases.length > 0 && changing;
          if (!incompatible) continue;
          const object = phrases[0] || keys[0] || 'the same part';
          register({
            kind: 'keep-change',
            object,
            requirementIds: [requirement.id],
            constraintIds: [constraint.id],
            question: `Two instructions disagree about “${object}”. Which one should the brief carry?`,
            reason: `“${quote(constraint.source)}” contradicts “${quote(requirement.source)}”.`,
            options: conflictOptionLabels({ constraint, requirement }, 'keep-change'),
          });
        }
      }

      for (const bug of analysis.bugs) {
        const exclusive = bug.scopeExclusive || scopeTagsOf(bug.source).exclusive;
        if (!exclusive) continue;
        for (const other of analysis.questions) {
          if (!WIDE_SCOPE_RE.test(other)) continue;
          register({
            kind: 'scope',
            object: 'the reported problem',
            question: 'One statement narrows where the problem happens; another widens it. Which scope applies?',
            reason: `“${quote(bug.source)}” conflicts with “${quote(other)}”.`,
            options: [
              { value: 'mobile', label: 'Mobile only' },
              { value: 'desktop', label: 'Desktop too' },
              { value: 'each', label: 'Both, stated separately' },
            ],
          });
        }
      }

      const wideClauses = analysis.requirements
        .filter((requirement) => WIDE_SCOPE_RE.test(requirement.source))
        .concat(
          analysis.bugs.filter((bug) => bug.scopeWide || WIDE_SCOPE_RE.test(bug.source))
        );
      const narrowClauses = analysis.bugs.filter((bug) => {
        const scope = scopeTagsOf(bug.source);
        return (bug.scopeExclusive || scope.exclusive) && !scope.wide;
      });
      for (const narrow of narrowClauses) {
        for (const wide of wideClauses) {
          if (narrow.id === wide.id) continue;
          register({
            kind: 'scope',
            object: 'the reported problem',
            question: 'One statement says “only here”; another says it also happens elsewhere. Which scope applies?',
            reason: `“${quote(narrow.source)}” conflicts with “${quote(wide.source)}”.`,
            options: [
              { value: 'mobile', label: 'Mobile only' },
              { value: 'desktop', label: 'Desktop too' },
              { value: 'each', label: 'Both, stated separately' },
            ],
          });
        }
      }

      const allNumbers = [];
      for (const requirement of analysis.requirements) {
        for (const entry of numbersWithNouns(requirement.source)) allNumbers.push({ ...entry, source: requirement.source });
      }
      for (let i = 0; i < allNumbers.length; i++) {
        for (let j = i + 1; j < allNumbers.length; j++) {
          const a = allNumbers[i];
          const b = allNumbers[j];
          if (a.noun !== b.noun || a.lead !== b.lead || a.value === b.value) continue;
          register({
            kind: 'numbers',
            object: a.noun,
            question: `Two numbers were given for “${a.noun}”. Which one is correct?`,
            reason: `“${quote(a.source)}” conflicts with “${quote(b.source)}”.`,
            options: Array.from(new Set([a.value, b.value])).map((value) => ({
              value: String(value),
              label: `Use ${value}`,
            })),
          });
        }
      }

      found.capped = overflow;
      return found;
    }

    /* ------------------------------------------------------------------ *
     * Brief construction
     * ------------------------------------------------------------------ */
    const BRIEF_TITLES = {
      goal: 'Goal',
      requirements: 'Requirements',
      constraints: 'Constraints',
      bugs: 'Bug reports',
      parked: 'Not now (non-goals)',
      hypotheses: 'Hypotheses (unverified)',
      background: 'Background',
      decisions: 'Decisions from the interview',
      questions: 'Open questions',
    };

    function assumptionKindForConflict(kind) {
      if (kind === 'scope') return 'scope';
      return 'intent';
    }

    function buildBrief(analysis, answerMap, options) {
      const opts = options || {};
      const answers = answerMap || {};
      const drop = new Set();
      const decisions = [];
      const openExtra = [];
      const assumptions = analysis.assumptions.slice();
      const softened = new Set();
      let scopeOverride = '';

      for (const conflict of analysis.contradictions) {
        let answer = answers[conflict.id];
        if (!answer) {
          if (!opts.assumeUnanswered) continue;
          const first = conflict.options[0];
          const label = (first ? first.label : 'the first option').replace(/\.(?=\s*[”"']?\s*$)/, '');
          answer = { value: first ? first.value : 'custom', text: '' };
          assumptions.push({
            id: 'a-open-' + conflict.id,
            kind: assumptionKindForConflict(conflict.kind),
            text: `assumed ${label.toLowerCase()} for the open conflict about “${conflict.object}”`,
            basis: conflict.reason,
          });
          openExtra.push(`Unresolved: ${conflict.question} The draft assumes ${label.toLowerCase()}.`);
        }
        const value = answer.value;

        if (value === 'custom') {
          conflict.requirementIds.concat(conflict.constraintIds).forEach((id) => drop.add(id));
          if (answer.text && answer.text.trim()) decisions.push(trimSentence(answer.text));
          continue;
        }

        if (conflict.kind === 'keep-change') {
          if (value === 'keep') {
            conflict.requirementIds.forEach((id) => drop.add(id));
            decisions.push(`Keep ${conflict.object} unchanged.`);
          } else if (value === 'change') {
            conflict.constraintIds.forEach((id) => drop.add(id));
            decisions.push(`Apply the requested change to ${conflict.object}.`);
          } else if (value === 'both') {
            conflict.constraintIds.forEach((id) => softened.add(id));
            decisions.push(`Keep ${conflict.object} as is, except for the specific change recorded under Decisions.`);
          }
        } else if (conflict.kind === 'remove-keep') {
          if (value === 'remove') {
            conflict.constraintIds.forEach((id) => drop.add(id));
            decisions.push(`Remove ${conflict.object}.`);
          } else if (value === 'keep') {
            conflict.requirementIds.forEach((id) => drop.add(id));
            decisions.push(`Keep ${conflict.object}.`);
          }
        } else if (conflict.kind === 'scope') {
          scopeOverride = value;
          const option = conflict.options.find((entry) => entry.value === value);
          decisions.push(`Scope: ${option ? option.label.toLowerCase() : value}.`);
        } else if (conflict.kind === 'numbers') {
          decisions.push(`Use ${value} for ${conflict.object}.`);
        }
        if (answer.text && answer.text.trim()) decisions.push(trimSentence(answer.text));
      }

      const requirements = analysis.requirements.filter((entry) => !drop.has(entry.id)).map((entry) => ({ ...entry }));
      const constraints = analysis.constraints
        .filter((entry) => !drop.has(entry.id))
        .map((entry) => {
          const copy = { ...entry };
          if (softened.has(entry.id)) {
            copy.text = `${copy.text.replace(/[.]+$/, '')} except for the specific change recorded under Decisions.`;
          }
          return copy;
        });
      const bugs = analysis.bugs.filter((entry) => !drop.has(entry.id)).map((entry) => ({ ...entry }));

      /* Answering a conflict can change the expected behaviour shown for a bug. */
      for (const bug of bugs) {
        if (!bug.expected) continue;
        const stillThere = requirements.some((requirement) => requirement.text === bug.expected);
        if (!stillThere) {
          bug.expected = '';
          openExtra.push(`What should happen instead of: “${quote(bug.symptom)}”?`);
        }
      }

      const scopeSuffix = scopeOverride
        ? scopeOverride === 'each'
          ? 'both, stated separately'
          : scopeOverride === 'desktop'
            ? 'desktop too'
            : scopeOverride
        : '';
      if (scopeSuffix) {
        for (const bug of bugs) {
          bug.where = Array.from(new Set([bug.where, scopeSuffix].filter(Boolean))).join(', ');
        }
      }

      const questions = analysis.openQuestions
        .concat(analysis.questions)
        .concat(openExtra)
        .concat(opts.extraQuestions || []);
      const uniqueQuestions = Array.from(new Set(questions.map((entry) => entry.trim()))).filter(Boolean);

      if (requirements.length || bugs.length) {
        uniqueQuestions.push('No acceptance criteria were stated; state the done condition before implementation.');
      }

      const hypotheses = analysis.hypotheses.slice();
      const parked = analysis.parked.slice();
      const background = analysis.background.slice();

      let goal = '';
      const firstRequirement = requirements.find((entry) => entry.polarity === 'positive') || requirements[0];
      const bugExplainsRequirement =
        bugs.length > 0 &&
        firstRequirement &&
        bugs.some((bug) => bug.expected && bug.expected === firstRequirement.text);
      if (bugExplainsRequirement) {
        goal = `Fix: ${bugs[0].symptom.replace(/[.]+$/, '')}.`;
      } else if (firstRequirement) {
        goal = firstRequirement.text;
      } else if (bugs.length) {
        goal = `Fix the reported problem: ${bugs[0].title}.`;
      } else if (decisions.length) {
        goal = decisions[0];
      } else if (parked.length) {
        goal = 'Decide whether to pursue the parked idea; it is not part of this request.';
      } else if (uniqueQuestions.length) {
        goal = 'Answer the open questions below; no concrete request was made.';
      } else if (constraints.length) {
        goal = 'Respect the constraints below; no positive goal was stated.';
      } else {
        goal = 'No request was stated; this is background context only.';
      }

      const blocks = [];
      blocks.push({ id: 'goal', kind: 'goal', title: BRIEF_TITLES.goal, text: goal });
      if (requirements.length) {
        blocks.push({
          id: 'requirements',
          kind: 'list',
          ordered: true,
          title: BRIEF_TITLES.requirements,
          items: requirements.map((entry) => entry.text),
        });
      }
      if (constraints.length) {
        blocks.push({
          id: 'constraints',
          kind: 'list',
          title: BRIEF_TITLES.constraints,
          items: constraints.map((entry) => entry.text),
        });
      }
      if (bugs.length) {
        blocks.push({ id: 'bugs', kind: 'bugs', title: BRIEF_TITLES.bugs, items: bugs });
      }
      if (parked.length) {
        blocks.push({
          id: 'parked',
          kind: 'list',
          title: BRIEF_TITLES.parked,
          items: Array.from(new Set(parked.map((entry) => entry.text))).map((text) => `Do not build: ${text}.`),
        });
      }
      if (hypotheses.length) {
        blocks.push({
          id: 'hypotheses',
          kind: 'list',
          title: BRIEF_TITLES.hypotheses,
          items: Array.from(new Set(hypotheses.map((entry) => entry.text))).map(
            (text) => `Suspected cause: ${lowerFirst(text)} (unverified; stated as a guess in the original)`
          ),
        });
      }
      if (background.length) {
        blocks.push({
          id: 'background',
          kind: 'list',
          title: BRIEF_TITLES.background,
          items: Array.from(new Set(background)),
        });
      }
      if (decisions.length) {
        blocks.push({ id: 'decisions', kind: 'list', title: BRIEF_TITLES.decisions, items: decisions });
      }
      if (uniqueQuestions.length) {
        blocks.push({ id: 'questions', kind: 'list', ordered: true, title: BRIEF_TITLES.questions, items: uniqueQuestions });
      }

      const brief = {
        goal,
        requirements,
        constraints,
        bugs,
        parked,
        hypotheses,
        background,
        questions: uniqueQuestions,
        decisions,
        assumptions,
        blocks,
        splitSuggested: analysis.cappedContradictions > 0,
      };
      brief.flow = buildFlow(brief);
      brief.markdown = blocksToMarkdown(blocks);
      return brief;
    }

    function boldModal(text) {
      return String(text).replace(/\b(must not|must)\b/gi, '**$1**');
    }

    function blocksToMarkdown(blocks) {
      return blocks
        .map((block) => {
          if (block.kind === 'goal') return `## ${block.title}\n${boldModal(block.text)}`;
          if (block.kind === 'bugs') {
            const body = block.items
              .map((bug) => {
                const lines = [`### ${bug.title}`, `- **${'Symptom'}:** ${bug.symptom}`];
                if (bug.where) lines.push(`- **Where:** ${bug.where}`);
                if (bug.trigger) lines.push(`- **Trigger:** ${bug.trigger}`);
                lines.push(`- **Expected:** ${bug.expected || 'not stated'}`);
                lines.push(`- **Actual:** ${bug.actual}`);
                return lines.join('\n');
              })
              .join('\n\n');
            return `## ${block.title}\n\n${body}`;
          }
          if (block.kind === 'list' && block.id === 'hypotheses') {
            return `## ${block.title}\n${block.items.map((item) => `- ${item}`).join('\n')}`;
          }
          const items = block.items
            .map((item, index) => (block.ordered ? `${index + 1}. ${boldModal(item)}` : `- ${boldModal(item)}`))
            .join('\n');
          return `## ${block.title}\n${items}`;
        })
        .join('\n\n');
    }

    function copyText(brief) {
      let text = brief.markdown;
      if (brief.assumptions.length) {
        const lines = brief.assumptions.map(
          (assumption) =>
            `- **${capitalize(assumption.kind)}** — ${assumption.text} (basis: “${assumption.basis}”)`
        );
        text +=
          '\n\n---\nAssumptions made while sorting (not instructions):\n' + lines.join('\n');
      }
      return text;
    }

    /* ------------------------------------------------------------------ *
     * Workflow diagram page
     * ------------------------------------------------------------------ */
    function buildFlow(brief) {
      const stages = [{ kind: 'goal', label: 'Goal', title: brief.goal }];
      brief.requirements.slice(0, 5).forEach((requirement, index) => {
        stages.push({ kind: 'step', label: `Requirement ${index + 1}`, title: requirement.text });
      });
      if (brief.requirements.length > 5) {
        stages.push({
          kind: 'more',
          label: `+${brief.requirements.length - 5} more`,
          title: 'The remaining requirements are in the brief.',
        });
      }
      if (brief.constraints.length) {
        stages.push({
          kind: 'gate',
          label: 'Constraints',
          title: 'Every step must pass these',
          items: brief.constraints.map((constraint) => constraint.text),
        });
      }
      for (const bug of brief.bugs.slice(0, 2)) {
        stages.push({
          kind: 'bug',
          label: 'Bug report',
          title: bug.title,
          items: [bug.symptom].concat(bug.expected ? [`Expected: ${bug.expected}`] : []),
        });
      }
      if (brief.hypotheses.length) {
        stages.push({
          kind: 'hypothesis',
          label: 'Unverified lead',
          title: brief.hypotheses[0].text,
        });
      }
      if (brief.questions.length) {
        stages.push({
          kind: 'open',
          label: 'Open questions',
          title: brief.questions[0],
          items: brief.questions.slice(1, 3),
        });
      }
      stages.push({
        kind: 'end',
        label: 'Done',
        title: 'All requirements hold and no constraint is broken.',
      });
      const movingParts =
        brief.requirements.length + brief.constraints.length + brief.bugs.length + brief.hypotheses.length;
      return { stages, enabled: movingParts >= 3 };
    }

    function flowNodeMarkup(stage) {
      const items = stage.items && stage.items.length
        ? '<ul>' + stage.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('') + '</ul>'
        : '';
      return `<li class="node ${escapeHtml(stage.kind)}">
        <span class="kind">${escapeHtml(stage.label)}</span>
        <p class="title">${escapeHtml(stage.title)}</p>
        ${items}
      </li>`;
    }

    function buildFlowDocument(brief) {
      const stages = brief.flow && brief.flow.stages ? brief.flow.stages : buildFlow(brief).stages;
      const title = 'Workflow — ' + (brief.goal || 'Sorted brief');
      const nodeList = stages.map(flowNodeMarkup).join('\n');
      return `<!doctype html>
<html lang="en" data-theme="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<title>${escapeHtml(title)}</title>
<style>
:root { --bg:#0b0d13; --panel:#12161f; --panel2:#181d28; --line:#262d3c; --text:#eef2fb; --muted:#9aa6bf; --accent:#7aa2ff; --ok:#6ee7b7; --warn:#fbbf24; --bad:#f87171; --radius:14px; }
:root[data-theme="light"] { --bg:#f5f7fc; --panel:#ffffff; --panel2:#eef2fa; --line:#dbe2f0; --text:#141a26; --muted:#59647b; --accent:#2c46b8; --ok:#0f8f63; --warn:#a16207; --bad:#b42318; }
@media (prefers-color-scheme: light) { :root[data-theme="auto"] { --bg:#f5f7fc; --panel:#ffffff; --panel2:#eef2fa; --line:#dbe2f0; --text:#141a26; --muted:#59647b; --accent:#2c46b8; --ok:#0f8f63; --warn:#a16207; --bad:#b42318; } }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--text); font:15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
.wrap { max-width: 840px; margin:0 auto; padding:40px 24px 64px; }
header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:26px; }
.eyebrow { font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); font-weight:700; }
h1 { font-size:22px; line-height:1.3; margin:6px 0 6px; letter-spacing:-.01em; }
.lede { margin:0; color:var(--muted); max-width:60ch; }
button { font:inherit; color:var(--text); background:var(--panel2); border:1px solid var(--line); border-radius:9px; padding:7px 12px; cursor:pointer; }
button:hover { border-color:var(--accent); }
button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
.flow { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0; }
.node { position:relative; background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); padding:14px 16px; margin-left:26px; opacity:0; transform:translateY(6px); animation:rise .45s ease forwards; }
.node:nth-child(2n) { animation-delay:.05s; }
.node:nth-child(3n) { animation-delay:.1s; }
.node + .node { margin-top:34px; }
.node + .node::before { content:""; position:absolute; left:-26px; top:-34px; width:2px; height:34px; background:var(--line); }
.node::after { content:""; position:absolute; left:-33px; top:50%; width:12px; height:12px; border-radius:50%; background:var(--bg); border:2px solid var(--accent); transform:translateY(-50%); }
.kind { display:inline-block; font-size:10px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; color:var(--muted); margin-bottom:5px; }
.title { margin:0; font-weight:600; }
.node ul { margin:8px 0 0; padding-left:18px; color:var(--muted); }
.node li { margin:2px 0; }
.node.goal { border-color:var(--accent); }
.node.goal .kind { color:var(--accent); }
.node.gate { border-color:var(--warn); background:linear-gradient(180deg, color-mix(in srgb, var(--warn) 8%, var(--panel)), var(--panel)); }
.node.gate .kind { color:var(--warn); }
.node.bug { border-color:var(--bad); }
.node.bug .kind { color:var(--bad); }
.node.hypothesis { border-style:dashed; border-color:var(--warn); }
.node.hypothesis .kind { color:var(--warn); }
.node.open { border-color:var(--warn); border-style:dashed; }
.node.open .kind { color:var(--warn); }
.node.end { border-color:var(--ok); }
.node.end .kind { color:var(--ok); }
.legend { display:flex; gap:14px; flex-wrap:wrap; margin-top:30px; color:var(--muted); font-size:12px; }
.legend span { display:inline-flex; align-items:center; gap:6px; }
.dot { width:9px; height:9px; border-radius:50%; display:inline-block; }
footer { margin-top:36px; padding-top:18px; border-top:1px solid var(--line); color:var(--muted); font-size:12px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; }
@keyframes rise { to { opacity:1; transform:none; } }
@media (prefers-reduced-motion: reduce) { .node { opacity:1; transform:none; animation:none; } }
@media print { body { background:#fff; color:#000; } button { display:none; } .node { break-inside:avoid; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div>
      <div class="eyebrow">Archify page · Ramble sorter</div>
      <h1>Workflow</h1>
      <p class="lede">${escapeHtml(brief.goal)}</p>
    </div>
    <button type="button" id="theme">Toggle theme</button>
  </header>
  <ol class="flow">
${nodeList}
  </ol>
  <div class="legend">
    <span><i class="dot" style="background:var(--accent)"></i>Goal</span>
    <span><i class="dot" style="background:var(--warn)"></i>Gate / open</span>
    <span><i class="dot" style="background:var(--bad)"></i>Bug</span>
    <span><i class="dot" style="background:var(--ok)"></i>Done</span>
  </div>
  <footer>
    <span>Standalone page generated by Ramble sorter. It is not saved or archived.</span>
    <span>Nothing in it leaves this browser.</span>
  </footer>
</div>
<script>
(function () {
  var root = document.documentElement;
  var button = document.getElementById('theme');
  button.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark';
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark || (!root.getAttribute('data-theme') && prefersDark) ? 'light' : 'dark');
  });
})();
</script>
</body>
</html>`;
    }

    /* ------------------------------------------------------------------ *
     * React UI
     * ------------------------------------------------------------------ */
    const PAGE_CSS = `
.rs-page {
  position: relative;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  padding: calc(var(--dsh-frame-top-clearance, 48px) + 10px) 24px 56px;
  background: var(--dsw-alias-bg-base, #ffffff);
  color: var(--dsw-alias-label-primary, #16181d);
  font-family: var(--dsh-font-family-text, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif);
  font-size: var(--dsh-content-font-size, 14px);
  -webkit-font-smoothing: antialiased;
}
.rs-shell { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
.rs-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.rs-eyebrow { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary, #7a8497); font-weight: 700; }
.rs-title { margin: 6px 0 6px; font-size: 24px; line-height: 1.2; letter-spacing: -.015em; }
.rs-sub { margin: 0; color: var(--dsw-alias-label-secondary, #4d5668); max-width: 62ch; line-height: 1.55; }
.rs-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rs-modes { display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; border: 1px solid var(--dsw-alias-border-l1, rgba(120,130,150,.24)); background: var(--dsw-alias-bg-layer-2, rgba(120,130,150,.1)); }
.rs-mode { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary, #4d5668); font: inherit; font-size: 12px; font-weight: 650; padding: 5px 11px; border-radius: 7px; cursor: pointer; }
.rs-mode[aria-pressed="true"] { background: var(--dsw-alias-bg-layer-1, #ffffff); color: var(--dsw-alias-label-primary, #16181d); box-shadow: 0 1px 2px rgba(10,16,30,.14); }
.rs-mode:disabled { opacity: .45; cursor: not-allowed; }
.rs-mode:focus-visible, .rs-btn:focus-visible, .rs-option:focus-visible, .rs-input:focus-visible, .rs-textarea:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #4d6bfe); outline-offset: 2px; }
.rs-btn { appearance: none; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--dsw-alias-border-l2, rgba(120,130,150,.34)); border-radius: 9px; background: var(--dsw-alias-bg-layer-1, #ffffff); color: var(--dsw-alias-label-primary, #16181d); font: inherit; font-size: 13px; font-weight: 550; padding: 7px 12px; cursor: pointer; white-space: nowrap; }
.rs-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(120,130,150,.1)); }
.rs-btn.primary { background: var(--dsw-alias-button-primary-fill, #4d6bfe); border-color: transparent; color: var(--dsw-alias-label-primary-foreground, #ffffff); }
.rs-btn.primary:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover, #3a58ef); }
.rs-btn.ghost { background: transparent; }
.rs-btn.small { padding: 4px 9px; font-size: 12px; }
.rs-btn:disabled { opacity: .45; cursor: not-allowed; }
.rs-capture { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid var(--dsw-alias-border-l2, rgba(120,130,150,.34)); border-radius: 14px; background: var(--dsw-alias-bg-layer-1, #ffffff); }
.rs-textarea { width: 100%; min-height: 190px; resize: vertical; box-sizing: border-box; padding: 14px; border: 1px solid var(--dsw-alias-border-l1, rgba(120,130,150,.24)); border-radius: 10px; background: var(--dsw-alias-bg-base, #ffffff); color: inherit; font: inherit; line-height: 1.55; }
.rs-textarea::placeholder { color: var(--dsw-alias-label-tertiary, #7a8497); }
.rs-capture-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.rs-capture-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rs-btn.rs-mic-live { border-color: rgba(201,54,54,.55); color: #c93636; }
.rs-btn.rs-mic-live::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: rs-pulse 1.1s ease-in-out infinite; }
@keyframes rs-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
.rs-page[data-compact="true"] { padding: 14px 12px 28px; }
.rs-page[data-compact="true"] .rs-shell { max-width: none; gap: 12px; }
.rs-page[data-compact="true"] .rs-title { font-size: 18px; margin: 2px 0 0; }
.rs-page[data-compact="true"] .rs-sub { display: none; }
.rs-page[data-compact="true"] .rs-textarea { min-height: 150px; }
.rs-hint { color: var(--dsw-alias-label-tertiary, #7a8497); font-size: 12px; }
.rs-count { font-variant-numeric: tabular-nums; }
.rs-notice { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--dsw-alias-state-warn-secondary, rgba(180,130,20,.4)); border-radius: 9px; background: var(--dsw-alias-bg-layer-1, #ffffff); color: var(--dsw-alias-state-warn-label, #7a5200); font-size: 12px; }
.rs-notice .rs-btn { margin-left: auto; }
.rs-note { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border: 1px solid var(--dsw-alias-state-warn-secondary, rgba(180,130,20,.4)); border-left: 3px solid var(--dsw-alias-state-warn-primary, #d99a00); border-radius: 12px; background: var(--dsw-alias-bg-layer-1, #ffffff); }
.rs-note-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rs-note-title { margin: 0; font-size: 13px; font-weight: 700; }
.rs-note-sub { margin: 0; color: var(--dsw-alias-label-secondary, #4d5668); font-size: 12px; }
.rs-note-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.rs-note-item { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; font-size: 13px; line-height: 1.5; }
.rs-note-text { font-weight: 550; }
.rs-note-basis { color: var(--dsw-alias-label-tertiary, #7a8497); font-size: 12px; }
.rs-note-actions { margin-left: auto; display: inline-flex; gap: 6px; }
.rs-chip { display: inline-flex; align-items: center; padding: 2px 7px; border: 1px solid var(--dsw-alias-border-l1, rgba(120,130,150,.24)); border-radius: 999px; background: var(--dsw-alias-bg-layer-2, rgba(120,130,150,.1)); color: var(--dsw-alias-label-secondary, #4d5668); font-size: 10px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; white-space: nowrap; }
.rs-chip.scope { color: var(--dsw-alias-state-business-primary, #2c46b8); }
.rs-chip.target { color: var(--dsw-alias-state-success-primary, #0f8f63); }
.rs-chip.ordering { color: var(--dsw-alias-state-warn-label, #7a5200); }
.rs-chip.intent { color: var(--dsw-alias-state-error-primary, #b42318); }
.rs-result-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rs-result-title { display: flex; flex-direction: column; gap: 2px; margin-right: auto; }
.rs-message { display: flex; flex-direction: column; padding: 18px 20px; border: 1px solid var(--dsw-alias-border-l1, rgba(120,130,150,.24)); border-radius: 14px; background: var(--dsw-alias-bg-layer-1, #ffffff); }
.rs-block + .rs-block { margin-top: 18px; }
.rs-block h2 { margin: 0 0 8px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary, #7a8497); font-weight: 700; }
.rs-block p { margin: 0; line-height: 1.6; }
.rs-goal { font-size: 15px; }
.rs-list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
.rs-list li { line-height: 1.55; }
.rs-list li strong, .rs-goal strong { font-weight: 750; }
.rs-bug { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--dsw-alias-border-l1, rgba(120,130,150,.24)); }
.rs-bug:first-of-type { margin-top: 0; padding-top: 0; border-top: 0; }
.rs-bug h3 { margin: 0 0 6px; font-size: 13px; }
.rs-dl { display: grid; grid-template-columns: 92px 1fr; gap: 4px 10px; margin: 0; }
.rs-dl dt { color: var(--dsw-alias-label-tertiary, #7a8497); font-size: 12px; font-weight: 650; }
.rs-dl dd { margin: 0; line-height: 1.5; }
.rs-flow { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.rs-flow-chip { padding: 3px 8px; border: 1px solid var(--dsw-alias-border-l1, rgba(120,130,150,.24)); border-radius: 6px; background: var(--dsw-alias-bg-layer-2, rgba(120,130,150,.1)); color: var(--dsw-alias-label-secondary, #4d5668); font-size: 11px; }
.rs-flow-arrow { color: var(--dsw-alias-label-tertiary, #7a8497); font-size: 11px; }
.rs-original { padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1, rgba(120,130,150,.24)); border-radius: 10px; background: var(--dsw-alias-bg-layer-2, rgba(120,130,150,.1)); }
.rs-original pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-family: var(--dsh-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-secondary, #4d5668); }
.rs-interview { display: flex; flex-direction: column; gap: 12px; }
.rs-interview-head { display: flex; flex-direction: column; gap: 4px; }
.rs-interview-head h2 { margin: 0; font-size: 17px; }
.rs-progress { color: var(--dsw-alias-label-tertiary, #7a8497); font-size: 12px; font-variant-numeric: tabular-nums; }
.rs-q { display: flex; flex-direction: column; gap: 8px; padding: 14px; border: 1px solid var(--dsw-alias-border-l2, rgba(120,130,150,.34)); border-radius: 12px; background: var(--dsw-alias-bg-layer-1, #ffffff); }
.rs-q-head { display: flex; align-items: baseline; gap: 8px; }
.rs-q-index { color: var(--dsw-alias-label-tertiary, #7a8497); font-size: 11px; font-weight: 700; font-variant-numeric: tabular-nums; }
.rs-q h3 { margin: 0; font-size: 14px; line-height: 1.45; }
.rs-reason { margin: 0; color: var(--dsw-alias-label-secondary, #4d5668); font-size: 12px; }
.rs-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.rs-option { appearance: none; border: 1px solid var(--dsw-alias-border-l2, rgba(120,130,150,.34)); border-radius: 999px; background: var(--dsw-alias-bg-base, #ffffff); color: var(--dsw-alias-label-primary, #16181d); font: inherit; font-size: 12px; padding: 6px 12px; cursor: pointer; text-align: left; }
.rs-options { display: flex; flex-wrap: wrap; gap: 6px; }
.rs-answer { display: flex; gap: 6px; }
.rs-note-askall { margin-left: auto; }
.rs-backdrop { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(10,16,30,.45); }
.rs-modal { width: min(600px, 100%); max-height: 82vh; overflow: auto; display: flex; flex-direction: column; gap: 14px; padding: 18px; border-radius: 14px; background: var(--dsw-alias-bg-base, #ffffff); color: var(--dsw-alias-label-primary, #16181d); box-shadow: 0 18px 60px rgba(0,0,0,.28); }
.rs-modal-head h2 { margin: 0 0 4px; font-size: 16px; }
.rs-modal-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.rs-modal-item { display: flex; flex-direction: column; gap: 6px; padding: 10px; border: 1px solid var(--dsw-alias-border-l1, rgba(120,130,150,.24)); border-radius: 10px; }
.rs-modal-q { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.rs-modal-basis { font-size: 12px; color: var(--dsw-alias-label-tertiary, #7a8497); }
.rs-modal-answer { display: flex; align-items: center; gap: 6px; }
.rs-modal-foot { display: flex; justify-content: flex-end; gap: 8px; }
.rs-option:hover { border-color: var(--dsw-alias-brand-primary, #4d6bfe); }
.rs-option[aria-pressed="true"] { border-color: var(--dsw-alias-brand-primary, #4d6bfe); background: var(--dsw-alias-interactive-bg-hover-accent, rgba(77,107,254,.12)); }
.rs-free { display: flex; gap: 8px; align-items: center; }
.rs-input { flex: 1 1 auto; min-width: 0; padding: 7px 10px; border: 1px solid var(--dsw-alias-border-l1, rgba(120,130,150,.24)); border-radius: 8px; background: var(--dsw-alias-bg-base, #ffffff); color: inherit; font: inherit; font-size: 13px; }
.rs-answered { margin: 0; color: var(--dsw-alias-state-success-primary, #0f8f63); font-size: 12px; }
.rs-empty { padding: 32px 24px; border: 1px dashed var(--dsw-alias-border-l2, rgba(120,130,150,.34)); border-radius: 14px; text-align: center; }
.rs-empty h2 { margin: 0 0 6px; font-size: 16px; }
.rs-empty p { margin: 0 auto; max-width: 56ch; color: var(--dsw-alias-label-secondary, #4d5668); line-height: 1.55; }
.rs-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; color: var(--dsw-alias-label-tertiary, #7a8497); font-size: 12px; }
.rs-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@media (max-width: 720px) {
  .rs-page { padding-left: 16px; padding-right: 16px; }
  .rs-dl { grid-template-columns: 76px 1fr; }
  .rs-note-actions { margin-left: 0; }
}
`;

    function createBench() {
      let state = {
        transcript: '',
        analysis: null,
        answers: {},
        result: null,
        mode: 'draft',
        asked: [],
        dismissed: [],
        notice: '',
      };
      const listeners = new Set();
      return {
        get() {
          return state;
        },
        set(patch) {
          state = Object.assign({}, state, patch);
          for (const listener of Array.from(listeners)) listener(state);
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
    }

    function useBench(bench) {
      const [snapshot, setSnapshot] = React.useState(() => bench.get());
      React.useEffect(() => bench.subscribe(setSnapshot), [bench]);
      return snapshot;
    }

    function allAnswered(analysis, answers) {
      if (!analysis) return false;
      return analysis.contradictions.every((conflict) => answers[conflict.id] !== undefined);
    }

    function extraQuestionsFrom(asked) {
      return asked.map(
        (assumption) => `Is this correct: ${assumption.text}? (basis: “${assumption.basis}”)`
      );
    }

    function resultFor(analysis, answers, asked, assumeUnanswered) {
      return buildBrief(analysis, answers, {
        assumeUnanswered,
        extraQuestions: extraQuestionsFrom(asked),
      });
    }

    function StrongMust({ text }) {
      const parts = String(text).split(/\b(must not|must)\b/gi);
      return h(
        'span',
        null,
        parts.map((part, index) =>
          /^must(?: not)?$/i.test(part) ? h('strong', { key: index }, part) : part
        )
      );
    }

    function BugList({ items }) {
      return h(
        'div',
        null,
        items.map((bug) =>
          h(
            'article',
            { key: bug.id, className: 'rs-bug' },
            h('h3', null, bug.title),
            h(
              'dl',
              { className: 'rs-dl' },
              [
                ['Symptom', bug.symptom],
                ...(bug.where ? [['Where', bug.where]] : []),
                ...(bug.trigger ? [['Trigger', bug.trigger]] : []),
                ['Expected', bug.expected || 'not stated'],
                ['Actual', bug.actual],
              ].map(([label, value], index) =>
                h(
                  React.Fragment,
                  { key: index },
                  h('dt', null, label),
                  h('dd', null, value)
                )
              )
            )
          )
        )
      );
    }

    function renderBlock(block) {
      if (block.kind === 'goal') {
        return h(
          'section',
          { key: block.id, className: 'rs-block' },
          h('h2', null, block.title),
          h('p', { className: 'rs-goal' }, h(StrongMust, { text: block.text }))
        );
      }
      if (block.kind === 'bugs') {
        return h(
          'section',
          { key: block.id, className: 'rs-block' },
          h('h2', null, block.title),
          h(BugList, { items: block.items })
        );
      }
      const ListTag = block.ordered ? 'ol' : 'ul';
      return h(
        'section',
        { key: block.id, className: 'rs-block' },
        h('h2', null, block.title),
        h(
          ListTag,
          { className: 'rs-list' },
          block.items.map((item, index) =>
            h(
              'li',
              { key: index },
              block.id === 'requirements' || block.id === 'constraints'
                ? h(StrongMust, { text: item })
                : item
            )
          )
        )
      );
    }

    function Interview({ analysis, answers, onAnswer, t }) {
      const answered = analysis.contradictions.filter((conflict) => answers[conflict.id]).length;
      return h(
        'section',
        { className: 'rs-interview', 'aria-label': t('interview.title') },
        h(
          'div',
          { className: 'rs-interview-head' },
          h('h2', null, t('interview.title')),
          h('p', { className: 'rs-sub' }, t('interview.sub')),
          h(
            'span',
            { className: 'rs-progress' },
            t('interview.progress', {
              answered,
              total: analysis.contradictions.length,
            })
          ),
          analysis.cappedContradictions > 0
            ? h('p', { className: 'rs-notice' }, t('interview.cap', { max: 5 }))
            : null
        ),
        analysis.contradictions.map((conflict, index) =>
          h(QuestionCard, {
            key: conflict.id,
            conflict,
            index,
            total: analysis.contradictions.length,
            answer: answers[conflict.id],
            onAnswer,
            t,
          })
        )
      );
    }

    function QuestionCard({ conflict, index, total, answer, onAnswer, t }) {
      const [free, setFree] = React.useState('');
      const submitFree = () => {
        const value = free.trim();
        if (!value) return;
        onAnswer(conflict.id, 'custom', value);
        setFree('');
      };
      const chosen = answer
        ? answer.text || (conflict.options.find((option) => option.value === answer.value) || {}).label || answer.value
        : '';
      return h(
        'div',
        { className: 'rs-q' },
        h(
          'div',
          { className: 'rs-q-head' },
          h('span', { className: 'rs-q-index' }, `${index + 1}/${total}`),
          h('h3', null, conflict.question)
        ),
        h('p', { className: 'rs-reason' }, `${t('interview.reason')}: ${conflict.reason}`),
        h(
          'div',
          { className: 'rs-chips' },
          conflict.options.map((option) =>
            h(
              'button',
              {
                key: option.value,
                type: 'button',
                className: 'rs-option',
                'aria-pressed': answer && answer.value === option.value ? 'true' : 'false',
                onClick: () => onAnswer(conflict.id, option.value, ''),
              },
              option.label
            )
          )
        ),
        h(
          'div',
          { className: 'rs-free' },
          h('input', {
            type: 'text',
            className: 'rs-input',
            value: free,
            'aria-label': t('interview.other'),
            placeholder: t('interview.otherPlaceholder'),
            onChange: (event) => setFree(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitFree();
              }
            },
          }),
          h(
            'button',
            {
              type: 'button',
              className: 'rs-btn small',
              disabled: !free.trim(),
              onClick: submitFree,
            },
            t('action.apply')
          )
        ),
        answer ? h('p', { className: 'rs-answered' }, `${t('interview.answered')} · ${chosen}`) : null
      );
    }

    function PanelIcon(props) {
      const size = props && props.size ? props.size : 16;
      const width = props && props.active ? 2.3 : 2;
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', {
          d: 'M4 6h10M4 12h7M4 18h4',
          stroke: 'currentColor',
          strokeWidth: width,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M15 15.6l2 2 4-4.6',
          stroke: 'currentColor',
          strokeWidth: width,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        })
      );
    }

    const DICTATION_MAX_SECONDS = 180;

    function base64FromBytes(bytes) {
      let text = '';
      for (let i = 0; i < bytes.length; i += 8192) {
        text += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
      }
      return btoa(text);
    }

    function encodeWave(samples) {
      const bytes = new Uint8Array(44 + samples.length * 2);
      const view = new DataView(bytes.buffer);
      const text = (at, value) => {
        for (let i = 0; i < value.length; i++) bytes[at + i] = value.charCodeAt(i);
      };
      text(0, 'RIFF');
      view.setUint32(4, bytes.length - 8, true);
      text(8, 'WAVE');
      text(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, 16000, true);
      view.setUint32(28, 32000, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      text(36, 'data');
      view.setUint32(40, samples.length * 2, true);
      for (const [i, sample] of samples.entries()) {
        const value = Math.max(-1, Math.min(1, sample));
        view.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
      }
      return bytes;
    }

    function composeMarkdown(brief) {
      const parts = [`## Goal\n${brief.goal || 'No clear request was found.'}`];
      if (brief.requirements.length) {
        parts.push(
          '## Requirements\n' +
            brief.requirements
              .map((entry, index) => `${index + 1}. ${entry.text}`)
              .join('\n')
        );
      }
      if (brief.constraints.length) {
        parts.push('## Must hold\n' + brief.constraints.map((entry) => `- ${entry}`).join('\n'));
      }
      if (brief.bugs.length) {
        parts.push(
          '## Reported problems\n' +
            brief.bugs
              .map(
                (bug) =>
                  `- ${bug.symptom}${bug.where ? ` (${bug.where})` : ''}${bug.expected ? ` — expected: ${bug.expected}` : ''}`
              )
              .join('\n')
        );
      }
      if (brief.hypotheses.length) {
        parts.push(
          '## Hypotheses (unverified)\n' +
            brief.hypotheses
              .map(
                (hypothesis) =>
                  `- ${hypothesis.text}${hypothesis.basis ? ` — from “${hypothesis.basis}”` : ''}`
              )
              .join('\n')
        );
      }
      if (brief.parked.length) {
        parts.push('## Not now\n' + brief.parked.map((entry) => `- ${entry}`).join('\n'));
      }
      if (brief.doneWhen.length) {
        parts.push('## Done when\n' + brief.doneWhen.map((entry) => `- ${entry}`).join('\n'));
      }
      return parts.join('\n\n');
    }

    function briefToResult(brief) {
      const blocks = [
        {
          id: 'goal',
          kind: 'goal',
          title: 'Goal',
          text: brief.goal || 'No clear request was found.',
        },
      ];
      if (brief.requirements.length) {
        blocks.push({
          id: 'requirements',
          kind: 'list',
          ordered: true,
          title: 'Requirements',
          items: brief.requirements.map((entry) => entry.text),
        });
      }
      if (brief.constraints.length) {
        blocks.push({ id: 'constraints', kind: 'list', title: 'Must hold', items: brief.constraints });
      }
      if (brief.bugs.length) {
        blocks.push({
          id: 'bugs',
          kind: 'bugs',
          title: 'Reported problems',
          items: brief.bugs.map((bug, index) => ({
            id: `bug-${index}`,
            title: bug.symptom || 'Problem',
            symptom: bug.symptom || '',
            where: bug.where || '',
            expected: bug.expected || '',
          })),
        });
      }
      if (brief.hypotheses.length) {
        blocks.push({
          id: 'hypotheses',
          kind: 'list',
          title: 'Hypotheses (unverified)',
          items: brief.hypotheses.map((hypothesis) => hypothesis.text),
        });
      }
      if (brief.parked.length) {
        blocks.push({ id: 'parked', kind: 'list', title: 'Not now', items: brief.parked });
      }
      if (brief.doneWhen.length) {
        blocks.push({ id: 'done', kind: 'list', title: 'Done when', items: brief.doneWhen });
      }
      const stages = [{ label: 'Goal', title: brief.goal }];
      brief.requirements.slice(0, 5).forEach((entry, index) => {
        stages.push({ label: `Requirement ${index + 1}`, title: entry.text });
      });
      if (brief.constraints.length) {
        stages.push({ label: 'Constraints', title: 'Every step must pass these' });
      }
      brief.bugs.slice(0, 2).forEach((bug) => {
        stages.push({ label: 'Bug report', title: bug.symptom });
      });
      return {
        goal: brief.goal,
        requirements: brief.requirements,
        constraints: brief.constraints,
        bugs: brief.bugs,
        hypotheses: brief.hypotheses,
        parked: brief.parked,
        assumptions: brief.assumptions.map((entry, index) => ({
          id: `model-${index}`,
          kind: entry.kind || 'scope',
          text: entry.text,
          basis: entry.basis || '',
        })),
        questions: brief.questions,
        blocks,
        flow: { enabled: stages.length >= 3, stages },
        markdown: composeMarkdown(brief),
      };
    }

    function ModelQuestions({ questions, answers, onChange, onApply, busy }) {
      const answered = questions.filter(
        (question) => String(answers[question.q] || '').trim() !== ''
      ).length;
      return h(
        'section',
        { className: 'rs-interview', 'aria-label': 'Questions' },
        h(
          'div',
          { className: 'rs-interview-head' },
          h('h2', null, 'Answer these and re-sort'),
          h(
            'p',
            { className: 'rs-sub' },
            'The instruction above is already usable. An answer replaces the guess with your decision, and it never appears in the copy.'
          ),
          h('span', { className: 'rs-progress' }, `${answered}/${questions.length}`)
        ),
        questions.map((question, index) =>
          h(
            'div',
            { key: `q-${index}`, className: 'rs-q' },
            h('p', { className: 'rs-note-text' }, question.q),
            question.options.length
              ? h(
                  'div',
                  { className: 'rs-options' },
                  question.options.map((option) =>
                    h(
                      'button',
                      {
                        key: option,
                        type: 'button',
                        className: 'rs-option',
                        'aria-pressed':
                          String(answers[question.q] || '') === option ? 'true' : 'false',
                        onClick: () => onChange(question.q, option),
                      },
                      option
                    )
                  )
                )
              : null,
            h(
              'div',
              { className: 'rs-answer' },
              h('input', {
                className: 'rs-input',
                value: answers[question.q] || '',
                placeholder: 'Or type the answer',
                onChange: (event) => onChange(question.q, event.target.value),
              })
            )
          )
        ),
        h(
          'div',
          { className: 'rs-note-actions' },
          h(
            'button',
            {
              type: 'button',
              className: 'rs-btn primary small',
              disabled: busy || answered === 0,
              onClick: onApply,
            },
            busy ? 'Sorting…' : 'Apply answers'
          )
        )
      );
    }

    const CORRECT_ANSWER = 'Yes, correct as stated.';

    function AskAllDialog({ assumptions, drafts, onChange, onCancel, onApply, busy, tr }) {
      return h(
        'div',
        {
          className: 'rs-backdrop',
          role: 'presentation',
          onClick: (event) => {
            if (event.target === event.currentTarget) onCancel();
          },
          onKeyDown: (event) => {
            if (event.key === 'Escape') onCancel();
          },
        },
        h(
          'div',
          {
            className: 'rs-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': 'Check the assumptions',
          },
          h(
            'div',
            { className: 'rs-modal-head' },
            h('h2', null, 'Check the assumptions'),
            h(
              'p',
              { className: 'rs-sub' },
              'Accept one, or type what is actually true. Answers go into the next sort only — never into the copy.'
            )
          ),
          h(
            'ul',
            { className: 'rs-modal-list' },
            assumptions.map((assumption, index) =>
              h(
                'li',
                { key: assumption.id, className: 'rs-modal-item' },
                h(
                  'div',
                  { className: 'rs-modal-q' },
                  h(
                    'span',
                    { className: `rs-chip ${assumption.kind}` },
                    tr('assumption.' + assumption.kind)
                  ),
                  h('span', { className: 'rs-note-text' }, assumption.text)
                ),
                h('div', { className: 'rs-modal-basis' }, `from “${assumption.basis}”`),
                h(
                  'div',
                  { className: 'rs-modal-answer' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'rs-option',
                      'aria-pressed':
                        String(drafts[assumption.id] || '') === CORRECT_ANSWER ? 'true' : 'false',
                      onClick: () => onChange(assumption.id, CORRECT_ANSWER),
                    },
                    'Correct'
                  ),
                  h('input', {
                    className: 'rs-input',
                    value:
                      drafts[assumption.id] === CORRECT_ANSWER ? '' : drafts[assumption.id] || '',
                    placeholder: 'Or type what is right',
                    autoFocus: index === 0,
                    onChange: (event) => onChange(assumption.id, event.target.value),
                  })
                )
              )
            )
          ),
          h(
            'div',
            { className: 'rs-modal-foot' },
            h('button', { type: 'button', className: 'rs-btn ghost', onClick: onCancel }, 'Cancel'),
            h(
              'button',
              { type: 'button', className: 'rs-btn primary', disabled: busy, onClick: onApply },
              busy ? tr('action.sorting') : 'Apply and re-sort'
            )
          )
        )
      );
    }

    function BenchPage(props) {
      const bench = props.bench;
      const closePanel = props.closePanel;
      const remote = props.remote;
      const getSpeech = props.speech || (() => (remote && remote.speech) || undefined);
      const t = props.t;
      const state = useBench(bench);
      const [originalOpen, setOriginalOpen] = React.useState(false);
      const [copied, setCopied] = React.useState(false);
      const copiedTimer = React.useRef(0);
      const noticeTimer = React.useRef(0);

      React.useEffect(
        () => () => {
          if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
          if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
        },
        []
      );

      const tr = (key, params) => {
        let value = typeof t === 'function' ? t(key) : '';
        if (!value || value === key) value = EN[key] || key;
        if (params) {
          value = value.replace(/\{(\w+)\}/g, (match, name) =>
            name in params ? String(params[name]) : match
          );
        }
        return value;
      };

      const flashNotice = (text) => {
        bench.set({ notice: text });
        if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => bench.set({ notice: '' }), 4200);
      };

      const flashCopied = () => {
        setCopied(true);
        if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
        copiedTimer.current = window.setTimeout(() => setCopied(false), 1900);
      };

      const transcript = state.transcript;
      const analysis = state.analysis;
      const result = state.result;
      const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
      const dirty = Boolean(analysis && analysis.raw !== transcript.trim());
      const speechReady = (() => {
        try {
          return Boolean(getSpeech());
        } catch (error) {
          return false;
        }
      })();
      const visibleAssumptions = result
        ? result.assumptions.filter((assumption) => !state.dismissed.includes(assumption.id))
        : [];
      const openAskAll = () => {
        setAskDrafts({});
        setAskOpen(true);
      };

      const applyAskAll = () => {
        const answers = Object.assign({}, state.answers);
        for (const assumption of visibleAssumptions) {
          const value = String(askDrafts[assumption.id] || '').trim();
          if (!value) continue;
          answers[`Is this correct: ${assumption.text}?`] = value;
        }
        setAskOpen(false);
        bench.set({ answers });
        void sort({ answers });
      };

      const setTranscript = (value) =>
        bench.set({ transcript: value, notice: '', answers: {} });

      const [dictation, setDictation] = React.useState('idle');
      const [busy, setBusy] = React.useState(false);
      const [askOpen, setAskOpen] = React.useState(false);
      const [askDrafts, setAskDrafts] = React.useState({});
      const dictationRef = React.useRef(null);

      React.useEffect(
        () => () => {
          const active = dictationRef.current;
          if (!active) return;
          dictationRef.current = null;
          window.clearTimeout(active.timer);
          try {
            if (active.recorder.state === 'recording') active.recorder.stop();
          } catch (error) {
            /* already stopped */
          }
          active.stream.getTracks().forEach((track) => track.stop());
          try {
            void active.context.close();
          } catch (error) {
            /* already closed */
          }
        },
        []
      );

      const startDictation = async () => {
        if (dictationRef.current) return;
        let speech;
        try {
          speech = getSpeech();
        } catch (error) {
          speech = undefined;
        }
        if (!speech || typeof speech.transcribe !== 'function') {
          flashNotice(tr('dictation.off'));
          return;
        }
        flashNotice(tr('dictation.listening'));
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false,
          });
        } catch (error) {
          flashNotice(
            error && error.name === 'NotAllowedError'
              ? tr('dictation.permission')
              : tr('dictation.unavailable')
          );
          return;
        }
        let context;
        let recorder;
        try {
          context = new AudioContext();
          recorder = new MediaRecorder(stream);
        } catch (error) {
          stream.getTracks().forEach((track) => track.stop());
          const message = error && error.message ? error.message : '';
          flashNotice(`${tr('dictation.failed')} ${message}`.trim());
          return;
        }
        const chunks = [];
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size) chunks.push(event.data);
        };
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
          void finishDictation();
        }, DICTATION_MAX_SECONDS * 1000);
        dictationRef.current = { stream, context, recorder, chunks, controller, timer, speech };
        try {
          recorder.start(250);
        } catch (error) {
          dictationRef.current = null;
          window.clearTimeout(timer);
          stream.getTracks().forEach((track) => track.stop());
          void context.close();
          flashNotice(tr('dictation.unavailable'));
          return;
        }
        setDictation('recording');
      };

      const finishDictation = async () => {
        const active = dictationRef.current;
        if (!active) return;
        dictationRef.current = null;
        window.clearTimeout(active.timer);
        setDictation('transcribing');
        try {
          const blob = await new Promise((resolve, reject) => {
            active.recorder.onstop = () =>
              resolve(new Blob(active.chunks, { type: active.recorder.mimeType || 'audio/webm' }));
            active.recorder.onerror = () => reject(new Error('recorder'));
            if (active.recorder.state === 'recording') active.recorder.stop();
            else resolve(new Blob(active.chunks, { type: active.recorder.mimeType || 'audio/webm' }));
          });
          active.stream.getTracks().forEach((track) => track.stop());
          if (!blob.size) throw new Error(tr('dictation.empty'));
          const decoded = await active.context.decodeAudioData(await blob.arrayBuffer());
          const seconds = Math.min(decoded.duration, DICTATION_MAX_SECONDS);
          const offline = new OfflineAudioContext(1, Math.max(1, Math.floor(seconds * 16000)), 16000);
          const source = offline.createBufferSource();
          source.buffer = decoded;
          source.connect(offline.destination);
          source.start();
          const rendered = await offline.startRendering();
          const result = await active.speech.transcribe(
            { audioBase64: base64FromBytes(encodeWave(rendered.getChannelData(0))) },
            active.controller.signal
          );
          if (!result || !result.ok) {
            const message =
              result && result.error && result.error.message
                ? result.error.message
                : tr('dictation.failed');
            throw new Error(message);
          }
          const text = String(result.value.text || '').trim();
          if (!text) {
            flashNotice(tr('dictation.empty'));
            return;
          }
          const current = bench.get().transcript.trim();
          bench.set({ transcript: current ? current + ' ' + text : text, notice: '' });
        } catch (error) {
          const message = error && error.message ? error.message : '';
          flashNotice(`${tr('dictation.failed')} ${message}`.trim());
        } finally {
          try {
            await active.context.close();
          } catch (error) {
            /* already closed */
          }
          setDictation('idle');
        }
      };

      const sort = async (overrides) => {
        const text = transcript.trim();
        if (!text || busy) return;
        const answers = (overrides && overrides.answers) || state.answers;
        setBusy(true);
        try {
          const response = await fetch('/ramble-sorter/sort', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ transcript: text, answers }),
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !payload.ok) {
            throw new Error(payload.error || `HTTP ${response.status}`);
          }
          const words = text.split(/\s+/).filter(Boolean).length;
          bench.set({
            analysis: { raw: text, contradictions: [], metrics: { words } },
            asked: [],
            dismissed: [],
            notice: '',
            mode: 'draft',
            result: briefToResult(payload.brief),
          });
          setOriginalOpen(false);
        } catch (error) {
          const nextAnalysis = analyze(text);
          const tangled = nextAnalysis.contradictions.length > 0;
          bench.set({
            analysis: nextAnalysis,
            answers: {},
            asked: [],
            dismissed: [],
            notice: '',
            mode: tangled ? 'interview' : 'draft',
            result: tangled ? null : resultFor(nextAnalysis, {}, [], false),
          });
          flashNotice(
            `Model sorting unavailable — used the local sorter. ${error && error.message ? error.message : ''}`.trim()
          );
        } finally {
          setBusy(false);
        }
      };

      const clearAll = () => {
        bench.set({
          transcript: '',
          analysis: null,
          answers: {},
          result: null,
          mode: 'draft',
          asked: [],
          dismissed: [],
          notice: '',
        });
        setOriginalOpen(false);
      };

      const draftAnyway = () => {
        if (!analysis) return;
        bench.set({
          result: resultFor(analysis, state.answers, state.asked, true),
          mode: 'draft',
          notice: '',
        });
      };

      const switchMode = (mode) => {
        if (mode === 'draft') {
          if (result) bench.set({ mode: 'draft' });
          else draftAnyway();
          return;
        }
        if (!analysis) return;
        if (analysis.contradictions.length === 0) {
          flashNotice(tr('interview.none'));
          return;
        }
        bench.set({ mode: 'interview' });
      };

      const answer = (id, value, text) => {
        if (!analysis) return;
        const answers = Object.assign({}, state.answers, { [id]: { value, text: text || '' } });
        const patch = { answers, notice: '' };
        if (allAnswered(analysis, answers)) {
          patch.result = resultFor(analysis, answers, state.asked, false);
          patch.mode = 'draft';
        } else if (result) {
          patch.result = resultFor(analysis, answers, state.asked, true);
        }
        bench.set(patch);
      };

      const askAssumption = (assumption) => {
        if (state.asked.some((entry) => entry.id === assumption.id)) return;
        const asked = state.asked.concat([
          { id: assumption.id, text: assumption.text, basis: assumption.basis },
        ]);
        const patch = { asked };
        if (analysis && result) {
          patch.result = resultFor(
            analysis,
            state.answers,
            asked,
            !allAnswered(analysis, state.answers)
          );
        }
        bench.set(patch);
      };

      const dismissAssumption = (id) => {
        if (state.dismissed.includes(id)) return;
        bench.set({ dismissed: state.dismissed.concat([id]) });
      };

      const legacyCopy = (text) => {
        try {
          const area = document.createElement('textarea');
          area.value = text;
          area.setAttribute('readonly', '');
          area.style.position = 'fixed';
          area.style.top = '-1000px';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          const ok = typeof document.execCommand === 'function' && document.execCommand('copy');
          area.remove();
          if (ok) {
            flashCopied();
            flashNotice(tr('notice.copied'));
          } else {
            flashNotice(tr('notice.copyFailed'));
          }
        } catch (error) {
          flashNotice(tr('notice.copyFailed'));
        }
      };

      const copyBrief = () => {
        if (!result) return;
        const text = result.markdown || '';
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard
              .writeText(text)
              .then(() => {
                flashCopied();
                flashNotice(tr('notice.copied'));
              })
              .catch(() => legacyCopy(text));
            return;
          }
        } catch (error) {
          /* fall through to the legacy path */
        }
        legacyCopy(text);
      };

      const openDiagram = () => {
        if (!result) return;
        try {
          const html = buildFlowDocument(result);
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const opened = window.open(url, '_blank');
          if (opened) {
            try {
              opened.opener = null;
            } catch (error) {
              /* the new tab is still usable */
            }
          } else {
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'ramble-sorter-workflow.html';
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            flashNotice(tr('notice.popupBlocked'));
          }
          window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (error) {
          flashNotice(tr('notice.diagramFailed'));
        }
      };

      const modeButton = (mode) =>
        h(
          'button',
          {
            type: 'button',
            className: 'rs-mode',
            'aria-pressed': state.mode === mode ? 'true' : 'false',
            disabled:
              mode === 'interview' &&
              (!analysis || analysis.contradictions.length === 0),
            title: mode === 'interview' ? tr('mode.interviewHint') : tr('mode.draftHint'),
            onClick: () => switchMode(mode),
          },
          tr('mode.' + mode)
        );

      const header = h(
        'header',
        { className: 'rs-header' },
        h(
          'div',
          null,
          h('div', { className: 'rs-eyebrow' }, tr('page.eyebrow')),
          h('h1', { className: 'rs-title' }, tr('page.title')),
          h('p', { className: 'rs-sub' }, tr('page.subtitle'))
        ),
        h(
          'div',
          { className: 'rs-header-actions' },
          closePanel
            ? h(
                'button',
                { type: 'button', className: 'rs-btn ghost', onClick: closePanel },
                `← ${tr('page.back')}`
              )
            : null
        )
      );

      const capture = h(
        'section',
        { className: 'rs-capture', 'aria-label': tr('capture.label') },
        h('label', { className: 'rs-sr', htmlFor: 'rs-transcript' }, tr('capture.label')),
        h('textarea', {
          id: 'rs-transcript',
          className: 'rs-textarea',
          value: transcript,
          placeholder: tr('capture.placeholder'),
          spellCheck: true,
          onChange: (event) => setTranscript(event.target.value),
          onKeyDown: (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              sort();
            }
          },
          'aria-keyshortcuts': 'Meta+Enter Control+Enter',
        }),
        h(
          'div',
          { className: 'rs-capture-foot' },
          h('div', { className: 'rs-hint' }, tr('capture.hint')),
          h(
            'div',
            { className: 'rs-capture-actions' },
            h('span', { className: 'rs-hint rs-count' }, tr('capture.words', { count: wordCount })),
            h(
              'span',
              { className: 'rs-hint' },
              speechReady ? tr('dictation.state.ready') : tr('dictation.state.off')
            ),
            transcript
              ? h(
                  'button',
                  { type: 'button', className: 'rs-btn ghost', onClick: clearAll },
                  tr('action.clear')
                )
              : null,
            h(
              'button',
              {
                type: 'button',
                className: 'rs-btn ghost' + (dictation === 'recording' ? ' rs-mic-live' : ''),
                title: tr('action.dictateHint'),
                disabled: dictation === 'transcribing',
                onClick: () => {
                  if (dictation === 'recording') void finishDictation();
                  else if (dictation === 'idle') void startDictation();
                },
              },
              dictation === 'recording'
                ? tr('action.stopDictate')
                : dictation === 'transcribing'
                  ? tr('dictation.working')
                  : tr('action.dictate')
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'rs-btn primary',
                disabled: !transcript.trim() || busy,
                onClick: sort,
              },
              busy ? tr('action.sorting') : tr('action.sort')
            )
          )
        )
      );

      const staleNotice = dirty
        ? h(
            'div',
            { className: 'rs-notice', role: 'status' },
            h('span', null, `${tr('stale.title')} ${tr('stale.body')}`),
            h(
              'button',
              { type: 'button', className: 'rs-btn small', onClick: sort },
              tr('action.sortAgain')
            )
          )
        : null;

      const notice = state.notice
        ? h('div', { className: 'rs-notice', role: 'status' }, state.notice)
        : null;

      const interview =
        state.mode === 'interview' && analysis
          ? h(Interview, { analysis, answers: state.answers, onAnswer: answer, t: tr })
          : null;

      const resultView = result
        ? h(
            React.Fragment,
            null,
            h(
              'div',
              { className: 'rs-result-head' },
              h(
                'div',
                { className: 'rs-result-title' },
                h('span', { className: 'rs-eyebrow' }, tr('result.title')),
                h(
                  'span',
                  { className: 'rs-hint' },
                  tr('result.wordsIn', { count: analysis ? analysis.metrics.words : 0 })
                )
              ),
              h(
                'button',
                { type: 'button', className: 'rs-btn primary small', onClick: copyBrief },
                copied ? tr('action.copied') : tr('action.copy')
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'rs-btn small',
                  onClick: () => setOriginalOpen((open) => !open),
                  'aria-expanded': originalOpen ? 'true' : 'false',
                },
                originalOpen ? tr('action.hideOriginal') : tr('action.original')
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'rs-btn small',
                  disabled: !result.flow.enabled,
                  title: result.flow.enabled ? undefined : tr('action.diagramHint'),
                  onClick: openDiagram,
                },
                tr('action.diagram')
              ),
              analysis && analysis.contradictions.length > 0 && state.mode !== 'interview'
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'rs-btn small ghost',
                      onClick: () => switchMode('interview'),
                    },
                    tr('action.reopen')
                  )
                : null
            ),
            originalOpen
              ? h(
                  'div',
                  { className: 'rs-original' },
                  h('pre', null, analysis ? analysis.raw : transcript)
                )
              : null,
            visibleAssumptions.length
              ? h(
                  'section',
                  { className: 'rs-note', 'aria-label': tr('review.title') },
                  h(
                    'div',
                    { className: 'rs-note-head' },
                    h('h2', { className: 'rs-note-title' }, tr('review.title')),
                    h('span', { className: 'rs-chip intent' }, tr('review.notPart')),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'rs-btn small rs-note-askall',
                        onClick: openAskAll,
                      },
                      'Ask all'
                    )
                  ),
                  h('p', { className: 'rs-note-sub' }, tr('review.sub')),
                  h(
                    'ul',
                    { className: 'rs-note-list' },
                    visibleAssumptions.map((assumption) =>
                      h(
                        'li',
                        { key: assumption.id, className: 'rs-note-item' },
                        h('span', { className: `rs-chip ${assumption.kind}` }, tr('assumption.' + assumption.kind)),
                        h('span', { className: 'rs-note-text' }, assumption.text),
                        h('span', { className: 'rs-note-basis' }, `${tr('review.basis')} “${assumption.basis}”`),
                        h(
                          'span',
                          { className: 'rs-note-actions' },
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'rs-btn small ghost',
                              onClick: () => dismissAssumption(assumption.id),
                            },
                            tr('action.dismiss')
                          )
                        )
                      )
                    )
                  )
                )
              : null,
            result.questions && result.questions.length
              ? h(ModelQuestions, {
                  questions: result.questions,
                  answers: state.answers,
                  busy,
                  onChange: (question, value) =>
                    bench.set({
                      answers: Object.assign({}, state.answers, { [question]: value }),
                    }),
                  onApply: sort,
                })
              : null,
            h('article', { className: 'rs-message' }, result.blocks.map(renderBlock)),
            h(
              'div',
              { className: 'rs-flow', 'aria-label': tr('result.workflow') },
              h('span', { className: 'rs-eyebrow' }, tr('result.workflow')),
              result.flow.stages.slice(0, 7).map((stage, index) =>
                h(
                  React.Fragment,
                  { key: index },
                  index > 0 ? h('span', { className: 'rs-flow-arrow' }, '→') : null,
                  h('span', { className: 'rs-flow-chip' }, stage.label)
                )
              )
            )
          )
        : null;

      const empty =
        !result && !interview
          ? h(
              'section',
              { className: 'rs-empty' },
              h('h2', null, tr('empty.title')),
              h('p', null, tr('empty.body'))
            )
          : null;

      return h(
        'section',
        { className: 'rs-page', 'data-ramble-sorter': '', 'data-compact': props.compact ? 'true' : undefined },
        h('style', null, PAGE_CSS),
        h(
          'div',
          { className: 'rs-shell' },
          header,
          capture,
          staleNotice,
          notice,
          interview,
          resultView,
          empty,
          askOpen
            ? h(AskAllDialog, {
                assumptions: visibleAssumptions,
                drafts: askDrafts,
                onChange: (id, value) =>
                  setAskDrafts(Object.assign({}, askDrafts, { [id]: value })),
                onCancel: () => setAskOpen(false),
                onApply: applyAskAll,
                busy,
                tr,
              })
            : null,
          h(
            'footer',
            { className: 'rs-foot' },
            h('span', null, tr('foot.privacy')),
            h('span', null, tr('foot.scope'))
          )
        )
      );
    }

    function SorterTabBody(props) {
      return h(BenchPage, Object.assign({}, props, { compact: true }));
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { en: EN }), 'ramble-sorter: dictionary');

      const t = ctx.locale.bind(NS);
      const bench = createBench();
      const getSpeech = () => {
        try {
          const namespace = ctx.get('remote.speech');
          if (namespace) return namespace;
        } catch (error) {
          /* namespace not mounted yet */
        }
        return ctx.remote && ctx.remote.speech;
      };

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: PANEL_ORDER,
            label: () => t('entry.label'),
            locale: NS,
          },
          PanelIcon
        )
      );

      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            inject: () => ({
              bench,
              remote: ctx.remote,
              speech: getSpeech,
              closePanel: () => ctx.layout.selectPanel(null),
            }),
          },
          BenchPage
        )
      );

      if (ctx.sidebarRightTabs && typeof ctx.sidebarRightTabs.register === 'function') {
        ctx.effect(
          () =>
            ctx.sidebarRightTabs.register({
              id: 'ramble-sorter',
              kind: 'ramble-sorter',
              title: () => t('entry.label'),
              guide: [
                {
                  id: 'open',
                  order: 10,
                  title: () => t('entry.label'),
                  description: () => t('guide.description'),
                  icon: PanelIcon,
                },
              ],
            }),
          'ramble-sorter: right tab type'
        );
      }

      ctx.effect(
        () =>
          ctx.slots.inject('sidebar.right.pane.tab', () =>
            ctx.slots.register(
              {
                name: 'sidebar.right.pane.tab',
                key: 'ramble-sorter',
                locale: NS,
                inject: () => ({ bench, remote: ctx.remote, speech: getSpeech }),
              },
              SorterTabBody
            )
          ),
        'ramble-sorter: right tab body'
      );

      ctx.effect(
        () => () => {
          try {
            if (ctx.layout.panelInfo.getSnapshot().activePanelId === PANEL_ID) {
              ctx.layout.selectPanel(null);
            }
          } catch (error) {
            /* the layout may already be disposing */
          }
        },
        'ramble-sorter: leave panel'
      );
    }

    const exported = {
      inject: ['slots', 'locale', 'layout', 'remote', 'sidebarRightTabs'],
      apply,
    };
    Object.defineProperty(exported, '__test', {
      enumerable: false,
      value: {
        analyze,
        buildBrief,
        buildFlowDocument,
        copyText,
        BenchPage,
        PanelIcon,
        createBench,
        nounPhrases,
        splitCompoundAsks,
        EN,
      },
    });
    return exported;
  },
});
