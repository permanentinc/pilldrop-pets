class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.searchInput = this.querySelector('#search-query');
    this.abortController = null;

    if (!this.form) {
      return;
    }

    if (this.redirectLegacyTagParams()) {
      return;
    }

    this.cleanCurrentUrl();
    this.syncFromUrl();
    this.bindEvents();
    this.focusSearchFromUrl();
    this.applyInitialCollectionSearch();
  }

  applyInitialCollectionSearch() {
    const mode = this.form.dataset.mode || 'collection';
    const searchTerm = this.normalizeSearchTerm(this.searchInput ? this.searchInput.value : '');

    if (mode !== 'collection' || !searchTerm) {
      return;
    }

    const selectedTags = new FormData(this.form).getAll('tag').filter(Boolean);
    const currentUrl = new URL(window.location.href);
    this.renderCollectionSearch(
      searchTerm,
      selectedTags,
      this.toCleanRelativeUrl(currentUrl, { keepPage: true }),
    );
  }

  focusSearchFromUrl() {
    if (!this.searchInput) {
      return;
    }

    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get('q');

    if (!query) {
      return;
    }

    this.searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.searchInput.focus({ preventScroll: true });
  }

  bindEvents() {
    let searchTimeout;

    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.onSubmit();
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.onSubmit(), 350);
      });
    }

    this.form.addEventListener('change', (event) => {
      if (event.target.type === 'checkbox') {
        this.onSubmit();
      }
    });

    const productsRoot = this.closest('.js-products') || document;
    productsRoot.addEventListener('click', (event) => this.onPaginationClick(event));
  }

  redirectLegacyTagParams() {
    const currentUrl = new URL(window.location.href);
    const legacyTags = currentUrl.searchParams.getAll('filter.p.tag').filter(Boolean);

    if (legacyTags.length === 0) {
      return false;
    }

    currentUrl.searchParams.delete('filter.p.tag');
    currentUrl.searchParams.delete('page');

    const targetUrl = this.buildCollectionUrl(legacyTags, currentUrl.searchParams);
    window.location.replace(targetUrl);
    return true;
  }

  cleanCurrentUrl() {
    const currentUrl = new URL(window.location.href);
    const cleanUrl = this.toCleanRelativeUrl(currentUrl, { keepPage: true });

    if (cleanUrl === `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`) {
      return;
    }

    history.replaceState(history.state, '', cleanUrl);
  }

  syncFromUrl() {
    const currentUrl = new URL(window.location.href);
    const query = currentUrl.searchParams.get('q') || '';
    const queryTags = this.getTagsFromSearchQuery(query);
    const pathTags = this.getPathTags();
    const selectedTags = [...new Set([...pathTags, ...queryTags])];

    this.form.querySelectorAll('input[name="tag"]').forEach((checkbox) => {
      checkbox.checked = selectedTags.includes(checkbox.value);
    });

    if (this.searchInput) {
      this.searchInput.value = this.stripTagsFromSearchQuery(query);
    }
  }

  onSubmit() {
    const mode = this.form.dataset.mode || 'collection';

    if (mode === 'search') {
      const targetUrl = this.buildUrlFromForm();
      this.renderUrl(targetUrl, { pushState: true });
      return;
    }

    const formData = new FormData(this.form);
    const selectedTags = formData.getAll('tag').filter(Boolean);
    const searchTerm = this.normalizeSearchTerm(formData.get('q') || '');

    if (searchTerm) {
      const searchParams = new URLSearchParams();
      searchParams.set('q', searchTerm);
      const targetUrl = this.buildCollectionUrl(selectedTags, searchParams);
      this.renderCollectionSearch(searchTerm, selectedTags, targetUrl, { pushState: true });
      return;
    }

    const targetUrl = this.buildCollectionUrl(selectedTags);
    this.renderUrl(targetUrl, { pushState: true });
  }

  onPaginationClick(event) {
    const link = event.target.closest('.pagination a');

    if (!link) {
      return;
    }

    event.preventDefault();

    const targetUrl = this.toCleanRelativeUrl(new URL(link.href), { keepPage: true });
    this.renderUrl(targetUrl, { pushState: true });
  }

  renderUrl(targetUrl, { pushState = false, historyUrl = targetUrl, afterRender = null } = {}) {
    const target = new URL(targetUrl, window.location.origin);
    const targetPath = target.pathname;
    const currentMode = this.form.dataset.mode || 'collection';

    if (currentMode === 'search' && targetPath !== this.getSearchPath()) {
      window.location.href = targetUrl;
      return;
    }

    const sectionId = this.getSectionIdForUrl(target);
    const sectionUrl = this.withSectionId(targetUrl, sectionId);

    document.body.classList.add('loading');

    if (this.abortController) {
      this.abortController.abort();
    }

    if (FacetFiltersForm.cache.has(sectionUrl)) {
      this.renderHtml(FacetFiltersForm.cache.get(sectionUrl), historyUrl, pushState, afterRender);
      return;
    }

    this.abortController = new AbortController();

    fetch(sectionUrl, { signal: this.abortController.signal })
      .then((response) => response.text())
      .then((html) => {
        FacetFiltersForm.cache.set(sectionUrl, html);
        this.renderHtml(html, historyUrl, pushState, afterRender);
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }

        window.location.href = historyUrl;
      });
  }

  renderHtml(html, targetUrl, pushState, afterRender = null) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newGrid = doc.getElementById('ProductGridContainer');
    const newCount = doc.querySelector('.results-count');
    const newNoResults = doc.querySelector('.no-results');

    if (!newGrid) {
      window.location.href = targetUrl;
      return;
    }

    document.getElementById('ProductGridContainer').innerHTML = newGrid.innerHTML;

    if (newCount) {
      const currentCount = document.querySelector('.results-count');
      if (currentCount) {
        currentCount.innerHTML = newCount.innerHTML;
      }
    }

    if (newNoResults) {
      const currentNoResults = document.querySelector('.no-results');
      if (currentNoResults) {
        currentNoResults.outerHTML = newNoResults.outerHTML;
      }
    }

    if (pushState) {
      history.pushState({ url: targetUrl }, '', targetUrl);
    }

    this.syncFromUrl();

    if (afterRender) {
      afterRender();
    }

    document.body.classList.remove('loading');
  }

  renderCollectionSearch(searchTerm, selectedTags, historyUrl, { pushState = false } = {}) {
    const grid = document.getElementById('ProductGridContainer');
    const productGrid = document.getElementById('product-grid');

    if (!grid || !productGrid) {
      window.location.href = historyUrl;
      return;
    }

    const sectionId = productGrid.dataset.id;
    const sourceUrl = this.buildCollectionUrl(selectedTags);

    document.body.classList.add('loading');

    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    this.fetchCollectionProductItems(sourceUrl, sectionId, this.abortController.signal)
      .then((items) => {
        const matches = items.filter((item) => this.productMatchesSearchTerm(item, searchTerm));

        grid.innerHTML = '';
        matches.forEach((item) => grid.appendChild(item));

        const noResults = document.querySelector('.no-results');
        if (noResults) {
          noResults.style.display = matches.length === 0 ? 'block' : 'none';
        }

        if (pushState) {
          history.pushState({ url: historyUrl }, '', historyUrl);
        } else {
          history.replaceState(history.state, '', historyUrl);
        }

        this.syncFromUrl();
        this.updateCollectionSearchCount(matches.length);
        document.body.classList.remove('loading');
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }

        window.location.href = historyUrl;
      });
  }

  fetchCollectionProductItems(sourceUrl, sectionId, signal) {
    return this.fetchCollectionDocuments(sourceUrl, sectionId, signal)
      .then((docs) => docs.reduce((items, doc) => items.concat(this.getProductItemsFromDocument(doc)), []));
  }

  fetchCollectionDocuments(sourceUrl, sectionId, signal, docs = [], visitedUrls = new Set()) {
    const cleanUrl = this.toCleanRelativeUrl(new URL(sourceUrl, window.location.origin), { keepPage: true });

    if (visitedUrls.has(cleanUrl) || docs.length >= 40) {
      return Promise.resolve(docs);
    }

    visitedUrls.add(cleanUrl);

    return this.fetchSectionDocument(cleanUrl, sectionId, signal).then((doc) => {
      docs.push(doc);

      const nextLink = doc.querySelector('.pagination a[aria-label="Next"]');
      if (!nextLink) {
        return docs;
      }

      const nextUrl = this.toCleanRelativeUrl(new URL(nextLink.href), { keepPage: true });
      return this.fetchCollectionDocuments(nextUrl, sectionId, signal, docs, visitedUrls);
    });
  }

  fetchSectionDocument(url, sectionId, signal) {
    const sectionUrl = this.withSectionId(url, sectionId);

    if (FacetFiltersForm.cache.has(sectionUrl)) {
      return Promise.resolve(this.parseHtml(FacetFiltersForm.cache.get(sectionUrl)));
    }

    return fetch(sectionUrl, { signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to fetch collection products');
        }

        return response.text();
      })
      .then((html) => {
        FacetFiltersForm.cache.set(sectionUrl, html);
        return this.parseHtml(html);
      });
  }

  parseHtml(html) {
    return new DOMParser().parseFromString(html, 'text/html');
  }

  getProductItemsFromDocument(doc) {
    const grid = doc.getElementById('ProductGridContainer');

    if (!grid) {
      return [];
    }

    return Array.from(grid.querySelectorAll('.collection__grid__item'), (item) => item.cloneNode(true));
  }

  productMatchesSearchTerm(item, term) {
    const normalized = term.toLowerCase();

    if (!normalized) {
      return true;
    }

    const searchableText = [
      item.getAttribute('data-tags') || '',
      item.getAttribute('data-brand') || '',
      item.getAttribute('data-types') || '',
      item.textContent || '',
    ].join(' ').toLowerCase();

    return searchableText.includes(normalized);
  }

  updateCollectionSearchCount(visibleCount) {
    const count = document.querySelector('.results-count');

    if (!count) {
      return;
    }

    const collectionTitle = (this.form.dataset.collectionTitle || '').toLowerCase();
    const productLabel = visibleCount === 1 ? 'product' : 'products';

    count.innerHTML = collectionTitle
      ? `Showing&nbsp;${visibleCount} ${productLabel} for ${collectionTitle}`
      : `Showing&nbsp;${visibleCount} ${productLabel}`;
  }

  buildUrlFromForm() {
    const formData = new FormData(this.form);
    const selectedTags = formData.getAll('tag').filter(Boolean);
    const searchTerm = this.normalizeSearchTerm(formData.get('q') || '');
    const currentMode = this.form.dataset.mode || 'collection';

    if (searchTerm || currentMode === 'search') {
      return this.buildSearchUrl(searchTerm, selectedTags);
    }

    return this.buildCollectionUrl(selectedTags);
  }

  buildCollectionUrl(tags, extraParams = new URLSearchParams()) {
    const collectionUrl = this.getCollectionUrl();
    const tagPath = tags.map((tag) => encodeURIComponent(tag)).join('+');
    const url = tagPath ? `${collectionUrl}/${tagPath}` : collectionUrl;
    const queryString = this.cleanSearchParams(extraParams).toString();

    return queryString ? `${url}?${queryString}` : url;
  }

  buildSearchUrl(searchTerm, tags) {
    const searchUrl = this.getSearchPath();
    const queryParts = [];

    if (searchTerm) {
      queryParts.push(searchTerm);
    }

    tags.forEach((tag) => {
      queryParts.push(`tag:${tag}`);
    });

    const searchParams = new URLSearchParams();
    searchParams.set('type', 'product');

    if (queryParts.length > 0) {
      searchParams.set('q', queryParts.join(' '));
    }

    return `${searchUrl}?${searchParams.toString()}`;
  }

  getCollectionUrl() {
    const collectionUrl = this.form.dataset.collectionUrl || window.location.pathname;
    const url = new URL(collectionUrl, window.location.origin);
    return url.pathname.replace(/\/$/, '');
  }

  getSearchPath() {
    const searchUrl = this.form.dataset.searchUrl || '/search';
    const url = new URL(searchUrl, window.location.origin);
    return url.pathname;
  }

  getSectionIdForUrl(url) {
    if (url.pathname === this.getSearchPath()) {
      return 'search-product-grid';
    }

    return document.getElementById('product-grid').dataset.id;
  }

  getPathTags() {
    const collectionUrl = this.getCollectionUrl();
    const currentPath = window.location.pathname.replace(/\/$/, '');

    if (!currentPath.startsWith(`${collectionUrl}/`)) {
      return [];
    }

    return currentPath
      .slice(collectionUrl.length + 1)
      .split('+')
      .map((tag) => decodeURIComponent(tag))
      .filter(Boolean);
  }

  getKnownTags() {
    return Array.from(this.form.querySelectorAll('input[name="tag"]'))
      .map((checkbox) => checkbox.value)
      .sort((a, b) => b.length - a.length);
  }

  getTagsFromSearchQuery(query) {
    if (!query) {
      return [];
    }

    let remainingQuery = query;
    const selectedTags = [];

    this.getKnownTags().forEach((tag) => {
      const tagQuery = `tag:${tag}`;
      if (remainingQuery.includes(tagQuery)) {
        selectedTags.push(tag);
        remainingQuery = remainingQuery.replaceAll(tagQuery, '');
      }
    });

    return selectedTags;
  }

  stripTagsFromSearchQuery(query) {
    let cleanQuery = query || '';

    this.getKnownTags().forEach((tag) => {
      cleanQuery = cleanQuery.replaceAll(`tag:${tag}`, '');
    });

    return this.normalizeSearchTerm(cleanQuery);
  }

  normalizeSearchTerm(term) {
    return term.replace(/\s+/g, ' ').trim();
  }

  withSectionId(url, sectionId) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}section_id=${sectionId}`;
  }

  toCleanRelativeUrl(url, options = {}) {
    const queryString = this.cleanSearchParams(url.searchParams, options).toString();
    return `${url.pathname}${queryString ? `?${queryString}` : ''}${url.hash}`;
  }

  cleanSearchParams(searchParams, { keepPage = false } = {}) {
    const cleanParams = new URLSearchParams(searchParams);

    Array.from(cleanParams.keys()).forEach((key) => {
      if (
        key === 'filter.p.tag' ||
        key === 'section_id' ||
        key === 'replace_templates' ||
        key.startsWith('_') ||
        (!keepPage && key === 'page')
      ) {
        cleanParams.delete(key);
      }
    });

    return cleanParams;
  }
}

FacetFiltersForm.cache = new Map();

window.addEventListener('popstate', () => {
  location.reload();
});

customElements.define('facet-filters-form', FacetFiltersForm);
