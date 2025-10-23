---
title: "Categorías"
permalink: /categories/
layout: single
author_profile: true
---

## Explorar por Categorías

{% if site.categories.size > 0 %}
<div class="entries-grid">
{% for category in site.categories %}
  <div class="entry-item">
    <h3 id="{{ category[0] | slugify }}">{{ category[0] }}</h3>
    <p><strong>{{ category[1].size }}</strong> post{{ category[1].size | pluralize }}</p>
    <ul>
    {% for post in category[1] limit:3 %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
    </ul>
    {% if category[1].size > 3 %}
      <p><small>...y {{ category[1].size | minus: 3 }} más</small></p>
    {% endif %}
  </div>
{% endfor %}
</div>

<style>
.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.entry-item {
  border: 1px solid #eaeaea;
  padding: 1.5rem;
  border-radius: 8px;
}
.entry-item h3 {
  margin-top: 0;
  color: #2c3e50;
}
</style>

{% else %}
<p class="notice--info">Todavía no hay categorías. Añade categorías a tus posts para verlas aquí.</p>
{% endif %}