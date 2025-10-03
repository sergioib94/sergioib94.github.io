#!/usr/bin/env ruby
# generate_categories_tags.rb
# Genera archivos .md para categorías y tags en Chirpy 7.x

require 'yaml'
require 'fileutils'

POSTS_DIR = "_posts"
CATEGORIES_DIR = "categories"
TAGS_DIR = "tags"

# Crear carpetas si no existen
FileUtils.mkdir_p(CATEGORIES_DIR)
FileUtils.mkdir_p(TAGS_DIR)

categories = {}
tags = {}

# Leer todos los posts
Dir.glob("#{POSTS_DIR}/*.md") do |post_file|
  content = File.read(post_file)
  fm = content[/^---\s*(.*?)\s*---/m, 1]  # extrae front matter
  next unless fm
  data = YAML.load(fm)

  # Categorías
  if data['categories']
    data['categories'].each do |cat|
      categories[cat] ||= []
      categories[cat] << File.basename(post_file)
    end
  end

  # Tags
  if data['tags']
    data['tags'].each do |tag|
      tags[tag] ||= []
      tags[tag] << File.basename(post_file)
    end
  end
end

# Generar archivos de categoría
categories.each_key do |cat|
  file_path = "#{CATEGORIES_DIR}/#{cat}.md"
  File.open(file_path, 'w') do |f|
    f.puts("---")
    f.puts("layout: archive")
    f.puts("title: \"#{cat.capitalize}\"")
    f.puts("permalink: /categories/#{cat}/")
    f.puts("archive_type: category")
    f.puts("archive_name: #{cat}")
    f.puts("---")
  end
  puts "Generada categoría: #{file_path}"
end

# Generar archivos de tag
tags.each_key do |tag|
  file_path = "#{TAGS_DIR}/#{tag}.md"
  File.open(file_path, 'w') do |f|
    f.puts("---")
    f.puts("layout: archive")
    f.puts("title: \"#{tag.capitalize}\"")
    f.puts("permalink: /tags/#{tag}/")
    f.puts("archive_type: tag")
    f.puts("archive_name: #{tag}")
    f.puts("---")
  end
  puts "Generada tag: #{file_path}"
end

puts "\n¡Proceso completado! Revisa las carpetas '#{CATEGORIES_DIR}' y '#{TAGS_DIR}'."
