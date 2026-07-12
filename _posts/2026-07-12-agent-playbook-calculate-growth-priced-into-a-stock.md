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
    <label><span class="expectations-field-head">Current year<button class="parameter-hint" type="button" aria-label="The financial year associated with the current earnings or revenue input.">💡</button><span class="parameter-hint__copy">The financial year for your starting PAT or revenue figure.</span></span><input id="expectations-current-year" type="number" min="1900" max="2200" step="1" value="2026"></label>
    <label><span class="expectations-field-head">Current market cap<button class="parameter-hint" type="button" aria-label="Market capitalization is the current share price multiplied by diluted shares outstanding.">💡</button><span class="parameter-hint__copy">Share price × diluted shares. Use a value from a clearly stated date.</span></span><input id="expectations-market-cap" type="number" min="0.01" step="any" value="10000"></label>
    <label><span class="expectations-field-head"><span id="expectations-metric-label">Normalized PAT</span><button class="parameter-hint" type="button" id="expectations-metric-hint" aria-label="Normalized PAT removes exceptional or one-time items from current profit after tax.">💡</button><span class="parameter-hint__copy" id="expectations-metric-hint-copy">Profit after tax with unusual one-time gains or losses removed.</span></span><input id="expectations-pat" type="number" min="0.01" step="any" value="300"></label>
    <label><span class="expectations-field-head">Forecast period<button class="parameter-hint" type="button" aria-label="The number of years over which the company must reach the required future earnings or revenue.">💡</button><span class="parameter-hint__copy">How many years the business has to reach the required future result.</span></span><input id="expectations-years" type="number" min="1" max="30" step="1" value="10"><small>years</small></label>
    <label><span class="expectations-field-head">Discount factor / required return<button class="parameter-hint" type="button" aria-label="The annual return you require for taking the investment risk. A higher rate demands stronger future results.">💡</button><span class="parameter-hint__copy">Your required annual return. More risk generally calls for a higher rate.</span></span><input id="expectations-discount" type="number" min="0" max="50" step="0.5" value="12"><small>%</small></label>
    <label><span class="expectations-field-head"><span id="expectations-multiple-label">Valuation multiple (Exit P/E)</span><button class="parameter-hint" type="button" id="expectations-multiple-hint" aria-label="The valuation multiple investors might pay at the end of the forecast period.">💡</button><span class="parameter-hint__copy" id="expectations-multiple-hint-copy">The multiple investors may pay for the company at the end of the period.</span></span><input id="expectations-exit-pe" type="number" min="0.1" max="100" step="0.5" value="20"><small>×</small></label>
    <label><span class="expectations-field-head"><span id="expectations-growth-label">Your expected PAT CAGR</span><button class="parameter-hint" type="button" id="expectations-growth-hint" aria-label="Your own evidence-based estimate of annual earnings growth, used to compare your view with the market-implied requirement.">💡</button><span class="parameter-hint__copy" id="expectations-growth-hint-copy">Your evidence-based growth estimate—not the growth required by the market price.</span></span><input id="expectations-user-growth" type="number" min="-50" max="100" step="0.5" value="13"><small>%</small></label>
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

  <div class="expectations-live-tables">
    <div class="expectations-live-tables__head">
      <div><span>Scenario walkthrough</span><strong id="projection-table-title">Projected PAT by year</strong></div>
      <small>15% · 20% · 25% · 30% · 35% growth</small>
    </div>
    <div class="retail-projection-table" id="expectations-projection-table" role="region" aria-label="Projected financial metric by year"></div>
    <p class="retail-table-caption" id="projection-table-caption">Values use the same unit as your input.</p>

    <div class="expectations-live-tables__head expectations-live-tables__head--second">
      <div><span>Valuation bridge</span><strong id="valuation-table-title">Terminal and discounted values</strong></div>
      <small id="valuation-table-assumptions">—</small>
    </div>
    <div class="retail-projection-table retail-projection-table--valuation" id="expectations-valuation-table" role="region" aria-label="Terminal and discounted valuation scenarios"></div>
    <p class="expectations-live-reading" id="expectations-live-reading" aria-live="polite">—</p>
  </div>
</section>

The defaults are illustrative, not company data. In `Revenue × P/S` mode, the calculator begins with the original framework’s illustrative assumptions of **5× Sales** and a **15% discount rate**. These are editable assumptions, not universal standards. Notice what the sensitivity map teaches: a higher required return or lower exit multiple forces the business to deliver more growth to justify the same market capitalization.

## What Is the Calculator Telling Me?

The calculator is not forecasting the company for you. It is translating today’s market capitalization into a **required future operating result** under the assumptions you selected.

<div class="retail-reading-path" aria-label="A three-step retail investor guide to reading the calculator">
  <div><span>1</span><strong>Read the requirement</strong><small>What future PAT or revenue must the company reach?</small></div>
  <i aria-hidden="true">→</i>
  <div><span>2</span><strong>Compare your evidence</strong><small>Is your driver-based growth estimate above or below it?</small></div>
  <i aria-hidden="true">→</i>
  <div><span>3</span><strong>Stress the assumptions</strong><small>Does the conclusion survive a lower multiple or higher discount rate?</small></div>
</div>

### Example 1: Balaji Amines Using PAT × P/E

As accessed on **July 13, 2026**, Screener showed Balaji Amines at a **₹7,814 crore** market capitalization using the July 10 close, a **47.3×** stock P/E, and FY26 standalone PAT of approximately **₹166 crore**. For this illustration, select ten years, a 12% discount rate, and a 20× exit P/E. [Check the current Balaji Amines data on Screener](https://www.screener.in/company/BALAMINES/).

<div class="retail-example retail-example--earnings">
  <div class="retail-example__inputs"><span>FY26 / July 10 price</span><strong>₹166 crore PAT</strong><small>₹7,814 crore market cap · 47.3× current P/E</small></div>
  <div class="retail-example__bridge"><span>must grow at</span><b>22.0% CAGR</b></div>
  <div class="retail-example__output"><span>Year 10 requirement</span><strong>₹1,213.5 crore PAT</strong><small>valued at 20× and discounted at 12%</small></div>
</div>

**Retail-friendly meaning:** at these assumptions, Balaji Amines must grow PAT more than seven times—from roughly ₹166 crore to about ₹1,214 crore—over ten years. The calculator expresses that hurdle as approximately **22% annual PAT growth**.

For context, Screener reported a 10-year profit CAGR of 10%, a five-year CAGR of −6%, and a three-year CAGR of −10%. If one mechanically entered 10% as the future growth assumption, the model would produce a discounted value near **₹2,773 crore**, roughly 65% below the observed market cap. That is **not** a fair-value verdict. Balaji Amines is cyclical, and FY26 PAT may not represent normalized mid-cycle earnings. The output tells the retail investor to investigate capacity, utilization, chemical spreads, demand recovery, and whether a 20× exit P/E is defensible.

### Example 2: Lenskart Using Revenue × P/S

The video explains the `5× Sales` method using a dated Lenskart snapshot. Keeping that snapshot intact makes its calculation reproducible:

<div class="video-snapshot-table" aria-label="Lenskart inputs used in the video">
  <div class="video-snapshot-table__head"><span>Video model inputs</span><strong>Lenskart · 2026</strong></div>
  <dl>
    <div><dt>Current year</dt><dd>2026</dd></div>
    <div><dt>Current sales</dt><dd>₹8,647 crore</dd></div>
    <div><dt>Current market cap</dt><dd>₹90,979 crore</dd></div>
    <div><dt>Exit valuation multiple</dt><dd>5× Sales</dd></div>
    <div><dt>Discount factor</dt><dd>15%</dd></div>
    <div><dt>Forecast period</dt><dd>10 years</dd></div>
  </dl>
</div>

<div class="retail-example retail-example--revenue">
  <div class="retail-example__inputs"><span>Video snapshot</span><strong>₹8,647 crore sales</strong><small>₹90,979 crore market cap · 10.5× current P/S</small></div>
  <div class="retail-example__bridge"><span>implied hurdle</span><b>23.9% CAGR</b></div>
  <div class="retail-example__output"><span>Year 10 requirement</span><strong>₹73,612 crore sales</strong><small>valued at 5× Sales and discounted at 15%</small></div>
</div>

The first step is not valuation. It is simply compounding ₹8,647 crore of sales at several possible growth rates:

<div class="retail-projection-table" role="region" aria-label="Lenskart projected sales scenarios">
<table>
  <thead><tr><th>Year</th><th>15%</th><th>20%</th><th>25%</th><th>30%</th><th>35%</th></tr></thead>
  <tbody>
    <tr><td>2027</td><td>9,944</td><td>10,376</td><td>10,809</td><td>11,241</td><td>11,673</td></tr>
    <tr><td>2028</td><td>11,436</td><td>12,452</td><td>13,511</td><td>14,613</td><td>15,759</td></tr>
    <tr><td>2029</td><td>13,151</td><td>14,942</td><td>16,889</td><td>18,997</td><td>21,275</td></tr>
    <tr><td>2030</td><td>15,124</td><td>17,930</td><td>21,111</td><td>24,697</td><td>28,721</td></tr>
    <tr><td>2031</td><td>17,392</td><td>21,517</td><td>26,389</td><td>32,106</td><td>38,773</td></tr>
    <tr><td>2032</td><td>20,001</td><td>25,820</td><td>32,986</td><td>41,737</td><td>52,344</td></tr>
    <tr><td>2033</td><td>23,001</td><td>30,984</td><td>41,232</td><td>54,259</td><td>70,665</td></tr>
    <tr><td>2034</td><td>26,451</td><td>37,181</td><td>51,540</td><td>70,536</td><td>95,397</td></tr>
    <tr><td>2035</td><td>30,419</td><td>44,619</td><td>64,425</td><td>91,697</td><td>1,28,786</td></tr>
    <tr><td>2036</td><td>34,982</td><td>53,542</td><td>80,531</td><td>1,19,206</td><td>1,73,861</td></tr>
  </tbody>
</table>
</div>
<p class="retail-table-caption">Projected sales in ₹ crore. Each column is a separate ten-year growth path.</p>

Next, multiply each 2036 sales figure by 5×, discount that terminal value back ten years at 15%, and compare it with the ₹90,979 crore market cap:

<div class="retail-projection-table retail-projection-table--valuation" role="region" aria-label="Lenskart discounted valuation scenarios">
<table>
  <thead><tr><th>Parameter</th><th>15%</th><th>20%</th><th>25%</th><th>30%</th><th>35%</th></tr></thead>
  <tbody>
    <tr><td>2036 sales</td><td>34,982</td><td>53,542</td><td>80,531</td><td>1,19,206</td><td>1,73,861</td></tr>
    <tr><td>Value at 5×</td><td>1,74,910</td><td>2,67,700</td><td>4,02,657</td><td>5,96,031</td><td>8,69,307</td></tr>
    <tr><td>Discounted value</td><td>43,235</td><td>66,171</td><td>99,531</td><td>1,47,330</td><td>2,14,879</td></tr>
    <tr><td>Current market cap</td><td>90,979</td><td>90,979</td><td>90,979</td><td>90,979</td><td>90,979</td></tr>
    <tr class="retail-projection-table__gap"><td>Gap vs current</td><td>−52.5%</td><td>−27.3%</td><td>+9.4%</td><td>+61.9%</td><td>+136.2%</td></tr>
  </tbody>
</table>
</div>
<p class="retail-table-caption">Scenario values in ₹ crore, except the final percentage row.</p>

**Retail-friendly meaning:** the current market cap sits between the 20% and 25% columns. Solving precisely gives an implied sales CAGR of approximately **23.9%** for ten years. In plain language, the video assumptions require Lenskart’s sales to grow from ₹8,647 crore to roughly **₹73,612 crore** by 2036.

At 20% growth, the discounted value is ₹66,171 crore—below the snapshot market cap. At 25%, it is ₹99,531 crore—above it. That is why the answer lies between the two. This is the intuitive purpose of the tables: they show the growth hurdle embedded in the selected assumptions without pretending to know which growth path will occur.

Revenue is not profit. Lenskart could achieve high sales growth and still fall short if margins, store economics, cash conversion, capital expenditure, or dilution disappoint. It could also outperform this simple model if growth, margins, or the eventual multiple are stronger. For a revenue model, always ask the second question: **what sustainable profit and free cash flow will that revenue eventually produce?**

<p class="retail-data-note"><strong>Data note:</strong> the video snapshot is intentionally preserved to reproduce its lesson. It is not today’s data. As accessed on July 13, 2026, <a href="https://www.screener.in/company/LENSKART/consolidated/">Screener’s consolidated Lenskart page</a> showed FY26 sales of ₹8,814 crore and a July 10 market cap of ₹94,526 crore. Those updated inputs produce an implied CAGR near 24.1% under the same 5×, 15%, ten-year assumptions. Recheck all inputs before using the model.</p>

<aside class="post-callout retail-calculator-rule">
  <span class="post-callout__icon" aria-hidden="true">💡</span>
  <div><strong>The simplest interpretation:</strong> implied growth is the hurdle embedded in your assumptions. Your expected growth is your evidence-based view. The difference between them is the expectation gap—not an automatic investment verdict.</div>
</aside>

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

  var ids = ["current-year", "market-cap", "pat", "years", "discount", "exit-pe", "user-growth"];
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

  function renderScenarioTables(currentYear, mcap, metric, years, discount, exitMultiple, implied, copy) {
    var rates = [15, 20, 25, 30, 35];
    var projection = '<table><thead><tr><th>Year</th>' + rates.map(function (rate) { return '<th>' + rate + '% Growth</th>'; }).join('') + '</tr></thead><tbody>';
    for (var yearIndex = 1; yearIndex <= years; yearIndex += 1) {
      projection += '<tr><td>' + (currentYear + yearIndex) + '</td>';
      rates.forEach(function (rate) {
        projection += '<td>' + fmt(metric * Math.pow(1 + rate / 100, yearIndex), 0) + '</td>';
      });
      projection += '</tr>';
    }
    projection += '</tbody></table>';
    document.getElementById("expectations-projection-table").innerHTML = projection;

    var terminalMetrics = rates.map(function (rate) { return metric * Math.pow(1 + rate / 100, years); });
    var terminalValues = terminalMetrics.map(function (value) { return value * exitMultiple; });
    var discountedValues = terminalValues.map(function (value) { return value / Math.pow(1 + discount / 100, years); });
    var valuation = '<table><thead><tr><th>Parameter</th>' + rates.map(function (rate) { return '<th>' + rate + '% Growth</th>'; }).join('') + '</tr></thead><tbody>';
    valuation += '<tr><td>' + (currentYear + years) + ' ' + copy.shortMetric + '</td>' + terminalMetrics.map(function (value) { return '<td>' + fmt(value, 0) + '</td>'; }).join('') + '</tr>';
    valuation += '<tr><td>Valuation at ' + fmt(exitMultiple, 1) + '×</td>' + terminalValues.map(function (value) { return '<td>' + fmt(value, 0) + '</td>'; }).join('') + '</tr>';
    valuation += '<tr><td>Discounted value</td>' + discountedValues.map(function (value) { return '<td>' + fmt(value, 0) + '</td>'; }).join('') + '</tr>';
    valuation += '<tr><td>Current market cap</td>' + rates.map(function () { return '<td>' + fmt(mcap, 0) + '</td>'; }).join('') + '</tr>';
    valuation += '<tr class="retail-projection-table__gap"><td>Gap vs current</td>' + discountedValues.map(function (value) { var gap = (value / mcap - 1) * 100; return '<td>' + (gap >= 0 ? '+' : '') + fmt(gap, 1) + '%</td>'; }).join('') + '</tr>';
    valuation += '</tbody></table>';
    document.getElementById("expectations-valuation-table").innerHTML = valuation;

    document.getElementById("projection-table-title").textContent = "Projected " + copy.shortMetric + " by year";
    document.getElementById("projection-table-caption").textContent = "Projected " + copy.shortMetric + " in " + unit.value + ". Each column is a separate growth path.";
    document.getElementById("valuation-table-title").textContent = "Terminal and discounted " + copy.shortMetric + " values";
    document.getElementById("valuation-table-assumptions").textContent = fmt(exitMultiple, 1) + "× " + copy.multiple + " · " + fmt(discount, 1) + "% discount · " + years + " years";

    var lower = null;
    var upper = null;
    rates.forEach(function (rate) { if (rate <= implied) lower = rate; if (upper === null && rate >= implied) upper = rate; });
    var reading;
    if (implied < rates[0]) {
      reading = "The implied " + copy.growth + " of " + fmt(implied, 1) + "% is below the lowest 15% scenario. Under these assumptions, even the 15% column produces a discounted value above the current market cap.";
    } else if (implied > rates[rates.length - 1]) {
      reading = "The implied " + copy.growth + " of " + fmt(implied, 1) + "% is above the highest 35% scenario. The selected valuation needs a growth path beyond this table.";
    } else if (lower === upper) {
      reading = "The current market cap aligns closely with the " + lower + "% growth column under the selected multiple, discount rate, and forecast period.";
    } else {
      reading = "The current market cap falls between the " + lower + "% and " + upper + "% growth columns. Solving precisely gives an implied " + copy.growth + " of " + fmt(implied, 1) + "% under your assumptions.";
    }
    document.getElementById("expectations-live-reading").textContent = reading + " This is a growth hurdle, not an investment verdict.";
  }

  function update() {
    var currentYear = Math.round(number("current-year"));
    var mcap = number("market-cap");
    var metric = number("pat");
    var years = number("years");
    var discount = number("discount");
    var exitMultiple = number("exit-pe");
    var userGrowth = number("user-growth");
    var copy = labels();
    var valid = Number.isFinite(currentYear) && currentYear >= 1900 && currentYear <= 2200 && [mcap, metric, years, exitMultiple].every(function (v) { return Number.isFinite(v) && v > 0; }) && Number.isFinite(discount) && Number.isFinite(userGrowth);
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
    document.getElementById("expectations-multiple-label").textContent = "Valuation multiple (" + copy.exitMultiple + ")";
    document.getElementById("expectations-growth-label").textContent = "Your expected " + copy.growth;
    document.getElementById("result-current-multiple-label").textContent = copy.currentMultiple;
    document.getElementById("result-required-metric-label").textContent = "Required future " + copy.shortMetric;
    document.getElementById("result-implied-growth-label").textContent = "Market-implied " + copy.growth;
    document.getElementById("result-user-future-label").textContent = "Future " + copy.shortMetric + " under your forecast";
    document.getElementById("heatmap-title").textContent = "Implied " + copy.growth;
    document.getElementById("heatmap-description").textContent = "Rows: discount rate · Columns: exit " + copy.multiple;
    document.getElementById("expectations-model-note").textContent = mode.value === "revenue" ? "Illustrative starting point: 5× Sales and a 15% discount rate. Revenue valuation still requires a credible path to profits and cash flow." : "Use normalized earnings for a stable, profitable company.";
    document.getElementById("expectations-metric-hint-copy").textContent = mode.value === "revenue" ? "Revenue for the latest consistent period, usually TTM or the latest financial year." : "Profit after tax with unusual one-time gains or losses removed.";
    document.getElementById("expectations-multiple-hint-copy").textContent = mode.value === "revenue" ? "The price-to-sales multiple investors may pay at the end of the period." : "The price-to-earnings multiple investors may pay at the end of the period.";
    document.getElementById("expectations-growth-hint-copy").textContent = "Your evidence-based " + copy.growth + " estimate—not the growth required by the market price.";
    document.getElementById("expectations-metric-hint").setAttribute("aria-label", mode.value === "revenue" ? "Current revenue for a consistent reported period such as TTM or the latest financial year." : "Normalized PAT removes exceptional or one-time items from current profit after tax.");
    document.getElementById("expectations-multiple-hint").setAttribute("aria-label", "The " + copy.multiple + " valuation multiple investors might pay at the end of the forecast period.");
    document.getElementById("expectations-growth-hint").setAttribute("aria-label", "Your own evidence-based estimate of annual " + copy.growth + ", used to compare your view with the market-implied requirement.");
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
    renderScenarioTables(currentYear, mcap, metric, Math.round(years), discount, exitMultiple, implied, copy);
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
