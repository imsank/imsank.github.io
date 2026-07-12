---
layout: post
title: "Agent Playbook: Calculate Growth Priced Into a Stock"
date: 2026-07-12 12:30:00 +0530
categories: investment
tags:
  - investment
  - agent-playbook
  - reverse-valuation
  - market-expectations
  - valuation-calculator
  - prompt
---

Every stock price contains a forecast, even when nobody writes it down.

The market capitalization of a company, combined with an assumed required return and a future valuation multiple, implies a level of earnings the business must eventually produce. Reverse valuation works backward from today’s price to reveal that hidden expectation.

> The useful question is not only, *What is this company worth?* It is also, *What must this company deliver for today’s valuation to make sense?*

<aside class="post-callout expectations-callout">
  <span class="post-callout__icon" aria-hidden="true">↺</span>
  <div>
    <strong>Expectation analysis:</strong> this playbook does not produce a magical fair value. It calculates the growth implied by selected assumptions, then asks whether the business evidence can support that future.
  </div>
</aside>

<div class="reverse-flow" aria-label="Reverse valuation moves from today's market value backward to operational requirements">
  <div class="reverse-flow__node reverse-flow__node--price"><span>Today</span><strong>Market value</strong><small>the observed price</small></div>
  <i aria-hidden="true">←</i>
  <div class="reverse-flow__node"><span>Valuation</span><strong>Exit multiple</strong><small>what the market may pay</small></div>
  <i aria-hidden="true">←</i>
  <div class="reverse-flow__node"><span>Required</span><strong>Future PAT</strong><small>earnings needed at exit</small></div>
  <i aria-hidden="true">←</i>
  <div class="reverse-flow__node reverse-flow__node--engine"><span>Reality</span><strong>Business drivers</strong><small>what must actually happen</small></div>
</div>

## Forward Valuation, Played in Reverse

A conventional earnings model begins with customers, volumes, prices, costs, and margins. Reverse valuation begins with the market’s answer and solves for the missing business result.

For a profitable company valued using P/E:

<div class="expectations-formula" aria-label="Reverse valuation formulas">
  <div><span>Required future PAT</span><strong>Market cap × (1 + discount rate)<sup>years</sup> ÷ exit P/E</strong></div>
  <div><span>Implied PAT CAGR</span><strong>(Required future PAT ÷ current PAT)<sup>1/years</sup> − 1</strong></div>
</div>

The result is conditional. Change the discount rate or exit multiple and the implied growth changes. Use normalized earnings, inconsistent periods, or a peak-cycle profit and the answer may become misleading. The calculation is therefore the beginning of research, not its conclusion.

## The Lesson Behind the Calculator

The original spark for the `5× Sales` reverse-valuation example came from the video below. Watch it first for the intuition, then use the calculator to change the assumptions and inspect how much growth the current valuation requires.

<div class="expectations-video">
  <iframe src="https://www.youtube-nocookie.com/embed/xbnStieZ0ks?start=4" title="Reverse valuation lesson referenced in this playbook" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

<p class="expectations-video__source"><a href="https://www.youtube.com/watch?v=xbnStieZ0ks&t=4s">Open the original video on YouTube</a></p>

## Interactive Expectations Engine

Enter figures in one consistent unit—₹ crore, $ million, or another unit. The calculator does not fetch or transmit data. It performs all calculations in your browser.

<section class="expectations-lab" id="expectations-lab" aria-labelledby="expectations-lab-title">
  <div class="expectations-lab__top">
    <div>
      <p class="expectations-kicker">Reverse valuation calculator</p>
      <h3 id="expectations-lab-title">What earnings growth is today’s price assuming?</h3>
    </div>
    <div class="expectations-selectors">
      <label class="expectations-unit">Valuation model
        <select id="expectations-mode">
          <option value="earnings">PAT × P/E</option>
          <option value="revenue">Revenue × P/S</option>
        </select>
      </label>
      <label class="expectations-unit">Display unit
        <select id="expectations-unit">
          <option value="₹ crore">₹ crore</option>
          <option value="$ million">$ million</option>
          <option value="unit">Other unit</option>
        </select>
      </label>
    </div>
  </div>

  <form class="expectations-inputs" id="expectations-form" novalidate>
    <label>Current market cap<input id="expectations-market-cap" type="number" min="0.01" step="any" value="10000"></label>
    <label><span id="expectations-metric-label">Normalized PAT</span><input id="expectations-pat" type="number" min="0.01" step="any" value="300"></label>
    <label>Forecast period<input id="expectations-years" type="number" min="1" max="30" step="1" value="10"><small>years</small></label>
    <label>Discount rate<input id="expectations-discount" type="number" min="0" max="50" step="0.5" value="12"><small>%</small></label>
    <label><span id="expectations-multiple-label">Exit P/E</span><input id="expectations-exit-pe" type="number" min="0.1" max="100" step="0.5" value="20"><small>×</small></label>
    <label><span id="expectations-growth-label">Your expected PAT CAGR</span><input id="expectations-user-growth" type="number" min="-50" max="100" step="0.5" value="13"><small>%</small></label>
  </form>

  <p class="expectations-model-note" id="expectations-model-note">Use normalized earnings for a stable, profitable company.</p>
  <p class="expectations-error" id="expectations-error" role="alert" hidden>Enter positive values for market cap, the selected financial metric, years, and exit multiple.</p>

  <div class="expectations-results" aria-live="polite">
    <div><span id="result-current-multiple-label">Current P/E</span><strong id="result-current-pe">—</strong></div>
    <div><span id="result-required-metric-label">Required future PAT</span><strong id="result-required-pat">—</strong></div>
    <div class="expectations-results__focus"><span id="result-implied-growth-label">Market-implied PAT CAGR</span><strong id="result-implied-growth">—</strong></div>
  </div>

  <div class="expectation-gap">
    <div class="expectation-gap__head">
      <span>Your forecast versus market-implied growth</span>
      <strong id="result-gap-label">—</strong>
    </div>
    <div class="expectation-gap__track" aria-hidden="true">
      <span class="expectation-gap__user" id="gap-user-bar"></span>
      <span class="expectation-gap__market" id="gap-market-bar"></span>
    </div>
    <div class="expectation-gap__legend"><span><i></i>Your expected CAGR</span><span><i></i>Market-implied CAGR</span></div>
    <p id="result-interpretation">—</p>
  </div>

  <div class="expectations-scenario">
    <div><span id="result-user-future-label">Future PAT under your forecast</span><strong id="result-user-future-pat">—</strong></div>
    <div><span>Discounted value under your forecast</span><strong id="result-user-value">—</strong></div>
    <div><span>Difference from current market cap</span><strong id="result-user-upside">—</strong></div>
  </div>

  <div class="expectations-heatmap-wrap">
    <div class="expectations-heatmap__head">
      <div><span>Sensitivity map</span><strong id="heatmap-title">Implied PAT CAGR</strong></div>
      <small id="heatmap-description">Rows: discount rate · Columns: exit P/E</small>
    </div>
    <div class="expectations-heatmap" id="expectations-heatmap" role="table" aria-label="Implied PAT CAGR sensitivity by discount rate and exit P/E"></div>
  </div>
</section>

The defaults are illustrative, not company data. In `Revenue × P/S` mode, the calculator begins with the original framework’s illustrative assumptions of **5× Sales** and a **15% discount rate**. These are editable assumptions, not universal standards. Notice what the sensitivity map teaches: a higher required return or lower exit multiple forces the business to deliver more growth to justify the same market capitalization.

## Finding the Inputs

Use the latest primary filing available and record its date. For an Indian company, begin with NSE or BSE filings, the annual report, and quarterly results. Screener can help cross-check the figure. For a US company, begin with SEC filings and the company’s investor-relations page.

| Input | What to use | Common mistake |
|---|---|---|
| Market capitalization | Price × diluted shares on a stated date | Mixing today’s price with an old share count |
| Normalized PAT | TTM or a clearly stated financial year | Using a one-off gain or peak-cycle profit |
| Forecast period | A period long enough for the thesis to play out | Treating a distant estimate as more certain |
| Discount rate | Required annual return for the risk assumed | Choosing a low rate only to justify the price |
| Exit P/E | A defensible future multiple | Assuming today’s elevated multiple persists |
| Expected growth | A driver-based business forecast | Copying historical CAGR without explanation |

For a loss-making company, bank, insurer, commodity producer, or highly leveraged business, PAT × P/E may be the wrong architecture. The Agent Playbook below tells the researcher to choose an appropriate reverse-valuation method rather than force every company into this calculator.

## What the Result Can—and Cannot—Say

Suppose the calculator produces an implied PAT CAGR of 18%, while your driver-based forecast is 13%. That is a **negative expectation gap** of five percentage points. It means your assumptions support less growth than the selected valuation assumptions require.

It does not, by itself, prove the stock is overvalued. Perhaps the exit multiple is too low, the discount rate is too high, normalized PAT is understated, or your business forecast misses a new profit pool. Reverse valuation makes the disagreement visible so those questions can be researched.

## Agent Instruction Block

The calculator performs transparent arithmetic. The following prompt asks a browsing-capable agent to source the inputs, select the correct model, reverse-engineer expectations, and test them against business reality.

```text
COPYABLE AGENT INSTRUCTION — START

# REVERSE-ENGINEER THE GROWTH PRICED INTO A STOCK
The Expectations Engine — Version 2.0

# ROLE

You are a skeptical senior equity-research analyst specializing in reverse
valuation, market expectations, business quality, forensic accounting, and
probability-based investing.

Your objective is not to predict a stock price or promote a security. Your
objective is to answer:

"What future is already priced into today's market value, what must happen
inside the business for that future to occur, and how fragile are those
expectations?"

# EXECUTION CONTRACT

Apply this complete playbook to the company supplied by the user. Do not merely
summarize the instructions. Use the latest primary evidence available as of the
analysis date, cite every material factual input, show the mathematics, and
state all limitations.

If live browsing or primary filings are unavailable, say so before analysis and
ask the user to provide the required documents or figures. Never pretend to
fetch data. Never fabricate a number, source, quotation, or management claim.

This analysis is educational and for independent research. Do not give a buy,
sell, hold, target-price, allocation, or position-sizing instruction.

# USER INPUT

Company: [company name]
Ticker and exchange: [ticker / exchange]
Analysis horizon: [10 years or user choice]
Optional user assumptions: [discount rate, exit multiple, expected growth]
Documents supplied: [list or none]

# STEP 1 — ESTABLISH THE RESEARCH CLOCK

State:

- Analysis date and time zone
- Latest reported quarter and financial year
- Country, primary exchange, and reporting currency
- Accounting standard and financial-year convention
- Current share price, exact date, and source
- Basic and diluted shares, period, and source
- Current market capitalization and calculation
- Current enterprise value and calculation where relevant

Keep price dates, reporting periods, currencies, and units consistent.

# STEP 2 — USE PRIMARY SOURCES

For Indian-listed companies prioritize annual and quarterly reports, NSE/BSE
filings, investor-relations material, earnings calls, and SEBI disclosures.

For US-listed companies prioritize SEC 10-K, 10-Q, 8-K, proxy filings, company
investor relations, earnings releases, and calls.

For other markets use equivalent regulator and exchange filings. Use financial
databases only as cross-checks. When sources disagree, prefer the regulatory
filing, show the discrepancy, and explain the selected value.

Create a source register containing document, period, URL, access date, and
figures used.

# STEP 3 — UNDERSTAND THE BUSINESS BEFORE CHOOSING A MULTIPLE

Explain how the company makes money, its segments, customers, pricing, cost
structure, capital intensity, cyclicality, competitive position, and important
growth constraints.

Finish with one paragraph titled "The Business Engine" explaining how one unit
of customer activity becomes revenue, profit, cash flow, and reinvestment.

# STEP 4 — SELECT THE REVERSE-VALUATION ARCHITECTURE

Choose the metric and valuation method that fit the economics:

- Stable profitable company: normalized PAT/EPS and P/E
- Operating business with meaningful leverage: EBITDA and EV/EBITDA
- Cash-generative company: free cash flow and DCF or FCF yield
- Bank or lender: book value, earnings, ROE, and price-to-book
- Insurer: embedded value, value of new business, and relevant multiples
- Early-stage loss-making company: revenue or gross profit only with an
  explicit path to sustainable margins and cash flow
- Commodity producer: normalized mid-cycle earnings, not an unexamined
  peak/trough result
- Conglomerate: segment-level reverse valuation or sum of the parts

Explain why the selected architecture is appropriate. If evidence is
insufficient to normalize the metric, write "Evidence insufficient."

# STEP 5 — BUILD THE CURRENT FINANCIAL SNAPSHOT

Collect and cite:

- Revenue, EBITDA, EBIT, PAT, EPS, and free cash flow
- Normalized metric selected for reverse valuation
- Shares outstanding and dilution
- Cash, debt, and net debt
- Market capitalization and enterprise value
- Operating margin, ROE, ROCE/ROIC, and cash conversion
- Historical revenue and earnings growth across a full useful period
- Current valuation multiples

Separate reported facts from normalization adjustments. Show every adjustment.

# STEP 6 — JUSTIFY THE DISCOUNT RATE AND EXIT VALUATION

Do not use arbitrary defaults. Provide a reasonable range and a selected base
assumption using:

- Business and balance-sheet risk
- Cyclicality and earnings durability
- Growth duration and reinvestment opportunity
- Return on capital and cash conversion
- Governance and capital allocation
- Historical valuation across a cycle
- Comparable companies and their material differences
- Interest-rate and inflation environment

Explain why the future multiple could contract, remain stable, or expand. Never
assume today's multiple persists merely because it is observable.

For a loss-making/new-age company, include 5× Sales and a 15% discount rate as
an illustrative sensitivity case when relevant to the user's request. Do not
treat either as the correct base case without company-specific evidence.

# STEP 7 — SOLVE THE REVERSE VALUATION

For a PAT/P-E model calculate:

Required future PAT = Current market cap × (1 + discount rate)^years ÷ Exit P/E

Implied PAT CAGR = (Required future PAT ÷ Current normalized PAT)^(1/years) − 1

For an EV/EBITDA model, begin with current enterprise value, solve for required
future EBITDA, and model future net debt before translating future enterprise
value to equity value.

For a revenue/P-S model calculate:

Required future revenue = Current market cap × (1 + discount rate)^years ÷ Exit P/S

Implied revenue CAGR = (Required future revenue ÷ Current revenue)^(1/years) − 1

Then test whether the required revenue can plausibly lead to sustainable
margins, free cash flow, and shareholder value.

For revenue, book-value, FCF, or segment models, show the equivalent equations
and every bridge to equity value. Solve numerically when no closed-form solution
is appropriate. Do not guess the implied growth rate.

Show a calculation audit with substituted numbers, units, and intermediate
results so another analyst can reproduce it.

# STEP 8 — RUN SENSITIVITY ANALYSIS

Build at least three sensitivity tables:

1. Discount rate versus exit multiple, showing implied growth
2. Growth rate versus exit multiple, showing discounted present value
3. Normalized starting metric versus forecast horizon, showing implied growth

Highlight the selected base assumptions. Identify which assumption changes the
conclusion most. Avoid decorative precision.

# STEP 9 — DECOMPOSE IMPLIED GROWTH INTO BUSINESS DRIVERS

Do not leave the result as an abstract CAGR. Translate required growth into the
company's operating equation.

Examples:

- Manufacturing: capacity × utilization × volume × realization × margin
- Retail: store count × same-store sales × margin
- SaaS: customers × revenue per customer × retention × margin
- Marketplace: transaction value × take rate × margin
- Bank: earning assets × spread + fees − credit and operating costs
- Commodity: production × realization − unit cost

Estimate what capacity, customers, volumes, pricing, market share, margins,
capital expenditure, working capital, funding, and dilution would be required.
Label every future input as an assumption or forecast.

# STEP 10 — COMPARE EXPECTATIONS WITH EVIDENCE

Compare:

- Historical normalized growth
- Industry growth and addressable-market evidence
- Management plans and demonstrated execution
- Independent driver-based forecast
- Market-implied growth

Create an Expectations Gap table. Explain whether the evidence-based forecast
is above, near, or below the market-implied requirement and why. Do not convert
this comparison automatically into an overvalued/undervalued claim.

# STEP 11 — EXPECTATION FRAGILITY TEST

Identify every assumption that must remain true for today's valuation to be
supported. Test:

- Lower growth
- Margin compression
- Project delay or lower utilization
- Higher reinvestment or working-capital needs
- Dilution
- Higher discount rate
- Lower exit multiple
- Regulation, competition, technology, currency, or commodity shocks

Answer: if one important assumption fails, how much does the model output change?

Classify expectations only as:

- Very demanding
- Demanding
- Balanced
- Conservative
- Evidence insufficient

Explain the classification. Do not misuse "antifragile" to describe a merely
low valuation; business antifragility requires evidence that disorder improves
the company's long-term economics.

# STEP 12 — QUARTERLY REALITY DASHBOARD

List no more than 10 operational and financial metrics that reveal whether the
implied future is becoming more or less likely. For each show latest value,
required path, warning threshold, source, and update frequency.

# REQUIRED OUTPUT

Return sections in this order:

1. Executive Summary
2. Research Clock and Source Register
3. The Business Engine
4. Current Financial Snapshot and Normalization
5. Selected Valuation Architecture
6. Discount Rate and Exit-Multiple Rationale
7. Reverse-Valuation Calculation
8. Sensitivity Tables
9. Implied Growth Decomposed Into Business Drivers
10. Historical, Business-Supported, and Market-Implied Growth Comparison
11. Expectation Fragility Test
12. Quarterly Reality Dashboard
13. What Could Prove This Analysis Wrong?
14. Retail Investor Explanation
15. Data Gaps, Limitations, and Disclaimer

The retail explanation must state in plain language:

- What growth today's valuation appears to require
- Which assumptions create that result
- What the company must achieve operationally
- Which assumption is most fragile
- What evidence should be checked next quarter

# CALCULATION AUDIT

Before returning the report verify:

1. Market cap equals price × diluted shares.
2. Enterprise value treats debt and cash consistently.
3. PAT divided by diluted shares reconciles with EPS.
4. Reported and normalized figures are visibly separated.
5. Reverse-valuation arithmetic reproduces the current market value.
6. Currencies, units, periods, and dates are consistent.
7. Every material factual input has a primary citation.
8. Every unresolved discrepancy and unavailable input is disclosed.

# DISCLAIMER

End with this exact statement:

This analysis is for education and independent research only. It is not a buy,
sell, hold, target-price, position-sizing, allocation, or personalized investment
recommendation. Reverse valuation is highly sensitive to normalized earnings,
discount rates, exit multiples, forecast periods, and other assumptions. Verify
all data and consider consulting an appropriately registered investment adviser
before making financial decisions.

COPYABLE AGENT INSTRUCTION — END
```

## Use Both Playbooks Together

The earlier **Forecast Company Earnings** playbook moves forward from business drivers. This playbook moves backward from market value. Their disagreement is often the most informative result.

<div class="expectations-compare" aria-label="Comparison of fundamental forecast and market-implied growth">
  <div><span>Business model</span><strong>What can the company deliver?</strong><small>drivers → earnings forecast</small></div>
  <i aria-hidden="true">⇄</i>
  <div><span>Expectation model</span><strong>What must the company deliver?</strong><small>market value → implied growth</small></div>
  <b>Expectation gap</b>
</div>

If your fundamental model expects 13% PAT growth while the market-implied model requires 18%, the five-point gap becomes the research agenda. Is the market too optimistic, or does your model miss something? Which operational evidence would settle the disagreement?

## Suggested Invocation Prompt

```text
Read and execute the complete Agent Playbook at:
[PASTE THIS ARTICLE URL]

Company: [COMPANY]
Ticker and exchange: [TICKER / EXCHANGE]
Analysis horizon: [YEARS]

Use the latest primary filings. Select the appropriate reverse-valuation
architecture, calculate the growth implied by today's market value, decompose
it into business drivers, and test whether operating and industry evidence can
support it. Cite every material input and do not merely summarize the playbook.
```

## Closing Principle

Price is not just a number. It is a compressed story about future growth, profitability, risk, and time.

Reverse the price. Read the story. Then test whether the business can live it.

## Disclaimer

This playbook and calculator are for education and independent research only. They are not a buy, sell, hold, target-price, position-sizing, allocation, or personalized investment recommendation. Reverse valuation is highly sensitive to normalized earnings, discount rates, exit multiples, forecast periods, and other assumptions. Verify all data and consider consulting an appropriately registered investment adviser before making financial decisions.

<script>
(function () {
  var root = document.getElementById("expectations-lab");
  if (!root) return;

  var ids = ["market-cap", "pat", "years", "discount", "exit-pe", "user-growth"];
  var fields = {};
  ids.forEach(function (id) { fields[id] = document.getElementById("expectations-" + id); });
  var mode = document.getElementById("expectations-mode");
  var unit = document.getElementById("expectations-unit");
  var error = document.getElementById("expectations-error");
  var heatmap = document.getElementById("expectations-heatmap");

  function number(id) { return parseFloat(fields[id].value); }
  function fmt(value, digits) {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
  }
  function money(value) { return (unit.value === "unit" ? "" : unit.value.split(" ")[0]) + fmt(value, 1) + (unit.value === "unit" ? " units" : " " + unit.value.split(" ").slice(1).join(" ")); }
  function impliedGrowth(mcap, metric, years, discount, exitMultiple) {
    var required = mcap * Math.pow(1 + discount / 100, years) / exitMultiple;
    return (Math.pow(required / metric, 1 / years) - 1) * 100;
  }

  function labels() {
    return mode.value === "revenue" ? {
      metric: "Current revenue",
      shortMetric: "Revenue",
      multiple: "P/S",
      currentMultiple: "Current P/S",
      exitMultiple: "Exit P/S",
      growth: "Revenue CAGR"
    } : {
      metric: "Normalized PAT",
      shortMetric: "PAT",
      multiple: "P/E",
      currentMultiple: "Current P/E",
      exitMultiple: "Exit P/E",
      growth: "PAT CAGR"
    };
  }

  function renderHeatmap(mcap, metric, years, selectedDiscount, selectedMultiple, copy) {
    var discountRates = [selectedDiscount - 4, selectedDiscount - 2, selectedDiscount, selectedDiscount + 2, selectedDiscount + 4].map(function (v) { return Math.max(0, v); });
    var step = mode.value === "revenue" ? 1 : 4;
    var multiples = [selectedMultiple - step * 2, selectedMultiple - step, selectedMultiple, selectedMultiple + step, selectedMultiple + step * 2].map(function (v) { return Math.max(mode.value === "revenue" ? 0.5 : 1, v); });
    var values = [];
    discountRates.forEach(function (d) { multiples.forEach(function (multiple) { values.push(impliedGrowth(mcap, metric, years, d, multiple)); }); });
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var html = '<span class="heatmap-corner" role="columnheader">r \\ ' + copy.multiple + '</span>';
    multiples.forEach(function (multiple) { html += '<span class="heatmap-label" role="columnheader">' + fmt(multiple, 1) + '×</span>'; });
    discountRates.forEach(function (d, row) {
      html += '<span class="heatmap-label" role="rowheader">' + fmt(d, 1) + '%</span>';
      multiples.forEach(function (multiple, col) {
        var value = impliedGrowth(mcap, metric, years, d, multiple);
        var intensity = max === min ? 0.5 : (value - min) / (max - min);
        var selected = row === 2 && col === 2 ? " is-selected" : "";
        html += '<span class="heatmap-cell' + selected + '" role="cell" style="--heat-pct:' + (12 + intensity * 45).toFixed(1) + '%" aria-label="Discount rate ' + fmt(d, 1) + ' percent, exit ' + copy.multiple + ' ' + fmt(multiple, 1) + ', implied growth ' + fmt(value, 1) + ' percent">' + fmt(value, 1) + '%</span>';
      });
    });
    heatmap.innerHTML = html;
  }

  function update() {
    var mcap = number("market-cap");
    var metric = number("pat");
    var years = number("years");
    var discount = number("discount");
    var exitMultiple = number("exit-pe");
    var userGrowth = number("user-growth");
    var copy = labels();
    var valid = [mcap, metric, years, exitMultiple].every(function (v) { return Number.isFinite(v) && v > 0; }) && Number.isFinite(discount) && Number.isFinite(userGrowth);
    error.hidden = valid;
    if (!valid) return;

    var currentMultiple = mcap / metric;
    var requiredMetric = mcap * Math.pow(1 + discount / 100, years) / exitMultiple;
    var implied = impliedGrowth(mcap, metric, years, discount, exitMultiple);
    var userFutureMetric = metric * Math.pow(1 + userGrowth / 100, years);
    var userFutureMcap = userFutureMetric * exitMultiple;
    var userValue = userFutureMcap / Math.pow(1 + discount / 100, years);
    var difference = (userValue / mcap - 1) * 100;
    var gap = userGrowth - implied;

    document.getElementById("expectations-metric-label").textContent = copy.metric;
    document.getElementById("expectations-multiple-label").textContent = copy.exitMultiple;
    document.getElementById("expectations-growth-label").textContent = "Your expected " + copy.growth;
    document.getElementById("result-current-multiple-label").textContent = copy.currentMultiple;
    document.getElementById("result-required-metric-label").textContent = "Required future " + copy.shortMetric;
    document.getElementById("result-implied-growth-label").textContent = "Market-implied " + copy.growth;
    document.getElementById("result-user-future-label").textContent = "Future " + copy.shortMetric + " under your forecast";
    document.getElementById("heatmap-title").textContent = "Implied " + copy.growth;
    document.getElementById("heatmap-description").textContent = "Rows: discount rate · Columns: exit " + copy.multiple;
    document.getElementById("expectations-model-note").textContent = mode.value === "revenue" ? "Illustrative starting point: 5× Sales and a 15% discount rate. Revenue valuation still requires a credible path to profits and cash flow." : "Use normalized earnings for a stable, profitable company.";
    document.getElementById("result-current-pe").textContent = fmt(currentMultiple, 1) + "×";
    document.getElementById("result-required-pat").textContent = money(requiredMetric);
    document.getElementById("result-implied-growth").textContent = fmt(implied, 1) + "%";
    document.getElementById("result-user-future-pat").textContent = money(userFutureMetric);
    document.getElementById("result-user-value").textContent = money(userValue);
    document.getElementById("result-user-upside").textContent = (difference >= 0 ? "+" : "") + fmt(difference, 1) + "%";
    document.getElementById("result-gap-label").textContent = (gap >= 0 ? "+" : "") + fmt(gap, 1) + " percentage points";

    var ceiling = Math.max(30, implied, userGrowth) * 1.12;
    document.getElementById("gap-user-bar").style.width = Math.max(0, userGrowth) / ceiling * 100 + "%";
    document.getElementById("gap-market-bar").style.width = Math.max(0, implied) / ceiling * 100 + "%";

    var relation = Math.abs(gap) < 1 ? "close to" : gap > 0 ? "above" : "below";
    document.getElementById("result-interpretation").textContent = "Your " + fmt(userGrowth, 1) + "% " + copy.growth + " assumption is " + relation + " the " + fmt(implied, 1) + "% growth implied by the selected valuation assumptions. This is an expectation gap, not an investment verdict.";
    renderHeatmap(mcap, metric, years, discount, exitMultiple, copy);
  }

  root.addEventListener("input", update);
  root.addEventListener("change", function (event) {
    if (event.target === mode) {
      if (mode.value === "revenue") {
        fields.pat.value = 1500;
        fields.discount.value = 15;
        fields["exit-pe"].value = 5;
        fields["user-growth"].value = 20;
      } else {
        fields.pat.value = 300;
        fields.discount.value = 12;
        fields["exit-pe"].value = 20;
        fields["user-growth"].value = 13;
      }
    }
    update();
  });
  update();
})();
</script>
