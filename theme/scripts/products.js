// Add this JavaScript to your theme.js or in a <script> tag
console.log('Products script loaded');
// AJAX filtering with tag/title matching

(function() {
  const filterTags = document.querySelectorAll('.js-filter-tags');
  const filterBrands = document.querySelectorAll('.js-filter-brands');
  const filterCollections = document.querySelectorAll('.js-filter-collections');
  const productGrid = document.querySelector('.collection__grid');
  const loader = document.querySelector('.loader');
  const noResults = document.querySelector('.no-results');

  let currentCollection = getCurrentCollection();

  // Get current collection from URL
  function getCurrentCollection() {
    const path = window.location.pathname;
    const match = path.match(/\/collections\/([^\/]+)/);
    return match ? match[1] : 'all';
  }

  function getSelectedFilters() {
    const tags = Array.from(filterTags)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    const brands = Array.from(filterBrands)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    return { tags, brands };
  }

  function buildURL(collection) {
    // Fetch all products from collection (no URL filters)
    return `/collections/${collection}`;
  }

  function showLoader() {
    if (loader) loader.style.display = 'block';
    if (noResults) noResults.style.display = 'none';
    
    // Fade out current products
    const items = productGrid.querySelectorAll('.collection__grid__item');
    items.forEach(item => item.style.opacity = '0.3');
  }

  function hideLoader() {
    if (loader) loader.style.display = 'none';
  }

  function filterProducts() {
    const { tags, brands } = getSelectedFilters();
    const url = buildURL(currentCollection);
    
    showLoader();
    
    // Fetch the collection page
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(html => {
        // Parse the HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find the product grid in the response
        const newGrid = doc.querySelector('.collection__grid');
        
        if (newGrid) {
          // Extract just the product items
          const newProducts = newGrid.querySelectorAll('.collection__grid__item');
          
          // Remove existing products
          const existingProducts = productGrid.querySelectorAll('.collection__grid__item');
          existingProducts.forEach(item => item.remove());
          
          let matchCount = 0;
          
          // Filter products client-side by checking tags/title AND brands/title
          if (newProducts.length > 0) {
            newProducts.forEach(product => {
              const productTags = product.getAttribute('data-tags').toLowerCase();
              const productBrand = product.getAttribute('data-brand').toLowerCase();
              const productTitle = product.querySelector('.collection__grid__item__details__title h6')?.textContent.toLowerCase() || '';
              
              let showProduct = true;
              
              // Check if product matches tag filter (either in tags OR title)
              if (tags.length > 0) {
                const tagsLower = tags.map(t => t.toLowerCase());
                // ALL selected tags must match (AND logic)
                const hasMatch = tagsLower.every(tag => 
                  productTags.includes(tag) || productTitle.includes(tag)
                );
                if (!hasMatch) showProduct = false;
              }
              
              // Check if product matches brand filter (either in vendor OR title)
              if (brands.length > 0) {
                const brandsLower = brands.map(b => b.toLowerCase());
                // ALL selected brands must match (AND logic)
                const hasMatch = brandsLower.every(brand => 
                  productBrand.includes(brand) || productTitle.includes(brand)
                );
                if (!hasMatch) showProduct = false;
              }
              
              // Add product if it passes all filters
              if (showProduct) {
                if (loader) {
                  productGrid.insertBefore(product.cloneNode(true), loader);
                } else {
                  productGrid.appendChild(product.cloneNode(true));
                }
                matchCount++;
              }
            });
            
            // Check if any products matched
            if (matchCount === 0 && noResults) {
              noResults.style.display = 'block';
            }
          } else {
            // No products found
            if (noResults) noResults.style.display = 'block';
          }
          
          // Also update pagination if it exists
          const newPagination = doc.querySelector('.pagination');
          const oldPagination = document.querySelector('.pagination');
          if (newPagination && oldPagination) {
            oldPagination.innerHTML = newPagination.innerHTML;
          }
        }
        
        hideLoader();
        
        // Update URL with query params (not path)
        const params = new URLSearchParams();
        if (tags.length) params.set('tags', tags.join(','));
        if (brands.length) params.set('brands', brands.join(','));
        const newUrl = `/collections/${currentCollection}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({ filters: { tags, brands }, collection: currentCollection }, '', newUrl);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        hideLoader();
        
        // Show error message
        const existingError = productGrid.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = '<p style="color: red; padding: 20px; text-align: center;">Error loading products. Please try again.</p>';
        
        if (loader) {
          productGrid.insertBefore(errorMsg, loader);
        } else {
          productGrid.appendChild(errorMsg);
        }
      });
  }

  // Add event listeners to filter checkboxes
  filterTags.forEach(checkbox => {
    checkbox.addEventListener('change', filterProducts);
  });

  filterBrands.forEach(checkbox => {
    checkbox.addEventListener('change', filterProducts);
  });

  // Handle collection filter clicks - NAVIGATE to new collection
  filterCollections.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the collection URL
      const href = this.getAttribute('href');
      
      // Navigate to the collection (this will reload the page with the new collection)
      window.location.href = href;
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.filters) {
      // Restore filter state
      const { tags, brands, collection } = e.state;
      
      // Update current collection if changed
      if (collection && collection !== currentCollection) {
        currentCollection = collection;
      }
      
      filterTags.forEach(cb => {
        cb.checked = tags.includes(cb.value);
      });
      
      filterBrands.forEach(cb => {
        cb.checked = brands.includes(cb.value);
      });
      
      filterProducts();
    } else {
      // No state, just reload
      location.reload();
    }
  });

  // On page load, check if URL has filters and set checkboxes
  (function initializeFilters() {
    const params = new URLSearchParams(window.location.search);
    const urlTags = params.get('tags')?.split(',').filter(Boolean) || [];
    const urlBrands = params.get('brands')?.split(',').filter(Boolean) || [];
    
    // Check the appropriate checkboxes based on URL params
    urlTags.forEach(tag => {
      filterTags.forEach(cb => {
        if (cb.value === tag) cb.checked = true;
      });
    });
    
    urlBrands.forEach(brand => {
      filterBrands.forEach(cb => {
        if (cb.value === brand) cb.checked = true;
      });
    });
    
    // If there are filters in URL, apply them
    if (urlTags.length > 0 || urlBrands.length > 0) {
      filterProducts();
    }
  })();
})();