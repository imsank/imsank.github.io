---
layout: post
title: "Startup Valuation, Explained: Funding, Equity, Dilution, and Float"
date: 2026-07-11 12:30:00 +0530
categories: investment
tags:
  - investment
  - startup-valuation
  - equity
  - dilution
  - free-float
---

You hear that a startup has **raised $200 million at a $1 billion valuation**. It sounds as though someone inspected the company, found a billion dollars inside, and wrote a cheque.

That is not what happened.

A funding announcement is the price of a transaction: an investor paid a known amount for a negotiated slice of a company. The headline valuation is the implied value of the whole company at that price. It is not cash in the founders' bank account, and it is not a permanent certificate of what the business is worth.

<aside class="post-callout valuation-callout">
  <span class="post-callout__icon" aria-hidden="true">%</span>
  <div><strong>The shortest mental model:</strong> investment is the money entering the company, equity is the slice sold, and valuation is the implied price of the entire pie.</div>
</aside>

<nav class="valuation-jump" aria-label="Article sections">
  <a href="#funding-headline">Read a funding headline</a>
  <a href="#valuation-calculator">Try the calculator</a>
  <a href="#valuing-a-business">Value a business</a>
  <a href="#equity-and-float">Understand free float</a>
</nav>

## 1. Reading a Funding Headline {#funding-headline}

Suppose a startup says:

> We raised **$200 million at a $1 billion post-money valuation**.

The company is considered worth $1 billion immediately after the new money arrives. The investor's ownership is therefore:

<div class="valuation-formula" aria-label="Investor ownership formula">
  <span>Investment</span>
  <span class="valuation-formula__operator">&divide;</span>
  <span>Post-money valuation</span>
  <span class="valuation-formula__operator">=</span>
  <strong>Investor ownership</strong>
  <small>$200M &divide; $1B = 20%</small>
</div>

The existing business had an implied value of $800 million before the round. After the company receives $200 million, the new investor owns 20% and the existing shareholders collectively own 80%.

<div class="valuation-ownership" aria-label="Ownership after a 200 million dollar investment at a 1 billion dollar post-money valuation">
  <div class="valuation-ownership__legend"><span><i class="valuation-swatch valuation-swatch--founder"></i>Existing shareholders 80%</span><span><i class="valuation-swatch valuation-swatch--investor"></i>New investor 20%</span></div>
  <div class="valuation-ownership__bar"><span style="--share: 80%">80%</span><span style="--share: 20%">20%</span></div>
</div>

The founders do not personally receive $200 million in a typical primary funding round. The company receives it and can use it to hire people, build factories, buy equipment, acquire customers, or simply extend its runway. If existing shareholders sell their own shares instead, that is a **secondary transaction**, and the cash goes to those sellers rather than to the company.

### Pre-money versus post-money

The missing word in many headlines is important.

<div class="valuation-comparison">
  <section>
    <p class="valuation-kicker">$1B pre-money</p>
    <strong>$1.2B after investment</strong>
    <p>A $200M cheque buys 16.7% because it is divided by the $1.2B post-money value.</p>
  </section>
  <section>
    <p class="valuation-kicker">$1B post-money</p>
    <strong>$800M before investment</strong>
    <p>A $200M cheque buys 20% because it is divided by the stated $1B post-money value.</p>
  </section>
</div>

The reusable equations are:

- **Post-money valuation = investment &divide; equity percentage**
- **Pre-money valuation = post-money valuation - investment**
- **Investor ownership = investment &divide; post-money valuation**

Real deals can be more complicated. Employee option pools, warrants, convertible instruments, liquidation preferences, and secondary sales may change the economics. But these equations are the right first reading of a simple equity round.

## 2. Turn Any Offer into a Valuation

On a show such as Shark Tank, a founder might ask for **&#8377;1 crore for 2% equity**. The percentage sounds small, but it carries a large claim:

<div class="valuation-equation-strip">
  <span>&#8377;1 crore</span><b>&divide;</b><span>2%</span><b>=</b><strong>&#8377;50 crore post-money valuation</strong>
</div>

If an investor counters with **&#8377;1 crore for 10%**, the cash is unchanged but the implied valuation falls to &#8377;10 crore. A compromise of &#8377;1 crore for 5% implies &#8377;20 crore.

<div class="valuation-offers" aria-label="Comparison of Shark Tank offers">
  <div><span>Founder asks</span><strong>2%</strong><small>&#8377;50 Cr valuation</small></div>
  <div><span>Investor counters</span><strong>10%</strong><small>&#8377;10 Cr valuation</small></div>
  <div><span>Possible middle</span><strong>5%</strong><small>&#8377;20 Cr valuation</small></div>
</div>

They are negotiating over two connected questions: **what is the company worth today, and how much future ownership should be exchanged for capital and support?**

<section id="valuation-calculator" class="valuation-calculator" aria-labelledby="valuation-calculator-title">
  <div class="valuation-calculator__intro">
    <p class="valuation-kicker">Interactive tool</p>
    <h2 id="valuation-calculator-title">Implied valuation calculator</h2>
    <p>Enter the cheque and equity offered. The calculator treats the result as a simple primary equity round.</p>
  </div>

  <div class="valuation-calculator__body">
    <form class="valuation-calculator__form" data-valuation-form novalidate>
      <fieldset class="valuation-currency">
        <legend>Currency</legend>
        <label><input type="radio" name="currency" value="INR" checked><span>INR</span></label>
        <label><input type="radio" name="currency" value="USD"><span>USD</span></label>
      </fieldset>

      <label class="valuation-field">
        <span>Investment amount</span>
        <input type="number" name="investment" min="0" step="any" value="10000000" inputmode="decimal" aria-describedby="valuation-amount-hint">
        <small id="valuation-amount-hint">Enter the full amount, for example 10000000 for &#8377;1 crore.</small>
      </label>

      <label class="valuation-field">
        <span>Equity offered (%)</span>
        <input type="number" name="equity" min="0.01" max="99.99" step="0.01" value="2" inputmode="decimal">
      </label>

      <p class="valuation-calculator__error" data-valuation-error role="alert" hidden></p>
    </form>

    <div class="valuation-results" aria-live="polite">
      <div><span>Post-money valuation</span><strong data-post-money>&#8377;50 Cr</strong></div>
      <div><span>Pre-money valuation</span><strong data-pre-money>&#8377;49 Cr</strong></div>
      <div><span>New investor</span><strong data-investor-share>2%</strong></div>
      <div><span>Existing shareholders</span><strong data-existing-share>98%</strong></div>
      <p data-valuation-summary>An investment of &#8377;1 Cr for 2% implies a &#8377;50 Cr post-money valuation and a &#8377;49 Cr pre-money valuation.</p>
    </div>
  </div>
</section>

## 3. How Do You Value a Small Business? {#valuing-a-business}

There is no single valuation stamped onto a business. A valuation is an argued price that a willing investor and founder can accept. The argument becomes stronger when it is anchored in evidence.

Imagine a running cake shop with:

- &#8377;50 lakh in annual sales
- &#8377;10 lakh in annual profit
- Loyal customers and strong reviews
- Revenue growing at 30% a year

A buyer of a traditional owner-operated shop might offer five times annual profit, implying a valuation of roughly **&#8377;50 lakh**. The multiple reflects durability, risk, dependence on the owner, and what similar businesses sell for.

Now imagine a different bakery with the same current revenue but a repeatable store format, a recognisable brand, online ordering, strong unit economics, and a credible route to 50 locations. An investor may accept a much higher multiple because the future cash-flow opportunity is larger and more scalable.

<div class="valuation-lens" aria-label="Four lenses for valuing a young business">
  <article><span>01</span><h3>Evidence</h3><p>Revenue, margins, retention, repeat purchases, and cash generation.</p></article>
  <article><span>02</span><h3>Potential</h3><p>Market size, growth rate, expansion capacity, and possible future profit.</p></article>
  <article><span>03</span><h3>Defensibility</h3><p>Brand, distribution, technology, cost advantage, or another reason customers stay.</p></article>
  <article><span>04</span><h3>Risk</h3><p>Founder dependence, competition, capital needs, execution difficulty, and failure probability.</p></article>
</div>

For an established profitable business, investors often compare earnings, cash flow, or revenue multiples with similar companies. For a young startup, they may also work backward from a plausible future outcome and the return required for taking early risk. Neither method produces objective truth. It produces a defensible range for negotiation.

<figure class="post-figure valuation-figure">
  <img src="{{ '/assets/investment/startup-valuation/mental-model-valuation.png' | relative_url }}" alt="Mental model connecting investment amount, equity sold, pre-money valuation, and post-money valuation">
  <figcaption>A practical mental model for moving between funding, ownership, and implied valuation.</figcaption>
</figure>

### How much should the cake shop raise?

Start with the plan, not the highest valuation you can announce. If &#8377;20 lakh is enough to open and stabilise a second shop, estimate what milestones that capital can achieve and how long it must last.

If the business and investor agree on a &#8377;2 crore post-money valuation, &#8377;20 lakh buys 10%. If the investor believes the risk supports only a &#8377;1 crore post-money valuation, the same cheque buys 20%.

A high valuation reduces dilution today, but it also raises expectations for the next round. If the company fails to grow into that price, a later **down round** can be painful for morale, ownership, and fundraising. The best valuation is not automatically the largest number; it is one the company can use productively and grow beyond.

## 4. Equity, Dilution, and the Cap Table

A **cap table** is the record of who owns the company. When a company issues new shares to an investor, existing holders usually keep the same number of shares but own a smaller percentage of a larger total. That percentage reduction is dilution.

<div class="valuation-cap-table" aria-label="Simple cap table before and after an investment">
  <div>
    <p class="valuation-kicker">Before the round</p>
    <div class="valuation-cap-row"><span>Founder</span><strong>100%</strong></div>
  </div>
  <span class="valuation-cap-table__arrow" aria-hidden="true">&rarr;</span>
  <div>
    <p class="valuation-kicker">After the round</p>
    <div class="valuation-cap-row"><span>Founder</span><strong>90%</strong></div>
    <div class="valuation-cap-row valuation-cap-row--accent"><span>Investor</span><strong>10%</strong></div>
  </div>
</div>

The founder owns a smaller percentage, but the company now has new cash. Good dilution funds growth that makes the founder's smaller slice more valuable in absolute terms.

### A touch of the funding journey

Dilution can compound across rounds. In this simplified illustration, every round issues new shares equal to the stated post-round stake:

<div class="valuation-timeline" aria-label="Illustrative founder dilution over three funding rounds">
  <div><span>Start</span><strong>100%</strong><small>Founder ownership</small></div>
  <i aria-hidden="true"></i>
  <div><span>Seed</span><strong>90%</strong><small>After selling 10%</small></div>
  <i aria-hidden="true"></i>
  <div><span>Series A</span><strong>76.5%</strong><small>After another 15%</small></div>
  <i aria-hidden="true"></i>
  <div><span>Series B</span><strong>61.2%</strong><small>After another 20%</small></div>
</div>

The percentages multiply rather than simply subtract from the founder's original stake: 100% &times; 90% &times; 85% &times; 80% = 61.2%. Real cap tables also include co-founders, employees, option pools, and earlier investors. An option pool created before a round can dilute existing holders before the new investor arrives, so founders must read the exact term sheet rather than relying only on the headline valuation.

## 5. Is Investor Equity Called Float? {#equity-and-float}

No. In a private company, the investor receives **equity**, an **ownership stake**, or **shareholding**. Float is primarily a public-market term.

**Free float** means shares that are readily available for public trading. Strategic or locked-in holdings, such as promoter stakes, are generally excluded under the relevant index or exchange methodology.

<div class="valuation-definition">
  <div><span>Private company</span><strong>Who owns the shares?</strong><p>Founder equity, employee options, angel ownership, and venture-capital stakes form the cap table.</p></div>
  <div><span>Public company</span><strong>Which shares can trade freely?</strong><p>The tradable portion held by public investors contributes to free float.</p></div>
</div>

A startup can move through seed, Series A, and Series B rounds without having public float. Float enters the picture when shares become publicly tradable, commonly after an IPO.

<figure class="post-figure valuation-figure">
  <img src="{{ '/assets/investment/startup-valuation/mental-model-float.png' | relative_url }}" alt="Mental model distinguishing private-company equity from publicly tradable free float">
  <figcaption>Equity describes ownership; free float describes the portion available for public trading.</figcaption>
</figure>

## 6. Does Low Float Push a Share Price Higher?

A low free float can make a share price more sensitive to buying and selling because fewer shares are readily available. If demand rises sharply, buyers may compete for limited supply. The reverse is equally important: when sentiment turns, limited liquidity can make exits difficult and price falls abrupt.

<div class="valuation-tradeoffs">
  <section>
    <p class="valuation-kicker">Possible effect</p>
    <h3>Scarcity amplifies moves</h3>
    <p>Strong demand can move the price quickly when few shares are available.</p>
  </section>
  <section>
    <p class="valuation-kicker">The other side</p>
    <h3>Liquidity disappears</h3>
    <p>Wide spreads and shallow trading can make both entry and exit expensive.</p>
  </section>
  <section>
    <p class="valuation-kicker">What matters most</p>
    <h3>Business value comes first</h3>
    <p>Float changes trading dynamics; it does not improve earnings, governance, or cash flow.</p>
  </section>
</div>

Promoters often retain ownership to preserve control and participate in future value creation, not merely to manufacture scarcity. Listed companies must also comply with the public-shareholding rules that apply in their market. For a retail investor, low float should be treated as a **liquidity and volatility characteristic**, never as a standalone investment thesis.

## A Reader's Checklist

When you next hear a funding or valuation claim, ask:

1. Is the valuation pre-money or post-money?
2. Is the investment primary capital for the company, a secondary sale, or a mixture?
3. What percentage ownership is the investor receiving on a fully diluted basis?
4. Is an employee option pool being created before or after the investment?
5. What evidence supports the valuation: profit, revenue, growth, unit economics, or comparable deals?
6. What milestones should the new capital achieve?
7. If the company is public, am I discussing ownership or genuinely tradable free float?

<aside class="post-callout valuation-callout valuation-callout--closing">
  <span class="post-callout__icon" aria-hidden="true">1%</span>
  <div><strong>Translate every headline into ownership.</strong> Once you can move between investment, equity percentage, pre-money value, and post-money value, startup funding stops sounding mysterious. It becomes a negotiation over price, risk, control, and the future.</div>
</aside>

<script>
  (function () {
    var form = document.querySelector("[data-valuation-form]");
    if (!form) return;

    var investmentInput = form.elements.investment;
    var equityInput = form.elements.equity;
    var currencyInputs = form.elements.currency;
    var error = form.querySelector("[data-valuation-error]");
    var postMoneyOutput = document.querySelector("[data-post-money]");
    var preMoneyOutput = document.querySelector("[data-pre-money]");
    var investorOutput = document.querySelector("[data-investor-share]");
    var existingOutput = document.querySelector("[data-existing-share]");
    var summaryOutput = document.querySelector("[data-valuation-summary]");

    function selectedCurrency() {
      for (var i = 0; i < currencyInputs.length; i += 1) {
        if (currencyInputs[i].checked) return currencyInputs[i].value;
      }
      return "INR";
    }

    function formatMoney(value, currency) {
      if (currency === "INR") {
        if (value >= 10000000) return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value / 10000000) + " Cr";
        if (value >= 100000) return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value / 100000) + " Lakh";
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
      }

      if (value >= 1000000000) return "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / 1000000000) + "B";
      if (value >= 1000000) return "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / 1000000) + "M";
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    }

    function formatPercent(value) {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value) + "%";
    }

    function calculate() {
      var investment = Number(investmentInput.value);
      var equity = Number(equityInput.value);

      if (!Number.isFinite(investment) || investment <= 0) {
        error.textContent = "Enter an investment amount greater than zero.";
        error.hidden = false;
        return;
      }

      if (!Number.isFinite(equity) || equity <= 0 || equity >= 100) {
        error.textContent = "Equity must be greater than 0% and less than 100%.";
        error.hidden = false;
        return;
      }

      error.hidden = true;
      var currency = selectedCurrency();
      var postMoney = investment / (equity / 100);
      var preMoney = postMoney - investment;
      var existingShare = 100 - equity;

      postMoneyOutput.textContent = formatMoney(postMoney, currency);
      preMoneyOutput.textContent = formatMoney(preMoney, currency);
      investorOutput.textContent = formatPercent(equity);
      existingOutput.textContent = formatPercent(existingShare);
      summaryOutput.textContent = "An investment of " + formatMoney(investment, currency) + " for " + formatPercent(equity) + " implies a " + formatMoney(postMoney, currency) + " post-money valuation and a " + formatMoney(preMoney, currency) + " pre-money valuation.";
    }

    form.addEventListener("input", calculate);
    form.addEventListener("change", calculate);
    calculate();
  })();
</script>