/*------------------------------------------------------------------
Import styles
------------------------------------------------------------------*/

import './../styles/style.scss';

console.log('Shopify Skeleton 1.2 💀');

import './predictive-search';
import Shop from './shop';
import $ from 'jquery';
import slick from 'slick-carousel';


$(() => {


    $('input[name="prescription-check"]').change((e) => {
        // uncheck all other checkboxes
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
        () => startProgressbar());

    $productSlider.hover(
        () => hovered = true,
        () => hovered = false, resetProgressbar());

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


    // $body.on('click', '.js-click-through', (e) => {
    //     if ($('#agree').is(':checked')) {

    //     } else {
    //         e.preventDefault();
    //         let notyf = new Notyf();
    //         notyf.error({
    //             message: 'You must agree with the terms and conditions & health and safety guidelines to check out.',
    //             duration: 4000,
    //             dismissible: true,
    //             icon: false
    //         });
    //     }
    // });

});


/*------------------------------------------------------------------
Filtering
------------------------------------------------------------------*/

$(() => {
    let $body = $('body');


    const filterProducts = () => {
        $body.addClass('busy');
        let brands = [];
        $('.js-filter-brands:checked').each((i, el) => brands.push($(el).attr('id')));
        let tags = [];
        $('.js-filter-tags:checked').each((i, el) => tags.push($(el).attr('id')));


        let collection = [];

        $('.js-filter-collections.active').each((i, el) => collection.push($(el).attr('data-id')));



        // console.log('tags:' + tags)
        // console.log('brands:' + brands)
        // console.log('collections:' + collection)

        $('.collection__grid__item').each((i, el) => {

            let $this = $(el);


            let item_brands = $this.attr('data-brand').split(',');
            let item_tags = $this.attr('data-types').split(',');
            let item_collection = $this.attr('data-tags').split(',');

            $this.show();
            if (brands.length > 0 && !item_brands.some(brand => brands.includes(brand))) {
                $this.hide();
            }
            if (tags.length > 0 && !item_tags.some(tag => tags.includes(tag))) {
                $this.hide();
            }
            if (collection.length > 0 && !item_collection.some(tag => collection.includes(tag))) {
                $this.hide();
            }
        });

        setTimeout(() => {

            let visible = $('.collection__grid__item:visible').length;

            if (visible === 0) {
                $('.no-results').show();
            } else {
                $('.no-results').hide();
            }

            $body.removeClass('busy');

        }, 400);

    };

    filterProducts();

    $body.on('click', '.js-filter-collections', (e) => {
        e.preventDefault();
        let $this = $(e.currentTarget);
        if ($this.hasClass('active')) {
            $this.removeClass('active')
        } else {
            $('.js-filter-collections').removeClass('active');
            $this.addClass('active')
        }
        filterProducts();
    });

    $body.on('change', '.js-filter-tags', (e) => {
        e.preventDefault();
        filterProducts();
    });

    $body.on('change', '.js-filter-brands', (e) => {
        e.preventDefault();
        filterProducts();
    });

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const filterString = urlParams.get('filter')

    if (filterString && filterString.length) {
        let filters = filterString.split(',');
        filters.forEach(filter => {
            $(`.js-filter-tags[id="${filter.replaceAll('-', ' ')}"]`).prop('checked', true);
            $(`.js-filter-collections[data-id="${filter.replaceAll('-', ' ')}"]`).addClass('active');
        });
        filterProducts();
    }

});
