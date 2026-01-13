/*------------------------------------------------------------------
Newsletter Popup
------------------------------------------------------------------*/
import $ from 'jquery';
import Cookies from 'js-cookie';

export default class WarningPopup {
    constructor(el) {
        this.$el = $(el);
        this.sectionID = this.$el.attr('data-section-id');
        this.testMode = this.$el.attr('data-test-mode') !== 'false';
        this.cookieName = this.sectionID;
        this.daysBeforeReappear = parseInt(this.$el.attr('data-delay-days'));
        this.secondsBeforeShow = parseInt(this.$el.attr('data-delay-seconds'));
        this.cookie = Cookies.get(this.cookieName);
        if (this.testMode) this.removeCookie();
        this.init();
    }

    setCookie() {
        Cookies.set(this.cookieName, true, { 'expires': this.daysBeforeReappear });
    }

    removeCookie() {
        Cookies.remove(this.cookieName);
    }

    closeModal() {
        if (this.testMode) this.removeCookie();
        this.setCookie();
        this.hide();
    }

    openModal() {
        setTimeout(() => this.show(), this.secondsBeforeShow * 1000);
    }

    show() {
        $('html').addClass('popup-open');

        setTimeout(() => this.$el.addClass('animate-in'), 444);

        this.$el.on('click', '.js-close-modal', (e) => { e.preventDefault(), this.closeModal() });

        this.$el.on('click', (e) => {
            if (!this.$el.find('.popup__inner').is(e.target) && this.$el.find('.popup__inner').has(e.target).length === 0) this.closeModal();
        });

        $(document).keyup((e) => { if (e.keyCode === 27) this.closeModal() });

    }

    hide() {
        this.$el.addClass('animate-out');
        $('html').removeClass('popup-open');
        setTimeout(() => this.$el.removeClass('animate-in animate-out'), 3000);
    }

    init() {
        if (this.cookie !== 'true') this.openModal();
    }

}


