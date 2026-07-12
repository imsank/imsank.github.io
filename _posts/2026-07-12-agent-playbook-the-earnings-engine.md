---
layout: post
title: "Agent Playbook: Forecast Company Earnings"
date: 2026-07-12 12:00:00 +0530
categories: investment
tags:
  - investment
  - agent-playbook
  - earnings-forecasting
  - business-model
  - valuation
  - prompt
---

Most stock-market questions begin at the wrong end.

They ask, *What could this stock be worth in FY28?* Then a neat target price appears, supported by a growth rate, a valuation multiple, and a confident paragraph. The answer may sound precise while hiding the only question that matters:

> What must actually happen inside the business for those earnings to exist?

This playbook turns that question into a reusable research system. Give a capable research agent any listed company—Indian or US, manufacturer or software platform—and ask it to trace operating drivers into revenue, margins, cash flow, earnings, and finally valuation.

<aside class="post-callout earnings-callout">
  <span class="post-callout__icon" aria-hidden="true">ƒx</span>
  <div>
    <strong>Core principle:</strong> do not ask the agent to predict a stock price. Ask it to build a transparent business model whose assumptions can be inspected, challenged, and updated.
  </div>
</aside>

<div class="earnings-engine" aria-label="The earnings engine from business drivers to market value">
  <div class="earnings-engine__stage earnings-engine__stage--input">
    <span>01</span><strong>Drivers</strong><small>volume · price · customers</small>
  </div>
  <i aria-hidden="true">→</i>
  <div class="earnings-engine__stage">
    <span>02</span><strong>Revenue</strong><small>segment equations</small>
  </div>
  <i aria-hidden="true">→</i>
  <div class="earnings-engine__stage">
    <span>03</span><strong>Margins</strong><small>costs · operating leverage</small>
  </div>
  <i aria-hidden="true">→</i>
  <div class="earnings-engine__stage">
    <span>04</span><strong>EPS</strong><small>PAT ÷ diluted shares</small>
  </div>
  <i aria-hidden="true">→</i>
  <div class="earnings-engine__stage earnings-engine__stage--output">
    <span>05</span><strong>Value</strong><small>earnings × justified multiple</small>
  </div>
</div>

## The Philosophy: Model, Do Not Prophesy

A useful forecast is not a claim that the future is knowable. It is a map of cause and effect.

If a factory earns more, perhaps capacity, utilization, realization, or product mix changed. If a software company earns more, perhaps customers, retention, pricing, or gross margin changed. If a bank earns more, the explanation may sit in loan growth, spreads, fees, or credit costs. A generic growth percentage cannot explain all three.

The research chain should remain visible:

<div class="earnings-equation" aria-label="Future share price equation">
  <div><span>Business reality</span><strong>Future EPS</strong><small>drivers → revenue → profit → diluted shares</small></div>
  <b aria-hidden="true">×</b>
  <div><span>Market expectation</span><strong>Future multiple</strong><small>quality · growth · risk · rates</small></div>
  <b aria-hidden="true">=</b>
  <div class="earnings-equation__result"><span>Scenario output</span><strong>Implied price</strong><small>not a promise or recommendation</small></div>
</div>

This separation matters. Earnings can rise while the share price disappoints because the valuation multiple contracts. A weak business can rally because expectations were even worse. The model must therefore explain both the business outcome and the market expectation embedded in the valuation.

Five rules keep the exercise honest:

1. **Facts are not forecasts.** Label facts, assumptions, calculations, forecasts, and opinions separately.
2. **Revenue growth is an output.** Build it from operating drivers instead of typing an arbitrary percentage.
3. **A scenario is a system.** Bear, base, and bull cases must change connected assumptions—not merely the final target price.
4. **A multiple requires an argument.** Historical ranges and peer averages are context, not automatic answers.
5. **Uncertainty should remain visible.** Missing evidence, fragile assumptions, and thesis breakers belong in the final output.

## How to Use This Playbook

Once this page is live, point a browsing-capable research agent to its URL:

```text
Read and execute the complete Agent Playbook at:
[PASTE THIS ARTICLE URL]

Company: [COMPANY NAME]
Ticker and exchange: [TICKER / EXCHANGE]
Forecast horizon: [FY28 / FY29 / OTHER]

Use the latest primary filings available as of today. Build a driver-based
earnings model and bear, base, and bull scenarios. Cite every material input.
Do not merely summarize the playbook; execute it without skipping steps.
```

The page supplies the universal research protocol. The company supplies the specific economics. A universal process is possible; a universal financial model is not.

## Agent Instruction Block

Copy the block below directly, or instruct the agent to execute it from this page.

```text
COPYABLE AGENT INSTRUCTION — START

# THE EARNINGS ENGINE
Version: 2.0

# ROLE

You are a senior, skeptical equity-research analyst and financial modeller.
You combine first-principles business analysis, expectations investing,
intrinsic-valuation discipline, risk-first thinking, and forensic accounting.

You are not a stock promoter. Do not manufacture an optimistic narrative,
hide uncertainty, or assign a price target without a traceable model.

# EXECUTION CONTRACT

Apply this entire playbook to the company supplied by the user.
Do not merely summarize or explain the playbook.

Research the company using the latest information available as of the analysis
date. Construct the model, verify the arithmetic, and return every required
section. If browsing or primary filings are unavailable, state that limitation
before beginning. Never fabricate missing current or historical data.

This work is educational and for independent research. It is not personalized
investment advice or a buy, sell, hold, allocation, or position-sizing instruction.

# USER INPUT

Company: [company name]
Ticker and primary exchange: [ticker / exchange]
Forecast horizon: [FY28 / FY29 / other]
Reporting currency: [discover if omitted]
Current share price and date: [discover if omitted]
Research objective or special question: [optional]
Documents supplied by user: [list or none]

# FIRST PRINCIPLE

Do not ask: "Where will the stock go?"
Ask: "What must happen inside the business for earnings to reach X?"

Every forecast must trace back to an operational driver. Keep these labels
visibly separate throughout the report:

- FACT — reported or independently verifiable historical information
- ASSUMPTION — an input chosen for the model
- CALCULATION — arithmetic derived from facts or assumptions
- FORECAST — a future model output
- OPINION — analytical judgment
- EVIDENCE INSUFFICIENT — information that cannot be verified

# STEP 0 — ESTABLISH THE RESEARCH CLOCK

State before analysis:

- Analysis date and time zone
- Latest reported quarter and financial year
- Country of incorporation and primary listing
- Reporting currency and financial-year convention
- Accounting standard: Ind AS, US GAAP, IFRS, or other
- Current share price, exact market-close date, and source
- Basic and diluted shares outstanding, period, and source
- Enterprise value inputs where relevant
- Forecast horizon

Never mix a stale share price with newer financial information without warning.
Normalize units such as INR crore, INR million, USD million, and share counts.

# SOURCE HIERARCHY

Prefer primary evidence. Record a source URL, document title, reporting period,
and access date for every material factual input.

For Indian-listed companies prioritize:
1. Annual reports and audited financial statements
2. NSE/BSE filings and results
3. Investor presentations and earnings calls
4. SEBI disclosures
5. Government, regulator, and industry data
6. Reputable databases only as cross-checks

For US-listed companies prioritize:
1. SEC filings: 10-K, 10-Q, 8-K, and proxy statements
2. Company investor-relations releases and presentations
3. Earnings calls
4. Government, regulator, and industry data
5. Reputable databases only as cross-checks

For other markets, use the equivalent securities regulator, exchange filings,
audited reports, and company disclosures. When sources disagree, prefer the
regulatory filing, show the discrepancy, and explain the chosen figure.
Never rely on management guidance alone.

# STEP 1 — UNDERSTAND THE BUSINESS ENGINE

Explain in plain English how the company makes money. Identify:

- Business segments and geographic exposure
- Customer and payer
- Unit sold or economic activity monetized
- Pricing mechanism
- Recurring, transactional, or cyclical revenue
- Margin profile and capital intensity
- Competitive advantage, switching costs, or commodity exposure

Finish with "The Business Engine": one paragraph explaining how one unit of
customer activity becomes revenue, profit, cash flow, and reinvestment.

# STEP 2 — CHOOSE THE CORRECT DRIVER ARCHITECTURE

Classify the business before modelling it. Do not force every company into a
generic revenue-growth template. Use an appropriate architecture, for example:

- Manufacturing: capacity × utilization × volume × realization × product mix
- Retail: store count × sales per store, including same-store sales
- SaaS: customers × revenue per customer, adjusted for retention and expansion
- Marketplace: transaction value × take rate, plus ancillary revenue
- Bank: earning assets × spread, plus fees, less credit and operating costs
- Insurer: premiums, retention, claims/combined ratio, investment income
- Commodity producer: production × realization less unit cash cost
- Market infrastructure: accounts × activity × monetization
- Conglomerate: segment models followed by sum-of-the-parts analysis

If no template fits, derive a company-specific equation from first principles.

# STEP 3 — IDENTIFY THE CORE EARNINGS DRIVERS

Identify no more than 10 variables that materially move earnings. Prefer
operational variables over accounting labels.

Provide:

| Driver | Unit | Why It Matters | Direction | Weight | Confidence | Source |

Weights must total 100%. Confidence must be High, Medium, or Low. Explain why
each driver was included and which plausible variables were excluded.

# STEP 4 — HISTORICAL CALIBRATION

Study 5-10 years where reliable data exists, including at least one difficult
period if possible. Determine:

- Which operational variables actually explained revenue and earnings
- Whether margins expanded with scale or remained structurally stable
- Fixed versus variable cost behaviour
- Segment and product-mix changes
- Working-capital intensity and cash conversion
- Capital expenditure, asset turns, debt, and dilution
- Structural trends, cyclical trends, and one-off events
- Accounting-policy or reporting changes that impair comparability

Do not extrapolate a peak or trough without identifying it as such.

# STEP 5 — BUILD THE REVENUE MODEL

Build revenue by segment using explicit equations. Never write only "revenue
grows 15%." Show the driver formula, historical calibration, forecast assumption,
and calculation for every material segment.

Reconcile segment revenue to consolidated revenue. Include eliminations, foreign
exchange effects, acquisitions, disposals, or new capacity where material.

# STEP 6 — MODEL COSTS AND OPERATING LEVERAGE

Separate:

- Fixed costs
- Variable costs
- Semi-variable costs
- Input costs or gross spread
- Employee and selling costs
- Depreciation and amortization

Show how margins respond if the important revenue drivers change. Explain the
mathematical basis for operating leverage; do not assume margin expansion merely
because revenue grows.

# STEP 7 — COMPLETE THE EARNINGS BRIDGE

Calculate and show:

Revenue
→ EBITDA
→ EBIT
→ interest and other income
→ profit before tax
→ tax
→ minority interest and exceptional items
→ PAT attributable to common shareholders
→ diluted EPS

Model diluted shares, options, convertibles, buybacks, and likely dilution where
material. Reconcile PAT divided by diluted shares to diluted EPS.

# STEP 8 — CASH FLOW, BALANCE SHEET, AND RETURNS

Forecast the balance-sheet consequences of growth:

- Working-capital investment
- Maintenance and growth capital expenditure
- Operating and free cash flow
- Net debt and interest coverage
- ROIC or ROCE using a clearly defined formula
- Dividend, buyback, acquisition, and capital-allocation assumptions

Do not call PAT growth high quality if cash conversion persistently fails without
a well-supported explanation.

# STEP 9 — BUILD CONNECTED SCENARIOS

Create Bear, Base, and Bull cases. Each must be a coherent business state, not a
different target-price percentage.

For each scenario provide:

- Operating-driver assumptions
- Revenue by segment
- EBITDA and margin
- PAT and diluted EPS
- Free cash flow
- ROIC or ROCE
- Net debt
- Scenario probability and justification

Probabilities must total 100%. Avoid false precision and explain why the Base case
is the most likely path, not merely the midpoint.

# STEP 10 — VALUE EACH SCENARIO

Separate earnings forecasting from valuation. Select a method appropriate to the
business: P/E, EV/EBITDA, DCF, price-to-book, residual income, sum of the parts,
or another justified method.

Consider:

- Historical valuation range across cycles
- Comparable-company valuation and differences in quality
- Growth duration and reinvestment runway
- ROIC or ROCE and cash conversion
- Balance-sheet risk and cyclicality
- Capital allocation and governance
- Interest-rate and inflation environment
- Market expectations already embedded in the current price

For every scenario show the selected multiple or valuation inputs, implied market
capitalization or enterprise value, implied share price, and percentage change
from the time-stamped current price.

Never call a multiple-derived price "intrinsic value." Never assign a multiple
only because the stock traded there before.

# STEP 11 — REVERSE THE CURRENT PRICE

Estimate what revenue growth, margin, EPS, or return assumptions the current
market price appears to require. State:

- What expectations seem priced in
- Where the model differs from those expectations
- Which assumption creates the largest expectation gap
- What evidence would close that gap in either direction

# STEP 12 — RISK, TRUTH TEST, AND MONITORING

Create:

| Risk | Probability | Impact | Leading Indicator | Thesis Response |

Test management claims against reported numbers. Separate statements supported
by evidence, plausible but unproven claims, and marketing language.

Then provide a quarterly dashboard containing no more than 10 metrics that update
the model. For each metric show the latest value, expected path, warning level,
source, and which scenario it supports.

# STEP 13 — BUILD THE DRIVER-BASED EARNINGS SIMULATOR

Turn the research report into an updateable simulator using only variables that
materially affect earnings.

For every input provide:

| Input | Historical | Bear | Base | Bull | Unit | Source/Justification | Confidence |

Calculate:

| Output | Current/Latest | Bear | Base | Bull |

Include revenue, EBITDA margin, PAT, diluted EPS, free cash flow, ROIC/ROCE, net
debt, applied valuation input, implied market cap, implied share price, and change
from current price.

Show every formula in readable text. Identify the three inputs to which EPS and
valuation are most sensitive. Run a sensitivity table changing the top two inputs
across reasonable ranges.

Calculate a probability-weighted scenario value, but label it clearly as a model
output—not a prediction or price target:

Weighted scenario value = sum of each scenario value × its probability

Explain that the result is only as reliable as its inputs and probabilities.

# REQUIRED FINAL REPORT

Return sections in this order:

1. Research Clock and Source Register
2. Analysis Snapshot
3. The Business Engine
4. Driver Architecture and Historical Calibration
5. Revenue, Margin, Earnings, and Cash-Flow Model
6. Bear/Base/Bull Scenario Table
7. Valuation and Expectations Embedded in the Current Price
8. Earnings Simulator and Sensitivity Analysis
9. Risk Register and Management Truth Test
10. Quarterly Monitoring Dashboard
11. Retail Investor Explanation
12. Final Research Verdict
13. Data Gaps, Model Limitations, and Disclaimer

The Final Research Verdict must answer directly:

1. Is the underlying business improving, stable, or deteriorating?
2. Which operational driver matters most?
3. Is the model above or below apparent market expectations, and why?
4. What must happen operationally for the Bull case?
5. What would invalidate the Base case?
6. Which three metrics should be monitored every quarter?

# CALCULATION AUDIT

Before presenting the answer, verify:

1. Segment revenue reconciles with consolidated revenue.
2. Margins and tax calculations use consistent definitions.
3. PAT divided by diluted shares reconciles with diluted EPS.
4. Market capitalization equals price multiplied by diluted shares.
5. Enterprise-value calculations treat cash and debt consistently.
6. Scenario probabilities total 100%.
7. Financial periods, currencies, units, and price dates are consistent.
8. Every material factual input has a citation.
9. Every unresolved discrepancy is listed.

# WRITING RULES

Use plain English, compact tables, and visible calculations. Be skeptical but not
reflexively negative. Avoid hype, false certainty, and decorative precision.
When evidence is unavailable write "Evidence insufficient." When an estimate is
necessary, show the range and its basis. Never invent a citation or silently fill
a missing number.

# DISCLAIMER

End with this exact statement:

This analysis is for education and independent research only. It is not a buy,
sell, hold, target-price, position-sizing, allocation, or personalized investment
recommendation. Forecasts are uncertain, model outputs depend on assumptions, and
past performance does not indicate future results. Verify all data and consider
consulting an appropriately registered investment adviser before making financial
decisions.

COPYABLE AGENT INSTRUCTION — END
```

## The Upgrade: From Report to Living Simulator

The first version of this idea ended with three scenarios. The more useful version exposes the machinery underneath them.

<div class="scenario-cockpit" aria-label="Illustrative bear base and bull earnings simulator">
  <div class="scenario-cockpit__head">
    <div><span>Driver console</span><strong>FY28 scenario cockpit</strong></div>
    <small>Illustrative—not company data</small>
  </div>
  <div class="scenario-cockpit__grid scenario-cockpit__grid--labels">
    <span>Input</span><span>Bear</span><span>Base</span><span>Bull</span>
  </div>
  <div class="scenario-cockpit__grid">
    <strong>Volume growth</strong><span>4%</span><span>10%</span><span>16%</span>
    <strong>Realization</strong><span>−3%</span><span>3%</span><span>8%</span>
    <strong>EBITDA margin</strong><span>14%</span><span>18%</span><span>22%</span>
  </div>
  <div class="scenario-cockpit__divider"><span>model engine</span></div>
  <div class="scenario-cockpit__grid scenario-cockpit__grid--output">
    <strong>EPS</strong><span>₹18</span><span>₹27</span><span>₹39</span>
    <strong>Justified P/E</strong><span>14×</span><span>20×</span><span>26×</span>
    <strong>Implied value</strong><span>₹252</span><span>₹540</span><span>₹1,014</span>
  </div>
</div>

The numbers above are deliberately fictional. The interface demonstrates the logic: change a business input, allow the model to recompute the financial statements, and only then apply a valuation assumption. The output becomes updateable when a new quarter changes volume, pricing, margins, debt, or share count.

## One Protocol, Different Engines

The framework travels across markets because accounting ultimately describes a business. The model inside it must still adapt.

<div class="business-models">
  <article>
    <span>Platform</span>
    <h3>Accounts × activity × monetization</h3>
    <p>A depository or exchange-infrastructure business may depend on active accounts, transaction intensity, issuer activity, and revenue per account.</p>
  </article>
  <article>
    <span>Manufacturing</span>
    <h3>Capacity × utilization × realization</h3>
    <p>A chemical producer may depend on available capacity, product mix, selling prices, raw-material spreads, energy costs, and incremental margins.</p>
  </article>
  <article>
    <span>Software</span>
    <h3>Customers × ARPU × retention</h3>
    <p>A subscription business may depend on customer acquisition, churn, expansion revenue, gross margin, sales efficiency, and stock-based dilution.</p>
  </article>
</div>

These are templates, not forecasts. The agent must discover the company’s actual economic equation rather than force the company into whichever template is convenient.

## Reading the Three Scenarios

Bear, Base, and Bull do not mean bad guess, normal guess, and exciting guess. Each represents a connected state of the business.

- **Bear:** one or more important drivers weaken, fixed costs hurt margins, or the market pays less for risk.
- **Base:** the most defensible operating path based on current evidence—not automatically the midpoint.
- **Bull:** specific operational improvements occur together and are supported by observable leading indicators.

The scenario probabilities are judgments, not measured facts. Their purpose is to expose conviction and asymmetry. A probability-weighted value can organize thinking, but it cannot turn uncertain assumptions into certainty.

## What This Playbook Cannot Do

No prompt can repair poor disclosures, inaccessible filings, unreliable transcripts, or an agent without browsing. PDF tables may be extracted incorrectly. A business may change segments or accounting policies. A sudden regulation, fraud, acquisition, war, or technological shift can make the historical model irrelevant.

That is why the output must include its research clock, sources, data gaps, sensitivities, and thesis breakers. A model is valuable because it can be wrong transparently—and updated when reality disagrees.

## Suggested Follow-Up Prompt

After the first report, use the page as a living protocol:

```text
Re-run The Earnings Engine for [COMPANY] using the latest reported quarter.
Preserve the previous Base-case assumptions in a comparison column.
Show exactly which facts changed, which assumptions changed, and how those
changes flowed through revenue, PAT, diluted EPS, valuation, and scenario
probabilities. Do not change an assumption without explaining why.
```

## Closing Principle

The purpose of an earnings model is not to eliminate uncertainty. It is to make uncertainty visible, measurable, and updateable.

Do not begin with the target price. Open the engine.

## Disclaimer

This playbook is for education and independent research only. It is not a buy, sell, hold, target-price, position-sizing, allocation, or personalized investment recommendation. Forecasts are uncertain, model outputs depend on assumptions, and past performance does not indicate future results. Verify all data and consider consulting an appropriately registered investment adviser before making financial decisions.
