/*------------------------------------------------------------------
Import styles
------------------------------------------------------------------*/

import './../styles/style.scss';

console.log('Shopify Skeleton 1.3 💀');

import './predictive-search';
import Shop from './shop';
// import {Products} from './products';
import  './products';
import $ from 'jquery';
import slick from 'slick-carousel';


$(() => {
    
    // let _products = new Products($('.js-products')[0]);
    
    
    document.querySelectorAll('.js-reorder').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const items = JSON.parse(button.dataset.items);
            
            try {
                const response = await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ items })
                });
                
                if (!response.ok) throw new Error('Failed to add order items');
                const data = await response.json();
                console.log('Reorder success:', data);
                window.location.href = '/cart';
            } catch (error) {
                console.error('Reorder error:', error);
                alert('Could not reorder. Please try again.');
            }
        });
    });
    
    $('input[name="prescription-check"]').change((e) => {
        $('input[name="prescription-check"]').not(e.target).prop('checked', false);
    });
    
    const scrollHandler = () => {
        let scrollHeight = $('.bannerSlim').height();
        let scrollAmount = window.scrollY;
        
        let opacity = (scrollHeight - scrollAmount) / scrollHeight
        let scale = 1.1 - ((scrollHeight - scrollAmount) / scrollHeight) / 10;
        
        $('.bannerSlim__image').css({ opacity: opacity.toFixed(2) });
        $('.bannerSlim__image img').css({ transform: `scale(${scale})` });
        
    };
    
    scrollHandler();
    
    window.addEventListener('scroll', scrollHandler);
    
    let SHOP = new Shop($('body'));
    
    let tick;
    let hovered = false;
    let percent = 0;
    let $productSliderProgress = $('.js-gallery-progress');
    let $productSliderProgressCircle = $('.js-gallery-progress-circle');
    let $productSlider = $('.js-product-imagery-slider');
    
    /**
    * Start the progress bar animating 
    */
    const startProgressbar = () => {
        resetProgressbar();
        hovered = false;
        percent = 0;
        tick = setInterval(interval, 10);
    };
    
    /**
    * Set our animation speed for the progress bar
    */
    const interval = () => {
        if (!hovered) percent += .19;
        $productSliderProgress.css({ width: percent + "%" });
        $productSliderProgressCircle.attr('stroke-dashoffset', (percent * Math.PI));
    };
    
    /**
    * Reset the progress bars' animation to zero 
    */
    const resetProgressbar = () => {
        $productSliderProgress.css({ width: 0 + '%' });
        $productSliderProgressCircle.attr('stroke-dashoffset', (0));
        clearInterval(tick);
    };
    
    $productSlider.hover(
        () => hovered = true,
        () => startProgressbar()
    );
    
    $productSlider.hover(
        () => hovered = true,
        () => hovered = false, resetProgressbar()
    );
    
    //  Declare our slider event handlers
    $productSlider
    .on('init', () => startProgressbar())
    .on('beforeChange', () => startProgressbar());
    
    // Product slider 
    $productSlider.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        autoplaySpeed: 5000,
        autoplay: true,
        customPaging() {
            return '<span></span>';
        },
        responsive: [
            {
                breakpoint: 768,
                settings: { dots: true }
            }
        ]
    });
    
    $('.js-cursor-previous').on('click', (e) => {
        e.preventDefault();
        $productSlider.slick('slickPrev');
    });
    
    $('.js-cursor-next').on('click', (e) => {
        e.preventDefault();
        $productSlider.slick('slickNext');
    });
    
    
    
    $('body').on('change', '[name="id"]', (e) => {
        e.preventDefault();
        let $this = $(e.currentTarget);
        let variant = $this.val();
        
        console.log(variant)
        
        $('.js-variation-price').text(window.inventories[variant].price)
        
        let image_id = $this.attr('data-id');
        
        if (image_id) {
            let image_index = $(`.js-product-slider-item-image[data-id="${image_id}"]`).attr('data-index');
            console.log(image_index);
            $productSlider.slick('slickGoTo', image_index, true);
        }
        
    });
    
    if ($('.js-radio:checked').length) $('.js-radio:checked').trigger('change');
    
    
    
    
    let $body = $('body');
    
    $body.on('click', '.js-my-cart', (e) => {
        e.preventDefault();
        SHOP.openSideCart();
    });
    
    $body.on('click', '.js-change-quantity-inline', (e) => {
        e.preventDefault();
        let $this = $(e.currentTarget);
        let $quantity = $this.parent().find('input');
        let quantity = parseInt($quantity.val());
        quantity = ($this.attr('data-type') === 'subtract') ? quantity - 1 : quantity + 1;
        if (quantity < 1) quantity = 1;
        $quantity.val(quantity);
    });
    
});


/*------------------------------------------------------------------
Filtering
------------------------------------------------------------------*/
