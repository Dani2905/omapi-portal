import assert from 'node:assert/strict';
import type { NewsItem, Slide } from '../types';
import {
  buildEditorialSlides,
  getHomepageNewsSection,
  isAllowedNewsImageUrl,
  normalizeNewsDraft,
  parseEditorialDate,
  sanitizeNewsHtml,
  sortNewsItems,
  validateNewsDraft,
} from '../utils/editorialLogic';

const validNews: Partial<NewsItem> = {
  id: 10,
  title: '  Actualité   de l’OMAPI ',
  date: ' 12 Octobre 2026 ',
  category: 'Annonce',
  description: 'Information officielle destinée aux usagers.',
  image: '/images/actualite.jpg',
  content: '<p>Contenu éditorial.</p>',
  featured: true,
};

console.log('Centre éditorial test 1 — normalisation et validation des fiches');
assert.equal(normalizeNewsDraft(validNews).title, 'Actualité de l’OMAPI');
assert.equal(validateNewsDraft(validNews), null);
assert.match(validateNewsDraft({ ...validNews, title: '  ' }) ?? '', /titre/);
assert.match(validateNewsDraft({ ...validNews, category: 'Inconnue' }) ?? '', /catégorie/);
assert.match(validateNewsDraft({ ...validNews, date: ' ' }) ?? '', /date/);
assert.match(validateNewsDraft({ ...validNews, description: '' }) ?? '', /description/);
assert.match(validateNewsDraft({ ...validNews, image: 'javascript:alert(1)' }) ?? '', /image/i);

console.log('Centre éditorial test 2 — images sécurisées');
assert.equal(isAllowedNewsImageUrl('https://example.invalid/photo.jpg'), true);
assert.equal(isAllowedNewsImageUrl('/src/assets/photo.jpg'), true);
assert.equal(isAllowedNewsImageUrl('javascript:alert(1)'), false);
assert.equal(isAllowedNewsImageUrl('//example.invalid/photo.jpg'), false);
assert.equal(isAllowedNewsImageUrl('http://example.invalid/photo.jpg'), false);
assert.equal(isAllowedNewsImageUrl(''), false);

console.log('Centre éditorial test 3 — assainissement du contenu riche');
const sanitized = sanitizeNewsHtml('<p onclick="bad()">Texte <script>bad()</script></p><a href="javascript:bad()">Lien</a>');
assert.equal(sanitized.includes('<script>'), false);
assert.equal(sanitized.toLowerCase().includes('onclick='), false);
assert.equal(sanitized.toLowerCase().includes('href="javascript:'), false);

console.log('Centre éditorial test 4 — classement des dates françaises et catégories d’accueil');
assert.ok(parseEditorialDate('12 Octobre 2026')! > parseEditorialDate('08 Octobre 2026')!);
assert.equal(parseEditorialDate('31/02/2026'), null);
assert.deepEqual(sortNewsItems([
  { ...validNews, id: 1, date: '08 Octobre 2026' } as NewsItem,
  { ...validNews, id: 2, date: '12 Octobre 2026' } as NewsItem,
]).map((item) => item.id), [2, 1]);
assert.equal(getHomepageNewsSection('Blog'), 'blog');
assert.equal(getHomepageNewsSection('Déclaration'), 'remarks');
assert.equal(getHomepageNewsSection('International'), 'news');
assert.equal(getHomepageNewsSection('Formation'), 'news');

console.log('Centre éditorial test 5 — une seule slide par actualité à la une');
const manualSlide: Slide = {
  id: 1, title: 'Slide manuel', subtitle: 'Description', image: '/images/slide.jpg', ctaText: 'Voir', ctaLink: '/contact',
};
const legacyLinkedSlide: Slide = {
  id: 2, title: 'Ancienne copie', subtitle: 'Copie liée', image: '', ctaText: 'Voir', ctaLink: '/news', newsId: 10,
};
const featured: NewsItem = { ...validNews, id: 10, featured: true } as NewsItem;
const ordinary: NewsItem = { ...validNews, id: 11, featured: false } as NewsItem;
const slides = buildEditorialSlides([manualSlide, legacyLinkedSlide], [featured, ordinary]);
assert.equal(slides.length, 2);
assert.equal(slides.filter((slide) => slide.newsId === 10).length, 1);
assert.equal(slides[1].ctaLink, '/news/10');

console.log('Tous les tests du Centre éditorial PASSENT.');
