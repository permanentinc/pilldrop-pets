/*------------------------------------------------------------------
Shop
------------------------------------------------------------------*/
import $ from 'jquery';
import * as templates from './templates';
import { Notyf } from 'notyf';
import numeral from 'numeral';

export default class Shop {
    constructor($el) {
        this.$shop = $el;
        this.notyf = new Notyf();
        this.$sortBy = this.$shop.find('.js-sort-by');
        this.$cartBubble = this.$shop.find('.js-cart-bubble');
        this.$cartCount = this.$shop.find('.js-cart-count');
        this.$sideCart = this.$shop.find('.js-side-cart');
        this.$sideCartItems = this.$shop.find('.js-side-cart-items');
        this.$cartItems = this.$shop.find('.js-cart-items');
        this.getCart(null, []);
        this.attachEventListeners();
        this.filters = {};
    }

    attachEventListeners() {
        $(document).keyup((e) => { if (e.keyCode == 27) this.closeSideCart(e) });
        this.$shop.mouseup((e) => { if (!$('.sidecart__inner').is(e.target) && $('.sidecart__inner').has(e.target).length === 0) this.closeSideCart(e) });
        $('.js-add-to-cart').on('click', (e) => { this.addToCart(e) });
        $('.js-open-side-cart').on('click', (e) => { this.openSideCart(e) });
        $('.js-close-side-cart').on('click', (e) => { this.closeSideCart(e) });
        this.$shop.on('click', '.js-remove-from-side-cart', (e) => { this.removeFromSideCart(e) });
        this.$shop.on('click', '.js-remove-from-cart', (e) => { this.removeFromCart(e) });
        this.$shop.on('click', '.js-change-quantity', (e) => { this.changeCartItem(e) });
        this.$shop.on('change', '.js-change-variation', (e) => { this.updatePrice(e) });
    }

    getCart($button, updates = []) {
        $.getJSON('/cart.js', (cart) => {
            if ($button) $button.removeClass('busy');
            this.updateCartCount(cart.item_count);
            this.updateSideCart(cart);
            this.updateTotals(cart);
            this.updateCheckout(cart);
            if (updates.includes('openSideCart')) this.openSideCart();
            if (updates.includes('updateCart')) this.updateCart(cart);
        });
    }


    updateCheckout(cart) {
        if (cart.item_count === 0) {
            $('.js-checkout-totals').hide();
        } else {
            $('.js-checkout-totals').show();
        }
    }

    updateTotals(cart) {
        $('.js-total').text(numeral(cart.total_price).divide(100).format('$0,0.00'));
    }

    updateCartCount(count = 0) {
        if (count === 0) {
            this.$cartBubble.removeClass('active');
            this.$cartCount.text(0);
        } else {
            this.$cartBubble.addClass('active');
            this.$cartCount.text(count);
        }
    }

    addToCart(e) {
        e.preventDefault();
        let $this = $(e.currentTarget);
        let params = {
            url: '/cart/add.js',
            data: $this.closest('form').serialize(),
            dataType: 'json'
        };

        $this.addClass('busy');

        $.post(params)
            .done(() => this.getCart($this, ['openSideCart']))
            .fail((response) => this.catchError(response.responseJSON));
    }

    removeFromSideCart(e) {
        e.preventDefault();
        let $this = $(e.currentTarget);
        let params = {
            url: '/cart/change.js',
            data: { quantity: 0, line: parseInt($this.attr('data-cart-item-index')) + 1 },
            dataType: 'json'
        };

        this.sidecartLoading($('.sidecart__inner__list__item').length);

        $.post(params)
            .done(() => this.getCart($this, ['openSideCart']))
            .fail((response) => this.catchError(response.responseJSON));
    }

    updatePrice(e) {
        let variant = $('.js-change-variation').val();
        $('.js-variation-price').text(window.inventories[variant].price)
    }

    changeCartItem(e) {
        e.preventDefault();
        let $this = $(e.currentTarget);
        let params = {
            url: '/cart/change.js',
            data: { quantity: parseInt($this.attr('data-quantity')), line: parseInt($this.attr('data-cart-item-index')) },
            dataType: 'json'
        };

        this.cartLoading($('.cart__wrap__form__table__body__row').length);

        $.post(params)
            .done(() => this.getCart($this, ['updateCart']))
            .fail((response) => this.catchError(response.responseJSON));
    }

    removeFromCart(e) {
        e.preventDefault();
        let $this = $(e.currentTarget);
        let params = {
            url: '/cart/change.js',
            data: { quantity: 0, line: parseInt($this.attr('data-cart-item-index')) },
            dataType: 'json'
        };

        this.cartLoading($('.cart__wrap__form__table__body__row').length);

        $.post(params)
            .done(() => this.getCart($this, ['updateCart']))
            .fail((response) => this.catchError(response.responseJSON));
    }

    showError(response) {
        this.$shop.find('.busy').removeClass('busy');
        this.notyf.error({
            message: response.description,
            duration: 4000,
            dismissible: true,
            icon: false
        });
    }

    cartLoading(count = 4) {
        this.$cartItems.empty();
        let html = ``;
        [...Array(count)].forEach(() => { html += templates.cartItemPlaceholder() });
        this.$cartItems.html(html);
    }

    sidecartLoading(count = 4) {
        this.$sideCartItems.empty();
        let html = ``;
        [...Array(count)].forEach(() => { html += templates.sidecartItemPlaceholder() });
        this.$sideCartItems.html(html);
    }

    updateCart(cart) {
        this.$cartItems.empty();
        if (cart.item_count) {
            cart.items.forEach((item, index) => this.$cartItems.append(templates.cartItem(item, index)));
            $('html').removeClass('cart-empty');
        } else {
            this.$cartItems.append(templates.emptyCart());
            $('html').addClass('cart-empty');
        }
    }

    updateSideCart(cart) {
        this.$sideCartItems.empty();
        if (cart.item_count) {
            cart.items.forEach((item, index) => this.$sideCartItems.append(templates.sidecartItem(item, index)));
            $('html').removeClass('side-cart-empty');
        } else {
            this.$sideCartItems.append(templates.emptySideCart());
            $('html').addClass('side-cart-empty');
        }
    }

    catchError(response) {
        switch (response.status) {
            case 422:
                this.showError(response);
                break;
            default:
                this.showError(response);
                break;
        }
    }

    openSideCart(e) {
        if (e) e.preventDefault();
        setTimeout(() => this.$sideCartItems.css({ 'overflow': 'auto' }), 800);
        $('html').addClass('side-cart-open');
    }

    closeSideCart(e) {
        e.preventDefault();
        this.$sideCartItems.css({ 'overflow': 'hidden' });
        $('html').removeClass('side-cart-open');
    }

    getSortValue() {
        return this.$sortBy.val() || this.defaultSort;
    }
}
