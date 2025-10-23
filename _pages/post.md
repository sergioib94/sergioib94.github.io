---
title: "Todos los Posts"
permalink: /posts/
layout: single
author_profile: true
---

## Todos los Posts

<div class="grid-container">
  {% for post in site.posts %}
  {% assign card_image = post.card_image | default: "" %}
  
  <div class="post-card {% if card_image == "" %}default-bg{% endif %}" {% if card_image != "" %}style="background-image: url('{{ card_image }}')"{% endif %}>
    <div class="post-card-content">
      <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
      
      <div class="post-meta">
        <span class="post-date">{{ post.date | date: "%d/%m/%Y" }}</span>
        <span class="read-time">
          {% assign words = post.content | number_of_words %}
          {% if words < 360 %}
            1 min
          {% else %}
            {{ words | divided_by: 180 }} min
          {% endif %}
        </span>
      </div>
      
      {% if post.categories %}
      <div class="post-categories">
        {% for category in post.categories %}
        <span class="category">{{ category }}</span>
        {% endfor %}
      </div>
      {% endif %}
    </div>
  </div>
  {% endfor %}
</div>

<style>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.post-card {
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  height: 200px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.post-card-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
  z-index: 1;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.post-card:hover::before {
  background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 100%);
}

.default-bg {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.post-card h3 a {
  color: white;
  text-decoration: none;
}

.post-card h3 a:hover {
  color: rgba(255,255,255,0.9);
}

.post-meta {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 0.8rem;
  display: flex;
  gap: 0.8rem;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.post-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.category {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  border: 1px solid rgba(255,255,255,0.3);
}

.post-card h3 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  
  .post-card {
    padding: 1.2rem;
    height: 180px;
  }
}
</style>