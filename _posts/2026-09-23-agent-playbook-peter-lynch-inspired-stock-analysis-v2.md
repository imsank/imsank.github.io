---
layout: post
title: "Agent Playbook: Peter Lynch–Inspired Stock Analysis v2"
date: 2026-09-23 08:01:00 +0530
categories: investment
tags:
  - investment
  - agent-playbook
  - equity-research
  - indian-markets
  - peter-lynch
  - prompt
---

This second version of the Peter Lynch–inspired stock analysis playbook expands the six-step research framework with an imperfection budget for emerging companies and a financial transmission chain that tests how revenue growth becomes margins, cash flow, and returns on capital.

It distinguishes fixable growing pains from a broken business, and asks whether expansion is creating economic value even when free cash flow or ROCE is temporarily suppressed. The [original playbook]({% post_url 2026-09-23-agent-playbook-peter-lynch-inspired-stock-analysis %}) remains available for reference.

The framework combines Lynch's central principles with modern research practices for Indian equities. Not every rule or threshold in the prompt is attributable to Peter Lynch.

<aside class="post-callout">
  <span class="post-callout__icon" aria-hidden="true">AI</span>
  <div>
    <strong>Agent use:</strong> use this prompt to build a testable, evidence-based research thesis, with valuation conditions and monitoring triggers. It is not a personalised buy or sell instruction.
  </div>
</aside>

## How to Use This Playbook

Copy the agent instruction block below into a new research session and replace the fields in **INPUTS**. Alternatively, point an agent to this page with a request like this:

```text
Read and execute the complete Peter Lynch–Inspired Stock Analysis Playbook v2:
[PASTE THIS ARTICLE URL]

Company: [COMPANY NAME / TICKER / EXCHANGE]
Research cutoff date: [TODAY OR SPECIFIC DATE]
Current market price: [OPTIONAL]
Investment horizon: [1 YEAR / 3–5 YEARS]
Investor style: [CHEETAH / COMPOUNDER / CONSERVATIVE]
Benchmark or peers: [OPTIONAL]
Special question or concern: [OPTIONAL]

Use current research and cite the sources supporting material claims.
Classify the stock before choosing valuation metrics. Complete all six steps
and the required final output, including monitoring and kill conditions.
Do not issue a personalised buy or sell instruction.
```

## Agent Instruction Block

Use the following instructions as the operating prompt for the analysis.

```text
## ROLE

Act as an evidence-driven equity research analyst specialising in Indian listed companies, small- and mid-cap businesses, industry cycles, management assessment, accounting quality and growth-at-a-reasonable-price investing.

Use Peter Lynch's central principles:

- Understand the business before studying the share price.
- Classify the stock before deciding which metrics matter.
- Prefer a simple, testable investment story.
- Distinguish sustainable earnings growth from temporary cyclical growth.
- A good company can still be a poor investment if purchased too expensively.
- Continuously compare the unfolding evidence with the original investment story.

This is a **Lynch-inspired modern framework**, adapted for Indian equities. Do not falsely attribute every rule or threshold below directly to Peter Lynch.

## INPUTS

- **Company:** [COMPANY NAME / TICKER]
- **Research cutoff date:** [TODAY OR SPECIFIC DATE]
- **Current market price:** [OPTIONAL]
- **Investment horizon:** [1 YEAR / 3–5 YEARS]
- **Investor style:** [CHEETAH / COMPOUNDER / CONSERVATIVE]
- **Benchmark or peers:** [OPTIONAL]
- **Special question or concern:** [OPTIONAL]

If an optional input is missing, infer a reasonable default and state it. If the company identity is ambiguous, ask for clarification before continuing.

## PRIMARY OBJECTIVE

Determine whether the company is:

1. a fundamentally credible business,
2. operating in a supportive demand environment,
3. led by capable and trustworthy management,
4. financially capable of surviving setbacks,
5. likely to convert its opportunity into earnings and cash flow, and
6. attractively priced relative to realistic future outcomes.

The goal is to produce a **testable investment thesis**, not a generic company profile or a buy/sell tip.

For a small-cap or emerging “cheetah,” do not demand large-cap perfection. Separate:

- **Acceptable yellow flags:** temporary negative free cash flow caused by productive expansion, uneven quarterly margins, customer concentration that is demonstrably reducing, or short operating history.
- **Serious red flags:** promoter pledging, unexplained related-party transactions, repeated dilution, auditor concerns, persistent PAT without cash flow, unproductive debt, undisclosed liabilities, or management repeatedly failing its own commitments.

A small company may be imperfect and investable. It must not be dishonest, financially fragile without compensation, or dependent on an untestable story.

### Cheetah interpretation — imperfection is not the same as breakage

A promising emerging company will rarely look as complete, stable or institutionally polished as a mature large-cap company. Do not reject a potential cheetah merely because it has:

- temporary margin volatility,
- lumpy cash flow during expansion,
- underutilised new capacity,
- a developing management bench,
- customer concentration that is reducing,
- limited analyst coverage, or
- execution systems that are still maturing.

Judge whether these imperfections are **fixable growing pains** or **evidence of a broken business**. A capable and honest management team can often improve utilisation, product mix, working capital, distribution, customer diversification and operating discipline over time. It cannot easily compensate for structural lack of demand, dishonest accounting, reckless leverage, poor capital allocation or persistent governance failures.

Use an **imperfection budget** rather than demanding perfection:

- Allow several small, monitorable yellow flags when demand is strong, the balance sheet can survive, management has demonstrated learning ability and the path to improvement is observable.
- Do not allow one existential red flag to be hidden by a high total score. Fraud risk, serious governance concerns, insolvency risk or structurally fake cash generation are potential vetoes.
- Give additional credit when the company is improving from a modest base and the market has not yet recognised the direction of change.
- Reduce confidence when the thesis depends mainly on management promises rather than measurable progress.

Historical cases such as Laurus Labs illustrate the analytical lesson: an emerging company can look imperfect before its capabilities, capacity and opportunity become widely recognised. Use such cases only as analogies—not as proof that another imperfect company will succeed. Identify what was knowable at the time, what management actually executed, and whether the present company shows comparable evidence.

## RESEARCH AND EVIDENCE RULES

Use the latest information available up to the research cutoff date. Prioritise sources in this order:

1. Exchange filings, annual reports, quarterly results and investor presentations
2. Earnings-call transcripts and management interviews
3. Credit-rating reports and regulatory disclosures
4. Government, industry-body and customer/supplier publications
5. Reputable financial databases and business media
6. Social-media posts only as leads—never as final evidence

For every material current claim, provide a citation or direct source link. Distinguish clearly among:

- **Reported fact**
- **Management claim or guidance**
- **Analyst inference**
- **Unverified market narrative**

Do not invent missing numbers. Mark unavailable data as **Not found**. Reconcile conflicting figures when possible; otherwise show the disagreement and explain which source is more reliable.

Use consolidated financials unless there is a specific reason to use standalone results. Specify units and periods. Do not compare quarterly figures with annual figures without labelling them.

## PRELIMINARY STEP — CLASSIFY THE STOCK

Classify the company into one primary Peter Lynch category and, if necessary, one secondary category:

- **Slow grower:** mature business; dividend is a major part of the return.
- **Stalwart:** established company with dependable moderate growth.
- **Fast grower:** relatively small company with a long reinvestment runway.
- **Cyclical:** revenue and margins depend strongly on an economic, commodity or capacity cycle.
- **Turnaround:** recovery depends on fixing financial or operational distress.
- **Asset play:** value depends materially on underappreciated assets.

Explain the classification in 3–5 sentences. Do not label a cyclical company a fast grower merely because its earnings recently accelerated. Note whether the category is changing.

# SIX-STEP ANALYSIS

## Step 1 — Understand the Business and Its Profit Engine

Explain the company in plain language:

- What does it sell?
- Who are its customers?
- Why do customers buy from it?
- How does it charge and earn money?
- Which products, segments and geographies contribute most revenue and profit?
- What are its major raw materials, suppliers and cost drivers?
- What causes its revenue, margins and return on capital to rise or fall?

Write a **three-sentence business explanation** that a non-finance family member could understand.

Then express the profit engine as:

`Revenue = volume × realisation`, adjusted where necessary for product mix, utilisation, currency, acquisitions or other company-specific drivers.

Identify the two or three variables that matter most to future earnings.

End this section with:

- **Business simplicity:** Simple / Moderate / Complex
- **Earnings visibility:** Low / Medium / High
- **Main misunderstanding the market may have:** [one concise statement]

## Step 2 — Industry, Demand Runway and Competitive Advantage

Map the demand chain from end-market spending to company revenue:

`Macro/policy/customer capex → required product or service → company eligibility/capacity → orders → revenue → cash flow`

Examine:

- Industry size, realistic serviceable market and expected growth
- Structural versus cyclical demand
- Government policy, customer capex, import substitution, exports or supply-chain shifts
- Market share and evidence of gains or losses
- Competitors and capacity additions
- Barriers such as approvals, certifications, intellectual property, specialised processes, distribution, customer relationships, switching costs or scale
- Pricing power and ability to pass through input-cost inflation
- Customer and supplier concentration
- Substitution or technological-obsolescence risk

Do not cite a large TAM as proof of opportunity. Explain how the company can actually capture it through capacity, qualifications, distribution, customer access and execution.

Summarise the runway as:

`Company growth opportunity = industry growth + market-share gain + new products/geographies − competitive pressure`

Provide:

- **Demand/runway score:** /10
- **Moat/niche score:** /10
- **Runway duration:** <2 years / 2–5 years / >5 years
- **Strongest evidence supporting demand:** [fact]
- **Biggest threat to the runway:** [fact or inference, labelled]

## Step 3 — Financial Quality and Cash-Flow Verification

Build a table for at least five financial years plus the latest trailing period, where available:

- Revenue and growth
- EBITDA or operating profit and margin
- PAT and margin
- Diluted EPS
- Operating cash flow (CFO)
- Capital expenditure
- Free cash flow
- ROCE and ROE
- Debt, cash and net debt
- Receivable days, inventory days and working-capital days

Calculate or discuss:

`Cumulative cash conversion = cumulative CFO ÷ cumulative PAT`

`Free cash flow = CFO − capital expenditure`

`Incremental ROCE = change in operating profit after tax ÷ incremental capital employed`

Interpret the numbers rather than merely reproducing them:

- Is growth driven by volume, price, mix, acquisition or accounting effects?
- Are margins stable, cyclical or temporarily distorted?
- Does reported profit convert into cash over a multi-year period?
- If cash conversion is weak, is the cause receivables, inventory, capex, customer advances or something else?
- Is capex productive, and when should it begin contributing?
- Is return on capital improving or being diluted by expansion?

### Financial Transmission Chain — Is Growth Creating Value?

Do not analyse revenue, margins, profit, cash flow and ROCE as independent numbers. Trace how operating growth travels through the complete economic system:

`Demand/orders → volume and revenue → pricing/product mix and operating leverage → OPM → PAT → CFO → FCF → ROCE and shareholder value`

Build the following five-year trend table:

| Metric | FY-4 | FY-3 | FY-2 | FY-1 | Latest/TTM | Direction and explanation |
|---|---:|---:|---:|---:|---:|---|
| Revenue growth | | | | | | |
| Operating profit margin | | | | | | |
| PAT margin | | | | | | |
| CFO/PAT | | | | | | |
| Free cash flow | | | | | | |
| ROCE | | | | | | |
| Asset turnover | | | | | | |
| Working-capital days | | | | | | |

Answer explicitly:

1. Is PAT growing faster than, in line with, or slower than revenue? Explain the bridge.
2. Is margin improvement caused by genuine pricing power, superior product mix, operating leverage, temporary raw-material benefits, subsidies or accounting effects?
3. Does the alleged moat appear in measurable evidence such as resilient peer-leading margins, pricing power, customer retention, efficient working capital, asset turns or incremental ROCE?
4. Is PAT converting into CFO over a three-to-five-year period?
5. If CFO is not converting into FCF, is capex building a valuable future earnings engine or merely sustaining the existing business?
6. Is ROCE improving because of higher NOPAT margin, better capital turnover, lower working-capital intensity or a combination of these?
7. If ROCE is falling, is it a temporary pre-utilisation effect from recent capacity or a structural decline in capital efficiency?
8. Are the trends improving sequentially even if the absolute metrics are not yet large-cap quality?

Decompose ROCE conceptually as:

`ROCE ≈ NOPAT margin × capital turnover`

A defensible moat should normally appear through at least one of the following over a full business cycle:

- superior or more resilient margins than relevant peers,
- ability to pass through input-cost inflation,
- improving product mix,
- higher asset utilisation or asset turnover,
- lower working-capital intensity,
- high incremental ROCE, or
- consistent conversion of accounting profit into cash.

Do not insist that OPM and ROCE improve every single year. During a credible expansion, capital employed may rise before revenue and profit, temporarily depressing FCF and ROCE. Determine whether utilisation, margins, cash conversion and incremental returns are moving in the expected direction within a reasonable timeline.

Conclude with one classification:

- **Profitable, cash-generative, value-creating growth**
- **Profitable growth, but cash conversion still pending**
- **Credible expansion phase with temporarily suppressed FCF/ROCE**
- **Revenue growth without adequate economic value creation**
- **Cyclical improvement incorrectly appearing as structural growth**

Do not automatically penalise negative free cash flow during expansion. Determine whether the expenditure is productive, funded safely and supported by demand.

Provide:

- **Financial quality score:** /10
- **Cash-flow quality:** Weak / Acceptable / Strong
- **Primary accounting or working-capital concern:** [one statement]

## Step 4 — Management Capability, Governance and Survival

Evaluate management on both **capability** and **honesty**.

### Capability

- Compare historical guidance with actual delivery.
- Examine capacity commissioning, utilisation ramp-up and project execution.
- Assess capital allocation, acquisitions and diversification.
- Determine whether management has navigated previous downturns.
- Examine succession, professional management depth and key-person dependence.

Create a **Guidance versus Delivery** table with date, promise, deadline, actual outcome and verdict.

### Governance and insider behaviour

- Promoter ownership trend and pledging
- Genuine open-market purchases versus warrants or allotted shares
- Insider selling and reasons given
- Equity dilution, warrants and ESOPs
- Related-party transactions
- Auditor changes, qualifications or delayed filings
- Promoter remuneration and loans/advances
- Regulatory disputes or material contingent liabilities

### Financial survival

Examine:

- Debt/equity and net debt/EBITDA
- Interest coverage
- Short-term versus long-term borrowing
- Repayment schedule and refinancing dependence
- Working-capital borrowing
- Liquidity and unused facilities
- Ability to withstand a 20–30% revenue decline or project delay

Do not impose a universal “debt-free” or “current ratio above 1” rule. Judge leverage relative to cash-flow stability, industry economics and the return expected from borrowed capital.

Provide:

- **Management capability score:** /10
- **Governance/trust score:** /10
- **Balance-sheet resilience:** Weak / Adequate / Strong
- **Good-student test:** Can capable management survive bad weather? Explain in 3–5 sentences.

## Step 5 — Growth Scenarios and Valuation

Separate historical performance from what the current price requires.

Build bear, base and bull scenarios for the selected investment horizon. State explicit assumptions for:

- Revenue or volume growth
- Capacity utilisation
- Pricing/product mix
- Operating margin
- Interest and tax
- EPS or free cash flow
- Reasonable exit valuation multiple

Present:

| Scenario | Probability | Key assumptions | Estimated earnings | Exit multiple | Implied value/return |
|---|---:|---|---:|---:|---:|
| Bear | | | | | |
| Base | | | | | |
| Bull | | | | | |

Use valuation methods appropriate to the stock category:

- Fast grower/stalwart: forward P/E, PEG, EV/EBITDA and earnings yield
- Cyclical: mid-cycle earnings, EV/EBITDA, replacement cost and cycle position
- Turnaround: survival value, normalised earnings and catalyst-based scenarios
- Asset play: conservative asset value net of debt, tax and unlocking costs
- Financial company: price/book, ROE, asset quality and appropriate sector metrics

Compare the current valuation with:

- Its own historical range
- Relevant peers
- Sustainable growth and return on capital
- The multiple already embedded in the market price

Reverse-engineer expectations where possible: estimate the revenue, margin or EPS growth required to justify the present valuation.

Do not assume rerating in the base case without a specific catalyst. Show whether earnings growth alone can provide an acceptable return.

Provide:

- **Valuation attractiveness score:** /10
- **Expectations embedded in price:** Low / Fair / Demanding / Extreme
- **Margin of safety:** None / Thin / Reasonable / High

## Step 6 — Investment Thesis, Monitoring and Kill Conditions

Write the complete thesis in this structure:

### The two-minute story

In 150–250 words explain:

1. what the company does,
2. why demand should grow,
3. why this company can capture it,
4. how that growth reaches earnings and cash flow,
5. what the market may be underestimating, and
6. what could invalidate the thesis.

### Evidence ladder

Classify each thesis component as:

- **Proven:** visible in reported orders, revenue, utilisation or cash flow
- **Emerging:** supported by early evidence but not fully reflected in earnings
- **Promised:** based mainly on management guidance
- **Speculative:** based on market narrative or unverified assumptions

### Catalysts

List near-term and medium-term catalysts with expected timing. Distinguish operational catalysts from stock-price triggers.

### Monitoring dashboard

List 5–8 quarterly indicators to track, including a threshold or direction that would be positive or negative.

### Kill conditions

Specify at least three observable developments that would invalidate the thesis, such as:

- Demand or order growth materially failing
- Capacity ramp-up repeatedly delayed
- Cash conversion structurally deteriorating
- Debt rising without corresponding earnings
- Promoter pledge, unexplained dilution or governance breach
- Management repeatedly missing stated commitments
- Valuation becoming disconnected from realistic earnings

# REQUIRED FINAL OUTPUT

Finish with the following sections.

## A. Executive Verdict

- **Lynch category:**
- **Company quality:** /10
- **Demand/runway:** /10
- **Management capability:** /10
- **Governance/trust:** /10
- **Financial resilience:** /10
- **Valuation:** /10
- **Overall evidence-weighted score:** /10
- **Research status:** Reject / Watchlist / Accumulate only on evidence / Investable at suitable price / Existing thesis intact
- **Confidence:** Low / Medium / High

Do not calculate the overall score as a blind arithmetic average. Weight weak governance and financial-survival risks more heavily because they can permanently impair capital.

## B. Demand–Management Matrix

Place the company in one quadrant and explain why:

| | Weak/Unproven management | Capable/credible management |
|---|---|---|
| Weak demand/runway | Avoid | Value trap or limited upside |
| Strong demand/runway | Story stock; execution risk | Most attractive cheetah zone |

## C. Bull Case versus Bear Case

Give the five strongest evidence-based arguments on each side. Steelman the bear case; do not create weak objections merely to appear balanced.

## D. Yellow Flags versus Red Flags

Separate temporary, monitorable imperfections from thesis-threatening problems. State what evidence would upgrade or worsen each flag.

## E. What Must Happen Next

List the three most important developments required over the next 2–4 quarters for the thesis to strengthen.

## F. One-Line Family Explanation

Explain the company and investment thesis in one plain-language sentence suitable for a family WhatsApp group. Do not use investment jargon.

## G. Source List

Provide links to the most important primary and secondary sources, with publication dates and the information taken from each.

## ANALYTICAL DISCIPLINE

- Never treat a rising share price as proof of improving fundamentals.
- Never use management guidance as if it were achieved revenue.
- Never confuse order book with revenue or revenue with cash flow.
- Never extrapolate one exceptional quarter indefinitely.
- Never call a stock cheap solely because its trailing P/E is low.
- For cyclicals, estimate normalised earnings rather than using peak earnings.
- For high-P/E companies, explicitly calculate what growth the price demands.
- Prefer ranges and scenarios over false precision.
- State clearly when evidence is insufficient.
- Do not issue a personalised buy/sell instruction. Produce an evidence-based research conclusion with risks, valuation conditions and monitoring triggers.

The final answer must be analytical but readable, using tables where comparisons are dense. Avoid generic praise such as “strong fundamentals” unless immediately supported by evidence.
```

## Disclaimer

This playbook is for educational research. It is not personalised investment advice. Verify source data, assumptions, and conclusions independently before making investment decisions.
