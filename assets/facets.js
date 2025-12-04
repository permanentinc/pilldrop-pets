console.log('Facet filters script loaded');
class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.searchInput = this.querySelector('#search-query');
    
    // Debounce search input
    let searchTimeout;
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.onSubmit(e), 500);
      });
    }
    
    // Instant for checkboxes
    this.form.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        this.onSubmit(e);
      }
    });
  }

  onSubmit(event) {
    event.preventDefault();
    
    // Add loading class
    document.body.classList.add('loading');
    
    // Get form data
    const formData = new FormData(this.form);
    
    // Check if there's a search query
    const searchQuery = formData.get('q');
    const hasSearch = searchQuery && searchQuery.trim() !== '';
    
    if (hasSearch) {
      // Redirect to search page for text queries
      const searchParams = new URLSearchParams(formData);
      searchParams.set('type', 'product');
      window.location.href = `/search?${searchParams.toString()}`;
      return;
    }
    
    // Remove empty q parameter
    formData.delete('q');
    
    const searchParams = new URLSearchParams(formData).toString();
    
    // Fetch with section_id to get just the product grid section
    const sectionId = document.getElementById('product-grid').dataset.id;
    const url = `${window.location.pathname}?section_id=${sectionId}&${searchParams}`;
    
    console.log('Fetching:', url);
    
    fetch(url)
      .then(response => response.text())
      .then(html => {
        console.log('Response received, length:', html.length);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Update product grid
        const newGrid = doc.getElementById('ProductGridContainer');
        if (newGrid) {
          console.log('Updating grid');
          document.getElementById('ProductGridContainer').innerHTML = newGrid.innerHTML;
        } else {
          console.log('ProductGridContainer not found in response');
        }
        
        // Update product count
        const newCount = doc.getElementById('ProductCount');
        if (newCount) {
          console.log('Updating count');
          document.getElementById('ProductCount').innerHTML = newCount.innerHTML;
        } else {
          console.log('ProductCount not found in response');
        }
        
        // Update URL without section_id
        const finalUrl = searchParams ? `${window.location.pathname}?${searchParams}` : window.location.pathname;
        history.pushState({ searchParams }, '', finalUrl);
        
        // Remove loading class
        document.body.classList.remove('loading');
      })
      .catch(error => {
        console.error('Fetch error:', error);
        document.body.classList.remove('loading');
      });
  }
}

// Handle back/forward buttons
window.addEventListener('popstate', (event) => {
  location.reload();
});

customElements.define('facet-filters-form', FacetFiltersForm);