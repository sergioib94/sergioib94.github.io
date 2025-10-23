---
title: "Etiquetas"
permalink: /tags/
layout: single
author_profile: true
---

## Explorar por Etiquetas

{% if site.tags.size > 0 %}
<div class="tags-cloud">
{% for tag in site.tags %}
  {% assign tag_size = tag[1].size %}
  {% if tag_size == 1 %}
    {% assign font_size = "0.9em" %}
  {% elsif tag_size == 2 %}
    {% assign font_size = "1.1em" %}
  {% elsif tag_size >= 3 %}
    {% assign font_size = "1.3em" %}
  {% else %}
    {% assign font_size = "0.8em" %}
  {% endif %}
  
  <a href="#{{ tag[0] | slugify }}" style="font-size: {{ font_size }}; margin: 0.3rem; display: inline-block;">
    {{ tag[0] }} ({{ tag_size }})
  </a>
{% endfor %}
</div>

<hr>

{% for tag in site.tags %}
<h2 id="{{ tag[0] | slugify }}">{{ tag[0] }} <small>({{ tag[1].size }} posts)</small></h2>
<ul>
{% for post in tag[1] %}
  <li><a href="{{ post.url }}">{{ post.title }}</a> - <small>{{ post.date | date: "%d/%m/%Y" }}</small></li>
{% endfor %}
</ul>
{% endfor %}

<style>
.tags-cloud {
  text-align: center;
  margin: 2rem 0;
}
.tags-cloud a {
  background: #f8f9fa;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  text-decoration: none;
  color: #2c3e50;
  border: 1px solid #e9ecef;
}
.tags-cloud a:hover {
  background: #007acc;
  color: white;
}
</style>

{% else %}
<p class="notice--info">Todavía no hay etiquetas. Añade etiquetas a tus posts para verlas aquí.</p>
{% endif %}