export default class RestaurantCard extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/restaurant-card/restaurant-card.css';

        this.restaurantName = this.getAttribute('restaurant-name') || 'Nazwa';
        this.restaurantImage = this.getAttribute('restaurant-image') || '';
        this.restaurantTags = this.getAttribute('tags') || '';
        this.restaurantRating = this.getAttribute('rating') || '4.5';
        this.restaurantRatingNumber = this.getAttribute('rating-number') || '20';
        this.restaurantWaitingTime = this.getAttribute('waiting-time') || '';
        this.restaurantDeliveryPrice = this.getAttribute('delivery-price') || '$$';
        this.restaurantMinPrice = this.getAttribute('min-price') || '$$';

        this.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div class="restaurant-card">
                <img src="${this.restaurantImage}"/>
                <div>
                    <h2 class="poppins-medium">${this.restaurantName}</h2>
                    <div>
                        <img src="../images/icons/star.png"/>
                        <span class="poppins-medium">${this.restaurantRating}</span>
                        <span class="poppins-light">(${this.restaurantRatingNumber})</span><span>•</span>
                        <span class="poppins-regular">${this.restaurantTags}</span>
                    </div>
                    <div>
                        <img src="../images/icons/clock.png"/>
                        <span class="poppins-light">${this.restaurantWaitingTime} min</span><span>•</span>
                        <img src="../images/icons/motorcycle.png"/>
                        <span class="poppins-light">${this.restaurantDeliveryPrice}</span><span>•</span>
                        <span class="poppins-light">min. ${this.restaurantMinPrice} zł</span>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('x-restaurant-card', RestaurantCard);