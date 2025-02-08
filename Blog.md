---
layout: default
title: Posts
permalink: /blog/
---

# 📖 Blog Técnico  
Explora artículos sobre administración de sistemas.

<div class="post-grid">
    {% for post in site.posts %}
    <article class="post-card">
        <h2><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h2>
        <p>{{ post.excerpt }}</p>
        <a href="{{ site.baseurl }}{{ post.url }}" class="btn">Leer más</a>
    </article>
    {% endfor %}
</div>