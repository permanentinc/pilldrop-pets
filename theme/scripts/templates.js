import numeral from 'numeral';


/**
* Return a template for a recommendation item
* @returns {string}
*/
export const recommendation = (product) =>
    `<a href="/products/${product.handle}" class="recommendations__wrap__item [ js-in-view ]">
        ${(product.images && product.images.length) ?
        `<div class="recommendations__wrap__item__image" style="background-image:url(${product.images[0].src});"></div>` :
        `<div class="recommendations__wrap__item__image"></div>`}
        <div class="recommendations__wrap__item__overlay"></div>
        <div class="recommendations__wrap__item__gradient"></div>
        <div class="recommendations__wrap__item__title">
            <h3 data-splitting>${product.title}</h3>
        </div>
    </a>`;


/**
* Return a template for a predictive search placeholder item
* @returns {string}
*/
export const product = (product) =>
    `<div class="products__grid__item [ js-in-view ]">
        ${(product.sale === true) ? `<span class="products__grid__item__sale">Sale</span>` : ``}
        ${(product.images.length) ?
        `<a href="${product.handle}" class="products__grid__item__image [ js-cursor-eye ]">
            <img src="${product.images[0].src}" alt="${product.handle}" />
        </a>`
        :
        `<a href="${product.handle}" class="products__grid__item__image products__grid__item__image--empty [ js-cursor-eye ]"></a>`}
        <a href="${product.handle}" class="products__grid__item__details [ js-cursor-eye ]">
            <p class="products__grid__item__details__type">
              ${product.product_type}&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 22 16">
                <path fill="#FFF" fill-rule="evenodd" d="M13.4765714,0.0234857143 L21.452,8.00005714 L13.4765714,15.9765714 L11.8091714,14.3091714 L16.9288571,9.18948571 L0.142857143,9.18971429 L0.142857143,6.80914286 L16.9278571,6.80848571 L11.8091714,1.69088571 L13.4765714,0.0234857143 Z"></path>
              </svg>
            </p>
            <div class="products__grid__item__details__title">
              <h6><strong>${product.title} &nbsp;</strong></h6>
              <p>&nbsp; $${product.variants[0].price}</p>
            </div>
        </a>
    </div>`;


/**
* Return a template for a predictive search placeholder item
* @returns {string}
*/
export const searchPlaceholder = () =>
    `<div class="searchPane__wrapper__item searchPane__wrapper__item--placeholder">
        <div class="searchPane__wrapper__item__image"><span></span></div>
        <div class="searchPane__wrapper__item__details"><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>
        </div>
    </div>`;

/**
* Return a template for a predictive search item
* @returns {string}
*/
export const searchItem = (product) =>
    `<a href="${product.url}" class="searchPane__wrapper__item">
        <div class="searchPane__wrapper__item__image">
            <img src="${product.image || 'https://cdn.shopify.com/s/files/1/0617/3982/7386/products/RX_780b8dd4-821b-426c-9a6b-a4e2b3fc1c18.jpg'}">
        </div>
        <div class="searchPane__wrapper__item__details">
            <p><strong>${product.title}</strong></p>
            <p>${product.type}</p>
            <p><strong>$${product.price}</strong>${(product.compare_at_price_max !== "0.00") ? `<span class="strike">$${product.compare_at_price_max}</span>` : ``}</p>
        </div>
    </a>`;

/**
* Return a template for a sidecart item
* @returns {string}
*/
export const emptySideCart = () =>
    `<p class="sidecart__inner__list__empty"><br>Your cart is empty, click bellow to view our store</p>
     <p class="sidecart__inner__list__emptybutton">
         <a href="/collections/all" class="button button--yellow">Shop Now
         </a>
     </p>`;


/**
* Return a template for a cart item
* @returns {string}
*/
export const emptyCart = () =>
    `<p class="cart__wrap__form__table__body__empty">Your cart is empty, but it doesn't have to stay that way!</p>
     <p class="cart__wrap__form__table__body__emptybutton">
        <a href="/collections/all" class="button">Shop Now
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 22 16">
                <path fill="#FFF" fill-rule="evenodd" d="M13.4765714,0.0234857143 L21.452,8.00005714 L13.4765714,15.9765714 L11.8091714,14.3091714 L16.9288571,9.18948571 L0.142857143,9.18971429 L0.142857143,6.80914286 L16.9278571,6.80848571 L11.8091714,1.69088571 L13.4765714,0.0234857143 Z" />
            </svg>
        </a>
     </p>`;

/**
* Return a template for a cart placeholder item
* @returns {string}
*/
export const cartItemPlaceholder = () =>
    `<tr class="cart__wrap__form__table__body__row cart__wrap__form__table__body__row--placeholder">
        <td class="cart__wrap__form__table__body__row__cell">
            <a href="#" class="cart__wrap__form__table__body__row__cell__image">
              <span></span>
            </a>
        </td>
        <td class="cart__wrap__form__table__body__row__cell cart__wrap__form__table__body__row__cell--details">
            <h5>&nbsp;</h5>
            <p>&nbsp;</p>
        </td>
        <td class="cart__wrap__form__table__body__row__cell cart__wrap__form__table__body__row__cell--quantity">
            <span></span>
        </td>
        <td class="cart__wrap__form__table__body__row__cell cart__wrap__form__table__body__row__cell--total">
          <h6>&nbsp;</h6>
        </td>
        <td class="cart__wrap__form__table__body__row__cell">
            <a href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 20 25">
                    <path fill-rule="evenodd" d="M5.48752834,0 L5.48752834,3.62811791 L0.0453514739,3.62811791 L0.0453514739,5.44217687 L1.85941043,5.44217687 L1.85941043,25.3968254 L18.185941,25.3968254 L18.185941,5.44217687 L20,5.44217687 L20,3.62811791 L14.5578231,3.62811791 L14.5578231,0 L5.48752834,0 Z M7.3015873,1.81405896 L12.7437642,1.81405896 L12.7437642,3.62811791 L7.3015873,3.62811791 L7.3015873,1.81405896 Z M3.67346939,5.44217687 L16.3718821,5.44217687 L16.3718821,23.5827664 L3.67346939,23.5827664 L3.67346939,5.44217687 Z M6.39455782,8.16326531 L6.39455782,20.861678 L8.20861678,20.861678 L8.20861678,8.16326531 L6.39455782,8.16326531 Z M11.8367347,8.16326531 L11.8367347,20.861678 L13.6507937,20.861678 L13.6507937,8.16326531 L11.8367347,8.16326531 Z" />
                </svg>
            </a>
        </td>
    </tr>`;


/**
* Return a template for a cart item
* @returns {string}
*/
export const cartItem = (product, index) =>
    `<tr class="cart__wrap__form__table__body__row" data-index="${index + 1}">
    <td class="cart__wrap__form__table__body__row__cell">
        <a href="${product.url}" class="cart__wrap__form__table__body__row__cell__image">
          <img src="${product.image || 'https://cdn.shopify.com/s/files/1/0617/3982/7386/products/RX_780b8dd4-821b-426c-9a6b-a4e2b3fc1c18.jpg'}" alt="${product.title}" />
        </a>
    </td>
    <td class="cart__wrap__form__table__body__row__cell cart__wrap__form__table__body__row__cell--details">
        <a href="${product.url}">
          <h5>${product.title}</h5>
        </a>
        ${(product.product_type) ? `<p>${product.product_type}</p>` : ``}
    </td>
    <td class="cart__wrap__form__table__body__row__cell">
        <div class="quantity quantity--inline quantity--cart">
        <a class="quantity__subtract [ js-change-quantity ]" data-cart-item-index="${index + 1}" data-quantity="${product.quantity - 1}" href="/cart/change?line=${index + 1}&amp;quantity=${product.quantity - 1}">
            <svg width="30" height="30" viewbox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C0 6.716 6.716 0 15 0zm0 2.5C8.096 2.5 2.5 8.096 2.5 15S8.096 27.5 15 27.5 27.5 21.904 27.5 15 21.904 2.5 15 2.5zm9 10.88v3.24H6v-3.24h18z" fill="#FFF" fill-rule="nonzero" />
            </svg>
        </a>
        <p class="quantity__quantity">${product.quantity}</p class="quantity__subtract">
        <a class="quantity__add [ js-change-quantity ]"  data-cart-item-index="${index + 1}" data-quantity="${product.quantity + 1}" href="/cart/change?line=${index + 1}&amp;quantity=${product.quantity + 1}">
            <svg width="30" height="30" viewbox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C0 6.716 6.716 0 15 0zm0 2.5C8.096 2.5 2.5 8.096 2.5 15S8.096 27.5 15 27.5 27.5 21.904 27.5 15 21.904 2.5 15 2.5zM16.62 6v7.38H24v3.24h-7.38V24h-3.24v-7.38H6v-3.24h7.38V6h3.24z" fill="#FFF" fill-rule="nonzero" />
            </svg>
        </a>
        </div>
    </td>
    <td class="cart__wrap__form__table__body__row__cell cart__wrap__form__table__body__row__cell--total">
    ${(product.total_discount > 0) ?
        `<h6 class="discounted"><strong>${numeral(product.original_line_price).divide(100).format('$0,0.00')}</strong><strong>${numeral(product.line_price).divide(100).format('$0,0.00')}</strong></h6>`
        :
        `<h6>${numeral(product.line_price).divide(100).format('$0,0.00')}</h6>`
    }
        
    </td>
    <td class="cart__wrap__form__table__body__row__cell">
        <a href="/cart/change?line=${index + 1}&amp;quantity=0" data-cart-item-index="${index + 1}" class="[ js-remove-from-cart ]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 20 25">
                <path fill-rule="evenodd" d="M5.48752834,0 L5.48752834,3.62811791 L0.0453514739,3.62811791 L0.0453514739,5.44217687 L1.85941043,5.44217687 L1.85941043,25.3968254 L18.185941,25.3968254 L18.185941,5.44217687 L20,5.44217687 L20,3.62811791 L14.5578231,3.62811791 L14.5578231,0 L5.48752834,0 Z M7.3015873,1.81405896 L12.7437642,1.81405896 L12.7437642,3.62811791 L7.3015873,3.62811791 L7.3015873,1.81405896 Z M3.67346939,5.44217687 L16.3718821,5.44217687 L16.3718821,23.5827664 L3.67346939,23.5827664 L3.67346939,5.44217687 Z M6.39455782,8.16326531 L6.39455782,20.861678 L8.20861678,20.861678 L8.20861678,8.16326531 L6.39455782,8.16326531 Z M11.8367347,8.16326531 L11.8367347,20.861678 L13.6507937,20.861678 L13.6507937,8.16326531 L11.8367347,8.16326531 Z" />
            </svg>
        </a>
    </td>
</tr>`;

/**
* Return a template for a sidecart item
* @returns {string}
*/
export const sidecartItem = (product, index) =>
    `<div class="sidecart__inner__list__item">
        <a href="${product.url}" class="sidecart__inner__list__item__image"><span style="background-image:url('${product.image || 'https://cdn.shopify.com/s/files/1/0617/3982/7386/products/RX_780b8dd4-821b-426c-9a6b-a4e2b3fc1c18.jpg'}')"></span></a>
        <a href="${product.url}" class="sidecart__inner__list__item__details">
            <p><strong>${product.title}</strong></p>
            ${(product.product_type) ? `<p>${product.product_type}</p>` : ``}
            ${(product.total_discount > 0) ?
        `<p class="discounted"><strong>${numeral(product.original_line_price).divide(100).format('$0,0.00')}</strong><strong>${numeral(product.line_price).divide(100).format('$0,0.00')}</strong></p>`
        :
        `<p><strong>${numeral(product.line_price).divide(100).format('$0,0.00')}</strong></p>`
    }
        </a>
        <a href="${product.url}" class="sidecart__inner__list__item__remove [ js-remove-from-side-cart ]" data-cart-item-index="${index}">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                <polygon fill-rule="evenodd" points="29.854 25.3 19.482 14.927 29.854 4.553 25.3 0 14.928 10.374 4.555 0 .002 4.553 10.375 14.927 0 25.3 4.553 29.854 14.928 19.48 25.3 29.854" />
            </svg>
        </a>
    </div>`;

/**
* Return a template for a sidecart item
* @returns {string}
*/
export const sidecartItemPlaceholder = () =>
    `<div class="sidecart__inner__list__item sidecart__inner__list__item--placeholder">
        <a href="#" class="sidecart__inner__list__item__image"><span></span></a>
        <a href="#" class="sidecart__inner__list__item__details">
            <p><strong>&nbsp;</strong></p>
            <p><strong>&nbsp;</strong></p>
            <p><strong>&nbsp;</strong></p>
        </a>
        <a href="#" class="sidecart__inner__list__item__remove">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                <polygon fill-rule="evenodd" points="29.854 25.3 19.482 14.927 29.854 4.553 25.3 0 14.928 10.374 4.555 0 .002 4.553 10.375 14.927 0 25.3 4.553 29.854 14.928 19.48 25.3 29.854" />
            </svg>
        </a>
    </div>`;
