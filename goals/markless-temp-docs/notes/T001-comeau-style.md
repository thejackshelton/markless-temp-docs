# T001 — Josh W. Comeau's technical writing style: a guide for Markless docs

Read-only research note. Sources read (full posts, fetched 2026-10-06 from joshwcomeau.com):

1. An Interactive Guide to Flexbox (`/css/interactive-guide-to-flexbox/`)
2. The Rules of Margin Collapse (`/css/rules-of-margin-collapse/`)
3. A Friendly Introduction to Spring Physics (`/animation/a-friendly-introduction-to-spring-physics/`)
4. Understanding Layout Algorithms (`/css/understanding-layout-algorithms/`)
5. Why React Re-Renders (`/react/why-react-re-renders/`)
6. An Interactive Guide to CSS Transitions (`/animation/css-transitions/`)
7. The End of Front-End Development (`/blog/the-end-of-frontend-development/`)
8. An Interactive Guide to CSS Grid (`/css/interactive-guide-to-grid/`)

Caveat: the page text came through a fetch-and-extract tool, not by eye. Quotes are near-verbatim. Check each quote against the live page before publishing it anywhere.

---

## 1. The core idea in one paragraph

Comeau teaches **how the system thinks**, not what the API surface lists. Each post opens with a moment of confusion the reader already has. Next it builds a mental model, a simple picture of the internal mechanism, often with an everyday analogy. Then it hands the reader a live widget to poke at until the model "clicks". The API arrives last, as the natural name for something the reader already understands. The voice is a friendly senior colleague: first person, second person, candid about his own past confusion, lightly funny, never sarcastic toward the reader.

---

## 2. Openings and hooks

He uses three repeatable openers. All three reach the reader's problem within about 3 sentences.

**The confession.** He admits he once had the same gap. This lowers the reader's defenses.
- "So, I'll be honest. I had been working professionally with React *for years* without really understanding how React's re-rendering process worked. 😅" (Why React Re-Renders)
- "A few years ago, I had a *Eureka!* moment with CSS." (Understanding Layout Algorithms)

**The shared frustration.** He names an experience the reader has had and validates it.
- "Have you ever had the unsettling experience of writing a familiar chunk of CSS, something you've used *many times* before, only to get a different and unexpected result?" (Understanding Layout Algorithms)
- "...you've almost certainly been surprised when margins either don't collapse, or they collapse in weird and unexpected ways." (Margin Collapse)

**The plain definition plus a surprise.** He states the concept in one sentence, then shows the counter-intuitive result.
- "In CSS, adjacent margins can sometimes overlap." Then: "Instead of sitting 48px apart, their 24px margins merge together, occupying the same space!" (Margin Collapse)

He also sets expectations early: audience level ("accessible to developers of all experience levels... I bet you'll learn something!" — CSS Transitions), plus housekeeping callouts such as "Way better on desktop!" or "Motion Warning".

**For Markless:** open with a confession or a shared frustration tied to a real symptom. Example: "the click handler ran, but nothing re-rendered". Do not open with "Markless is a framework that...".

---

## 3. Mental models before APIs

The pattern stays the same in every post:

1. **Frame the problem the tool solves.** "**Each layout algorithm is designed to solve a specific problem.**" ... "**So, what problem does Flexbox solve?**" (Flexbox). He bolds the framing questions.
2. **Describe the mechanism in plain words.** Spring Physics covers mass, tension and friction as physical intuitions ("Imagine how heavier items would respond when being hung on a spring") before any config object appears.
3. **Reframe the confusing behaviour as a system rule.** In Layout Algorithms, `width` does not "have some special caveat". Instead, "the Flexbox algorithm implements the `width` property in a different way than the Flow algorithm."
4. **Admit where the model is a simplification.** "I'm not actually sure how this stuff is implemented under-the-hood, but in my experience, this framing is much more helpful" (Layout Algorithms). The model is a teaching tool, and he says so.
5. **Only then: the property or API name**, as a label for the thing already understood.

Headings mirror this. Margin Collapse uses **rules as headings** ("Only vertical margins collapse", "The bigger margin wins", "Nesting doesn't prevent collapsing"). The table of contents itself is the mental model.

**For Markless:** before the API, explain what the compiler, runtime or router *does* with the reader's code. Example: "the compiler reads your `.tsrx` and decides which DOM nodes can ever change." Then introduce the attribute or function as the handle on that behaviour.

---

## 4. Analogies

His analogies are concrete, physical, often food or animals, and short. He uses one per concept and returns to it, never stacking three.

- "it's essentially the *Microsoft Word* layout algorithm." (Flexbox, for Flow layout)
- "You can think of padding/border as a sort of wall." (Margin Collapse)
- "like a moat filled with hungry piranhas." (Margin Collapse)
- "I like to pretend that `React.memo` is a bit like a lazy photographer." Extended: "If you ask it to take 5 photos of the exact same thing, it'll take 1 photo and give you 5 copies." (Why React Re-Renders)
- "`ease-out` comes charging in like a wild bull, but it runs out of energy." (CSS Transitions)
- "Animation is like salt: too much of it spoils the dish." (CSS Transitions)

Traits worth copying:
- He signals the analogy is a lens, not a truth: "I like to pretend", "You can think of", "sorta".
- The analogy maps to *behaviour* the reader can predict. The lazy photographer predicts when memo re-renders.
- He jokes about his own metaphor habit, e.g. the "Content warning: I make a food-related metaphor later in this tutorial" callout (Flexbox).

---

## 5. Voice: first and second person

- **"I"** for experience, opinion and confession: "I remember running into demos like this and being completely baffled." (Flexbox)
- **"we"** for walking through mechanics together: "we can opt in to Flexbox by changing the `display` property on the parent container" (Flexbox).
- **"you"** for instructions and the reader's experience: "Try dragging the middle piece side to side" (Flexbox).
- He voices the reader's objection: "But that can't be!, I can hear you saying." (Margin Collapse)

---

## 6. Humor level

Light and frequent, roughly one wry line every few paragraphs. It never replaces an explanation. Sources:
- Self-deprecation: "This was an absolutely worthwhile investment, but my goodness, it took *forever*. 😅" (Layout Algorithms)
- Pop-culture nods: "Clippy would never allow it!" (Layout Algorithms); "With great power comes great responsibility" (Flexbox).
- Vivid verbs and images: "pootering along like a sleepy turtle" (CSS Transitions).
- Emoji: one at a time, as tone markers (😅 ✨ ❤️ 🔮), usually at paragraph ends. Never inside technical claims.

The humor targets CSS, the author, or the situation, never the reader.

---

## 7. Sentence and paragraph rhythm

- **Paragraphs:** 2–4 sentences, about 40–65 words. One-sentence paragraphs serve emphasis or transitions ("Let's test it.").
- **Sentences:** a mix of short punches and medium explanations. Rhetorical questions set up each section ("So, what problem does Flexbox solve?").
- **Emphasis:** *italics* for stressed words ("*seem* simple", "*way* down the rabbit hole"). **Bold** for the one sentence per section the reader must remember.
- **Transitions:** casual connectors such as "So,", "Alright,", "Here's the thing", "The thing is,". They keep the narrative moving.

---

## 8. Introducing jargon

Plain meaning first, then the official name, then usage:

- "the *hypothetical size*. It's the size an element *would* be, in a perfect utopian world" ... "The specification has a name for this" (Flexbox)
- "adjacent margins can sometimes overlap. This is known as 'margin collapse'" (Margin Collapse). Behaviour first, name second.
- "layout algorithms, known officially as 'layout modes'" (Flexbox). He picks the friendlier term, then names the official one once.
- Playful etymology as a memory hook: "It's missing the R, but we can sorta think of it as 'memo**r**ization'." (Why React Re-Renders)

New terms get *italics* on first use and nothing after.

---

## 9. "Aha" and misconception framing

He names misconceptions explicitly and numbers them, so the reader can catch themselves:
- "Alright, let's clear away *Big Misconception #1*: **The entire app re-renders whenever a state variable changes.**" (Why React Re-Renders)
- "It turns out that many of us have **a misconception about how margins work.**" (Margin Collapse)
- "This isn't exactly *wrong*, but it's a subtle misunderstanding" (Layout Algorithms). He gives partial credit to the reader's old model.

The sequence is: state the wrong belief in bold, show a demo that breaks it, give the correct rule, then reassure.

He also builds puzzles: "Take a couple of minutes and poke at this demo. **See if you can figure out what's going on here.**" (Flexbox). The reader makes a guess before the reveal.

---

## 10. Interactive widgets: placement and purpose

Widgets are the centre of each post, not decoration. Observed rules:

- **Placement:** directly after the concept is named and before the full explanation. The reader feels the behaviour, then reads why.
- **One variable per widget.** A slider for `flex-grow` per child, a "Frames per second" control, a drag-and-release spring. Each widget isolates one cause and one effect.
- **Lead-ins are short imperatives:** "For example, check this out:", "Let's test it.", "Try incrementing/decrementing each child:", "Drag and release the spring to trigger the animation:", "Experience this for yourself by tweaking the new 'Frames per second' control".
- **He says it is live:** "**This is not a static image!** Interact with it to get a feel for how springs behave" (Spring Physics).
- **He points at what to notice afterwards:** "Notice how the bottom ball feels just a bit more 'real'?" (Spring Physics); "Notice how they appear to glitch slightly at the start and end..." (CSS Transitions).
- **Kinds of widget:**
  - *Sliders* teach continuous relationships (spring tension, flex ratios, frame rate).
  - *Toggles and side-by-side comparisons* teach a binary difference (`ease-out` vs `ease-in`; with and without `React.memo`).
  - *Live code playgrounds* (with reset, format and "open in CodeSandbox") teach "edit and see".
  - *Visual indicators* (a green flash on each re-rendered component) make invisible runtime events visible.
  - *Real devtools* as a widget: "pop open the developer tools and inspect the margins for yourself" (Margin Collapse).
- **Graceful fallbacks:** callouts such as "Way better on desktop!" and "Property not supported" tell the reader when a demo cannot work in their browser.

**For Markless:** the obvious widgets are a re-render or "which DOM node changed" flash overlay, a toggle between server-rendered and resumed state, a step-through of what the compiler emits for one `.tsrx` line, and a slider for list size versus bundle bytes.

---

## 11. Sidebars and asides

He does **not** use fixed labels such as "Hot tip" or "Deep dive". None of the 8 posts had them, and none had collapsible deep-dive sections. Each callout gets a **custom, conversational title** that works as a mini-heading:

- "Not *exactly* the same", "A simpler approach?", "Proceed with caution", "The minimum size gotcha" (Flexbox)
- "There's a sneaky gotcha here", "Should we use areas, or rows/columns?" (Grid)
- "Time for me to come clean", "Tradeoffs", "Selecting all properties" (CSS Transitions)
- "This could change in the future!" (Why React Re-Renders)
- "Margin-blocked" (Margin Collapse); "Gravity?", "Springs in CSS?" (Spring Physics)

Callouts have a visual *type*: info, warning or success styling. Their jobs:
1. Edge cases and exceptions that would derail the main line.
2. Accessibility notes ("Line height and accessibility", "Motion Warning").
3. Honesty notes ("Time for me to come clean": the demos were exaggerated for clarity).
4. Browser support and future-change warnings.
5. Anticipated reader questions, phrased as questions.

**For Markless:** use a small set of callout *types* (info, warning, gotcha). Give each callout a specific title in plain language. A title such as "Why didn't my effect run twice?" beats "Note".

---

## 12. Code snippet sizing

- **Default:** 3–12 lines that isolate one idea. Example: a 6-line `form { display: flex; ... }` block (Flexbox).
- **Single-line** snippets inline for a single property (`will-change: transform;`).
- **Medium** (8–20 lines) only when two pieces must be seen together (component plus child; HTML plus CSS).
- **Large** (20–40+ lines, multi-file) only inside an interactive playground, never as static walls.
- Every snippet sits next to prose that says what to look at. Comments inside code explain concepts sparingly.

---

## 13. Headings

- Short, plain, often the concept name ("Flex direction", "Alignment", "Mass", "Tension", "Friction").
- Sometimes a **claim** as the heading ("The bigger margin wins", "It's not about the props").
- Order follows the learning path: fundamentals, then mechanics, then gotchas, then practice or performance, then "the bigger picture".
- Friendly milestone headings: "You made it!", "Bonus: Unpacking the demo", "Bonus: Performance tips", "Going deeper".

---

## 14. Endings

He ends in a consistent pattern:
1. **Acknowledge the effort:** "So I want to acknowledge something: **this has been a dense tutorial.**" (Flexbox)
2. **Zoom out to a belief:** "**CSS is actually a deeply robust and consistent language.** The problem is that most of our mental models are incomplete and inaccurate." (Flexbox)
3. **Reassure:** "Soon enough, you'll just know how this stuff works, you won't even have to think about it." (Margin Collapse)
4. **Practical parting advice** where relevant: "**Don't over-optimize!**" (Why React Re-Renders)
5. **Next step:** the course plug, a "Prior art" link list (Spring Physics), or a sandbox.
6. **Warm sign-off:** "I hope you found this tutorial useful. ❤️" (Grid)

**For Markless:** replace the course plug with "where to go next" links into the docs.

---

## 15. What he avoids

- Opening with history, feature lists or marketing claims.
- API reference tables as the main teaching vehicle.
- Long static code walls.
- Blaming or talking down to the reader. Confusion is always the tool's or the old model's fault.
- Unqualified certainty about internals he has not verified. He flags simplifications.
- Stacked metaphors or analogies that need their own explanation.
- Generic callout labels.
- Dense spec language without a plain-language restatement first.

---

## 16. Quoted example sentences (14)

1. "Each layout mode is its own little sub-language within CSS." — Interactive Guide to Flexbox
2. "**Each layout algorithm is designed to solve a specific problem.**" — Interactive Guide to Flexbox
3. "Take a couple of minutes and poke at this demo. **See if you can figure out what's going on here.**" — Interactive Guide to Flexbox
4. "In CSS, adjacent margins can sometimes overlap." — The Rules of Margin Collapse
5. "You can think of padding/border as a sort of wall." — The Rules of Margin Collapse
6. "But that can't be!, I can hear you saying." — The Rules of Margin Collapse
7. "Spring physics are like a secret ingredient; they make all animations taste better." — A Friendly Introduction to Spring Physics
8. "**This is not a static image!** Interact with it to get a feel for how springs behave" — A Friendly Introduction to Spring Physics
9. "It's not enough to learn what specific properties do." — Understanding Layout Algorithms
10. "CSS is a tricky language to debug; we don't have error messages, or `debugger`, or `console.log`. Our intuition is the best tool we have." — Understanding Layout Algorithms
11. "I like to pretend that `React.memo` is a bit like a lazy photographer." — Why React Re-Renders
12. "Alright, let's clear away *Big Misconception #1*" — Why React Re-Renders
13. "Animation is like salt: too much of it spoils the dish." — An Interactive Guide to CSS Transitions
14. "I could be wrong. I don't have a crystal ball 🔮." — The End of Front-End Development

---

## 17. Do / Don't checklist

**Do**
- [ ] Open with a confession, a shared frustration, or a surprising one-line fact.
- [ ] State the problem the feature solves before you show the feature.
- [ ] Explain the mechanism in plain words before naming the API.
- [ ] Use one concrete analogy per concept, and say it is an analogy.
- [ ] Name misconceptions explicitly, in bold, then break them with a demo.
- [ ] Put a widget right after the concept, with a short imperative lead-in.
- [ ] Give each widget one variable to change.
- [ ] Tell the reader what to notice after each demo.
- [ ] Keep snippets to 3–12 lines. Put anything bigger in a live playground.
- [ ] Give callouts specific, question-like or claim-like titles.
- [ ] Use headings that state rules or name concepts in learning order.
- [ ] Flag simplifications honestly.
- [ ] End by zooming out, reassuring, and pointing to the next page.

**Don't**
- [ ] Open with "X is a framework that..." or a feature list.
- [ ] Lead with an API table.
- [ ] Stack metaphors or use metaphors that need explaining.
- [ ] Mock the reader, or imply the concept is "easy".
- [ ] Use generic callout labels ("Note", "Info") as the only title.
- [ ] Drop a widget without telling the reader what to do with it.
- [ ] Paste 40 static lines of code.
- [ ] Use more than one emoji per few paragraphs, or any emoji inside a technical claim.
- [ ] Claim internals you have not verified. Flag simplifications instead.

---

## 18. Reconciling with Simplified Technical English (STE)

The Markless rules:
1. At most 20 words per sentence.
2. Active voice.
3. No hedging words: *should, would, may, might*.
4. Avoid *-ing* verb forms where possible.
5. One instruction per sentence.
6. Conditions before commands.

### Where Comeau and STE conflict

| Comeau habit | STE conflict | Resolution |
|---|---|---|
| Long, winding confession openers | Over 20 words | Split into 2–3 short sentences. Keep the "I" and the admission. |
| "I like to pretend...", "You can think of..." | Not hedging words, but a soft frame | Allowed. Prefer "Think of X as Y." It is an imperative, short and active. |
| "It's the size an element *would* be" | *would* | Rephrase as a definition: "It is the size the element takes with no limits." |
| "you might be surprised" | *might* | Turn it into an observation: "Many developers expect X. Markless does Y." |
| "Try dragging the middle piece side to side" | *-ing* form, possibly two actions | "Drag the middle piece left. Then drag it right." |
| Rhetorical questions | None (questions are not banned) | Keep them. They carry the warmth and stay short. |
| Asides inside sentences ("— no matter your level —") | Length | Move the aside to its own sentence or a callout. |

### Where the warmth lives under STE

Warmth does not depend on long sentences or hedges. It comes from:
- **Person:** keep "I", "we" and "you". STE does not forbid them.
- **Admission:** "I got this wrong for a year." is 8 words, active, and warm.
- **Concrete images:** an analogy fits in one sentence. "Think of the compiler as a stage manager."
- **Rhythm:** short sentences already read as friendly and punchy. Comeau's own best lines are under 12 words.
- **Validation:** "This part is confusing. That is the tool's fault, not yours."
- **Emphasis and emoji** in moderation. They are typography, not grammar.

Certainty replaces hedging. Where Comeau hedges, STE turns the hedge into an explicit scope ("In this example...", "When the list is static...") or into an honest callout ("This is a simplification").

### Five before/after rewrites

**1. Opening confession**

Before (Comeau-style, 33 words, *-ing*): "So, I'll be honest: I spent months building Markless apps without really understanding why some updates showed up instantly while others seemed to vanish into thin air."

After (STE): "I'll be honest. I built Markless apps for months without this knowledge. Some updates appeared at once. Others vanished. This guide explains why."

**2. Analogy plus hedge**

Before: "You might think of the compiler as a kind of stage manager that would decide, ahead of time, which props are going to move during the show."

After: "Think of the compiler as a stage manager. Before the show, it decides which props move. Everything else stays nailed to the stage."

**3. Widget lead-in (multiple instructions, *-ing*)**

Before: "Try dragging the slider to change the list size and watch how the bundle grows, noticing that the runtime cost stays flat."

After: "Drag the slider to the right. Watch the bundle size. Now look at the runtime cost. It stays flat. 🎉"

**4. Condition after command, passive, hedge**

Before: "Wrap the handler in `$()` — this should be done whenever the handler may be needed on the client after resume."

After: "If the client calls the handler after resume, wrap it in `$()`."

**5. Misconception reveal**

Before: "A lot of developers would probably assume that changing a signal re-renders the whole component, but that's actually not what's going on under the hood."

After: "**Big misconception #1: a signal change re-renders the whole component.** It does not. Markless updates only the text node that reads the signal. Try it below."

### Quick STE-plus-warmth checklist

- [ ] Count words in every sentence over about 15. Split anything over 20.
- [ ] Search for *should, would, may, might*. Replace each with a scope, a condition, or a plain fact.
- [ ] Search for *-ing* words. Convert to imperatives or simple present where it reads naturally.
- [ ] In every instruction, put the "If/When..." clause first.
- [ ] Give each sentence one instruction. Chain steps with "Then".
- [ ] Keep at least one "I/we" sentence, one analogy, and one validating line per section.
