---
layout: default
title: Home
---

<section class="home-hero">
  <div class="home-hero__copy">
    <p class="eyebrow">Personal notebook</p>
    <h1>Murari Shankar</h1>
    <p class="lead">Building with AI, investing with patience, cooking for fun, following football, and reading to stay curious.</p>

    <div class="home-actions" aria-label="Primary links">
      <a class="home-action" href="{{ '/investment/' | relative_url }}">Investment notes</a>
      <a class="home-action" href="#operating-system">What I track</a>
    </div>
  </div>

  <div class="home-orbit" aria-label="Murari Shankar interests map">
    <div class="home-orbit__ring home-orbit__ring--outer"></div>
    <div class="home-orbit__ring home-orbit__ring--inner"></div>
    <div class="home-orbit__satellite" aria-hidden="true"><span></span></div>
    <div class="home-orbit__core">
      <span>MS</span>
      <strong>Think<br>Build<br>Compound</strong>
    </div>
    <div class="home-orbit__node home-orbit__node--ai">🤖<span>AI</span></div>
    <div class="home-orbit__node home-orbit__node--invest">📈<span>Investing</span></div>
    <div class="home-orbit__node home-orbit__node--cook">🍳<span>Cooking</span></div>
    <div class="home-orbit__node home-orbit__node--books">📚<span>Books</span></div>
    <div class="home-orbit__node home-orbit__node--football">⚽<span>Football</span></div>
  </div>
</section>

<section id="operating-system" class="home-system">
  <div class="home-system__intro">
    <p class="eyebrow">Operating system</p>
    <h2>Small loops, long games.</h2>
  </div>

  <div class="home-system__grid">
    <article class="home-focus">
      <span>🤖</span>
      <h3>Build</h3>
      <p>Explore practical AI workflows, tools, and small systems that make everyday work sharper.</p>
    </article>
    <article class="home-focus">
      <span>🧾</span>
      <h3>Verify</h3>
      <p>Read companies through cash flow, balance sheets, governance, and capital allocation.</p>
    </article>
    <article class="home-focus">
      <span>🍲</span>
      <h3>Experiment</h3>
      <p>Cook, tweak, taste, and repeat. The kitchen is a low-stakes lab for better judgment.</p>
    </article>
    <article class="home-focus">
      <span>📖</span>
      <h3>Collect</h3>
      <p>Use books and football as pattern libraries for decisions, patience, and momentum.</p>
    </article>
  </div>
</section>

{% assign forensic_post_url = "/investment/" | relative_url %}
{% for post in site.posts %}
  {% if post.title == "Forensic Investing: How to Spot Financial Engineering Before It Destroys Your Capital" %}
    {% assign forensic_post_url = post.url | relative_url %}
  {% endif %}
{% endfor %}

<section class="home-current">
  <div>
    <p class="eyebrow">Latest thread</p>
    <h2>Forensic investing</h2>
    <p>Notes on spotting financial engineering before a growth story turns into a capital trap.</p>
  </div>
  <a class="home-current__link" href="{{ forensic_post_url }}">Read the note</a>
</section>
