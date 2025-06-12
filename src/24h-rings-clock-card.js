class RingsClockCard extends HTMLElement {

    // private properties
    _config;
    _hass;
    _elements = {};

    constructor() {
        super();
        this.doCard();
        this.doStyle();
        this.doAttach();
        this.doQueryElements();
        this.updateClock = this.updateClock.bind(this);
        this.updateSunMarkers = this.updateSunMarkers.bind(this);
    }

    setConfig(config) {
        this._config = config;
        this.ranges = config.ranges || [];
        this.sunConfig = config.sun || {};
        this.doRender();
    }

    set hass(hass) {
        this._hass = hass;
        this.doUpdateConfig()
        this.updateClock();
        this.updateSunMarkers();
    }

    doAttach() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(this._elements.style, this._elements.card);
    }

    doStyle() {
        this._elements.style = document.createElement("style");
        this._elements.style.textContent = `
                ha-card {
                    padding: 20px;
                }
                
                .hidden { display: none; }

                .card-header {
                    color: inherit;
                }

                .clock-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }

                .clock {
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    background: var(--card-background-color, #fff);
                    border: 2px solid var(--divider-color, #e0e0e0);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    margin: 0 auto;
                    flex-shrink: 0;
                }

                .clock-face {
                    width: 380px;
                    height: 380px;
                    border-radius: 50%;
                    position: relative;
                    background: var(--card-background-color, #fff);
                }

                .hour-marker {
                    position: absolute;
                    width: 2px;
                    height: 10px;
                    background: var(--secondary-text-color, #666);
                    left: 50%;
                    top: 5px;
                    transform-origin: 50% 185px;
                    transform: translateX(-50%);
                }

                .hour-marker.major {
                    width: 3px;
                    height: 20px;
                    background: var(--primary-text-color, #333);
                    top: 5px;
                }

                .hour-number {
                    position: absolute;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--primary-text-color, #333);
                    width: 24px;
                    height: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    left: 50%;
                    top: 30px;
                    transform-origin: 50% 160px;
                    transform: translateX(-50%);
                    user-select: none;
                }

                .hour-number span {
                    display: block;
                    width: 100%;
                    text-align: center;
                }

                .ring1, .ring2, .ring3, .ring4 {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px dashed var(--divider-color, #e0e0e0);
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }

                .ring1 { width: 250px; height: 250px; }
                .ring2 { width: 230px; height: 230px; }
                .ring3 { width: 210px; height: 210px; }
                .ring4 { width: 190px; height: 190px; }

                .arc {
                    position: absolute;
                    border-radius: 50%;
                    border: 5px solid transparent;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    mask: radial-gradient(transparent calc(50% - 5px), black calc(50% - 4px), black calc(50% + 4px), transparent calc(50% + 5px));
                    -webkit-mask: radial-gradient(transparent calc(50% - 5px), black calc(50% - 4px), black calc(50% + 4px), transparent calc(50% + 5px));
                }

                .arc.ring1 { width: 345px; height: 345px; }
                .arc.ring2 { width: 320px; height: 320px; }
                .arc.ring3 { width: 290px; height: 290px; }
                .arc.ring4 { width: 260px; height: 260px; }

                .hour-hand {
                    position: absolute;
                    width: 6px;
                    height: 100px;
                    background: var(--accent-color, #03a9f4);
                    left: 50%;
                    top: 50%;
                    transform-origin: 50% 100%;
                    transform: translateX(-50%) translateY(-100%);
                    border-radius: 3px;
                    transition: transform 0.1s linear;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .center-dot {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: var(--accent-color, #03a9f4);
                    border-radius: 50%;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 8px rgba(0,0,0,0.2);
                }

                .sun-marker {
                    position: absolute;
                    font-size: 16px;
                    color: var(--accent-color, #FFA500);
                    left: 50%;
                    top: 5px;
                    transform-origin: 50% 185px;
                    transform: translateX(-50%);
                    font-weight: bold;
                    pointer-events: none;
                    background: var(--card-background-color, #fff);
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 0 5px rgba(0,0,0,0.3);
                }

                .sun-marker span {
                    display: block;
                    transform: translateY(1px);
                }
                
                .sun-marker ha-icon {
                    --mdc-icon-size: 18px;
                    color: inherit; 
                }
                
                .sun-marker span {
                    display: block;
                    transform: translateY(1px); 
                }

                @media (max-width: 480px) {
                    .clock {
                        width: 300px;
                        height: 300px;
                    }
                    
                    .clock-face {
                        width: 280px;
                        height: 280px;
                    }
                    
                    .hour-number {
                        font-size: 11px;
                        transform-origin: 50% 115px;
                        top: 25px;
                    }
                    
                    .hour-hand {
                        height: 70px;
                    }

                    .hour-marker {
                        transform-origin: 50% 135px;
                        height: 8px;
                    }

                    .hour-marker.major {
                        transform-origin: 50% 135px;
                        height: 15px;
                    }

                    .ring1, .arc.ring1 { width: 200px; height: 200px; }
                    .ring2, .arc.ring2 { width: 180px; height: 180px; }
                    .ring3, .arc.ring3 { width: 160px; height: 160px; }
                    .ring4, .arc.ring4 { width: 140px; height: 140px; }

                    .sun-marker {
                        transform-origin: 50% 135px;
                        font-size: 14px;
                        width: 18px;
                        height: 18px;
                    }
                }
            `
    }

    doCard() {
        this._elements.card = document.createElement("ha-card");
        this._elements.card.innerHTML = `         
            <div class="card-header hidden" id="card-header"></div>
            <div class="clock-container">
                <div class="clock">
                    <div class="clock-face" id="clock-face">
                        <div class="ring1"></div>
                        <div class="ring2"></div>
                        <div class="ring3"></div>
                        <div class="ring4"></div>
                    </div>
                </div>
            </div>
        `;

    }

    doQueryElements() {
        const card = this._elements.card;
        this._elements.cardTitle = card.querySelector("#card-header");
        this._elements.clockFace = card.querySelector("#clock-face");
    }

    doUpdateConfig() {
        if (this._config.title) {
            this._elements.cardTitle.textContent = `${this._config.title}`;
            this._elements.cardTitle.classList.remove("hidden");
        }
    }

    doRender() {
        this.createHourMarkers();
        this.createArcs();
        this.createSunMarkers();
        this.createHourHandAndCenterDot();
    }

    createHourMarkers() {
        const fragment = document.createDocumentFragment();
        for (let hour = 0; hour < 24; hour++) {
            const marker = document.createElement('div');
            marker.className = hour % 6 === 0 ? 'hour-marker major' : 'hour-marker';
            marker.style.transform = `translateX(-50%) rotate(${hour * 15}deg)`;
            fragment.appendChild(marker);

            const hourNumber = document.createElement('div');
            hourNumber.className = 'hour-number';
            hourNumber.style.transform = `translateX(-50%) rotate(${hour * 15}deg)`;

            const textSpan = document.createElement('span');
            textSpan.textContent = hour.toString().padStart(2, '0');
            textSpan.style.transform = `rotate(${-hour * 15}deg)`;

            hourNumber.appendChild(textSpan);
            fragment.appendChild(hourNumber);
        }
        this._elements.clockFace.appendChild(fragment);
    }

    createArcs() {
        this.arcElements = [];
        const fragment = document.createDocumentFragment();

        this.ranges.forEach((range, index) => {
            const arc = document.createElement('div');
            arc.className = `arc ${range.ring || 'ring1'}`;
            arc.id = `arc-${index}`;
            fragment.appendChild(arc);
            this.arcElements.push({ element: arc, range: range });
            this.updateArc(arc, range);
        });
        this._elements.clockFace.appendChild(fragment);
    }


    createHourHandAndCenterDot() {
        this.hourHand = document.createElement('div');
        this.hourHand.className = 'hour-hand';
        this.hourHand.id = 'hourHand';
        this._elements.clockFace.appendChild(this.hourHand);

        this.centerDot = document.createElement('div');
        this.centerDot.className = 'center-dot';
        this.centerDot.id = 'centerDot';
        this._elements.clockFace.appendChild(this.centerDot);
    }

    updateArc(arcElement, range) {
        const startTime = this.parseTime(range.start_time);
        const endTime = this.parseTime(range.end_time);

        if (!startTime || !endTime) {
            arcElement.style.background = 'transparent';
            return;
        }

        const startAngle = this.timeToAngle(startTime);
        let endAngle = this.timeToAngle(endTime);

        if (endAngle < startAngle) {
            endAngle += 360;
        }

        const arcLength = endAngle - startAngle;

        const color = range.color || 'var(--accent-color, #03a9f4)';

        arcElement.style.background = `conic-gradient(from ${startAngle}deg, transparent 0deg, ${color} 0deg, ${color} ${arcLength}deg, transparent ${arcLength}deg)`;
    }

    parseTime(timeInput) {
        if (!timeInput) return null;

        let timeStr = timeInput;

        if (typeof timeInput === 'string' && timeInput.includes('.')) {
            const entityState = this._hass?.states[timeInput];
            if (entityState && entityState.state !== 'unavailable' && entityState.state !== 'unknown') {
                timeStr = entityState.state;
            } else {
                return null;
            }
        }

        const parts = timeStr.split(':').map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { hours: parts[0], minutes: parts[1] };
        }

        return null;
    }

    timeToAngle(time) {
        return (time.hours * 15) + (time.minutes * 0.25);
    }

    updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const totalMinutes = hours * 60 + minutes + seconds / 60;
        const hourAngle = (totalMinutes / (24 * 60)) * 360;

        if (this.hourHand) {
            this.hourHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`;
        }

        if (this._hass) {
            this.arcElements.forEach(({ element, range }) => {
                this.updateArc(element, range);
            });
        }
    }

    createSunMarkers() {
        const showSunMarkers = this.sunConfig.show !== false;

        if (showSunMarkers) {
            this.sunriseMarker = document.createElement('div');
            this.sunriseMarker.className = 'sun-marker';
            this.sunriseMarker.id = 'sunrise-marker';
            // Check if sunrise_icon starts with 'mdi:' to use ha-icon, otherwise use span for text/other icons
            if (this.sunConfig.sunrise_icon && this.sunConfig.sunrise_icon.startsWith('mdi:')) {
                this.sunriseMarker.innerHTML = `<ha-icon icon="${this.sunConfig.sunrise_icon}"></ha-icon>`;
            } else {
                this.sunriseMarker.innerHTML = `<span>${this.sunConfig.sunrise_icon || '↑'}</span>`;
            }
            this._elements.clockFace.appendChild(this.sunriseMarker);

            this.sunsetMarker = document.createElement('div');
            this.sunsetMarker.className = 'sun-marker';
            this.sunsetMarker.id = 'sunset-marker';
            // Check if sunset_icon starts with 'mdi:' to use ha-icon, otherwise use span for text/other icons
            if (this.sunConfig.sunset_icon && this.sunConfig.sunset_icon.startsWith('mdi:')) {
                this.sunsetMarker.innerHTML = `<ha-icon icon="${this.sunConfig.sunset_icon}"></ha-icon>`;
            } else {
                this.sunsetMarker.innerHTML = `<span>${this.sunConfig.sunset_icon || '↓'}</span>`;
            }
            this._elements.clockFace.appendChild(this.sunsetMarker);
        } else {
            this.sunriseMarker = null;
            this.sunsetMarker = null;
        }
    }

    updateSunMarkers() {
        const showSunMarkers = this.sunConfig.show !== false;
        const sunEntityId = this.sunConfig.entity || 'sun.sun'; // Use configured entity or default  //todo(hatem): don't process if false

        if (!showSunMarkers || !this._hass || !this._hass.states[sunEntityId]) {
            if (this.sunriseMarker) this.sunriseMarker.style.display = 'none';
            if (this.sunsetMarker) this.sunsetMarker.style.display = 'none';
            return;
        }

        const sunState = this._hass.states[sunEntityId];
        const attributes = sunState.attributes;

        if (attributes.next_rising && attributes.next_setting) {
            const sunrise = new Date(attributes.next_rising);
            const sunset = new Date(attributes.next_setting);

            if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
                if (this.sunriseMarker) this.sunriseMarker.style.display = 'none';
                if (this.sunsetMarker) this.sunsetMarker.style.display = 'none';
                return;
            }

            if (this.sunriseMarker) {
                this.sunriseMarker.style.display = '';
                this.sunriseMarker.style.color = this.sunConfig.color || 'var(--accent-color, #FFA500)'; // Apply custom color or default
            }
            if (this.sunsetMarker) {
                this.sunsetMarker.style.display = '';
                this.sunsetMarker.style.color = this.sunConfig.color || 'var(--accent-color, #FFA500)'; // Apply custom color or default
            }

            const sunriseAngle = this.dateToAngle(sunrise);
            const sunsetAngle = this.dateToAngle(sunset);

            if (this.sunriseMarker) {
                this.sunriseMarker.style.transform = `translateX(-50%) rotate(${sunriseAngle}deg)`;

                if (this.sunConfig.sunrise_icon && this.sunConfig.sunrise_icon.startsWith('mdi:')) {
                    this.sunriseMarker.querySelector('ha-icon').style.transform = `rotate(${-sunriseAngle}deg)`;
                } else {
                    this.sunriseMarker.querySelector('span').style.transform = `rotate(${-sunriseAngle}deg)`;
                }

            }

            if (this.sunsetMarker) {
                this.sunsetMarker.style.transform = `translateX(-50%) rotate(${sunsetAngle}deg)`;

                if (this.sunConfig.sunset_icon && this.sunConfig.sunset_icon.startsWith('mdi:')) {
                    this.sunsetMarker.querySelector('ha-icon').style.transform = `rotate(${-sunsetAngle}deg)`;
                } else {
                    this.sunsetMarker.querySelector('span').style.transform = `rotate(${-sunsetAngle}deg)`;
                }

            }
        } else {
            if (this.sunriseMarker) this.sunriseMarker.style.display = 'none';
            if (this.sunsetMarker) this.sunsetMarker.style.display = 'none';
        }
    }

    dateToAngle(date) {
        return this.timeToAngle({ hours: date.getHours(), minutes: date.getMinutes() });
    }


    static getStubConfig() {
        return {
            title: '24-Hour Rings Clock',
            sun: { 
                entity: 'sun.sun',
                show: true,
                color: '#FFA500', // Example color
                sunrise_icon: 'mdi:weather-sunny-alert', // Example MDI icon for sunrise
                sunset_icon: 'mdi:weather-night' // Example MDI icon for sunset
            },
            ranges: [{
                start_time: 'input_datetime.start_time',
                end_time: 'input_datetime.end_time',
                ring: 'ring1',
                color: '#03a9f4'
            }, {
                start_time: '06:00',
                end_time: '18:00',
                ring: 'ring2',
                color: '#FFD700'
            }]
        };
    }
}

customElements.define('rings-clock-card', RingsClockCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'rings-clock-card',
    name: '24-Hours Rings Clock Card',
    description: 'Enhanced 24-hours analog clock with time ranges and more options'
});

console.info('%c24H-RINGS-CLOCK-CARD %c0.0.0',
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',);