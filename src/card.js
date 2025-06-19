import { html, LitElement, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

import styles from './card.style';

export class RingsClockCard extends LitElement {

    // private properties
    _config;
    _hass;
    _elements = {};
    tic;


    //todo(hatem) : extract this outside
    // ========================================================================
    //  CONSTANTS (Defaults, Icons, Metadata)
    // ========================================================================
    static CARD_DESCRIPTION = 'Enhanced 24-hours analog clock with time ranges, sun information, custom markers, and more display options.';
    static CARD_VERSION = '0.0.1'; // Increment this with new features/fixes

    // Default Icons (text-based for simplicity if MDI is not used)
    static DEFAULT_SUNRISE_ICON_TEXT = '↑';
    static DEFAULT_SUNSET_ICON_TEXT = '↓';
    static DEFAULT_CUSTOM_MARKER_ICON_TEXT = '•';


    // declarative part
    static styles = styles;


    // ========================================================================
    //  Home Assistant Code
    // ========================================================================


    // internal reactive states
    static get properties() {
        return {
            rangesConfig: { state: true },
            markersConfig: { state: true },
            sunConfig: { state: true },
            handColor: { state: true },
            showRings: { state: true },
            showHours: { state: true },
            showLegends: { state: true },
        };
    }

    /**
     * Sets the card configuration. This method is called by Home Assistant
     * when the card's configuration changes.
     * @param {object} config - The card configuration object.
     */
    setConfig(config) {

        // Check if config has actually changed to avoid unnecessary re-renders
        if (JSON.stringify(this._config) === JSON.stringify(config)) {
            return;
        }
        this._config = config;

        this.rangesConfig = config.ranges || []; // Initialize time ranges
        this.markersConfig = config.markers || []; // Initialize custom markers
        this.sunConfig = config.sun || {}; // Initialize sun configuration

        // Toggles for various display elements
        this.handColor = config.hand_color;
        this.showRings = config.show_rings !== false;
        this.showHours = config.show_hours !== false;
        this.showLegends = config.show_legends !== false; // Default to true

        // Header specific configuration
        this.headerTitle = config.title; // Store the title
        this.headerIcon = config.header_icon; // New: Store the header icon

        // call set hass() to immediately adjust to a changed entity
        // while editing the entity in the card editor
        // if (this._hass) {
        //     this.hass = this._hass
        // }

        //this.doRender(); // Rerender the clock elements based on the new config
    }

    /**
     * Sets the Home Assistant object. This method is called by Home Assistant
     * whenever the Home Assistant state changes.
     * @param {object} hass - The Home Assistant object.
     */
    set hass(hass) {
        this._hass = hass;

        this.updateCard();

    }

    updateCard() {
        this.updateTic(); // Update clock hand position
        this.updateSunMarkers(); // Update sun marker positions
        //this.updateMarkers(); // Update custom marker positions
    }

// ========================================================================
    //  DOM MANIPULATION & STYLING
    // ========================================================================

    render() {
        return html`
            <ha-card>
                <div class="card-header ${classMap({ hidden: !(this.headerTitle || this.headerIcon) })}" id="card-header">
                    <div class="card-title-text" id="card-title-text">${this.headerTitle ?? nothing}</div>
                    <div class="card-header-icon" id="card-header-icon">
                        <ha-icon icon="${this.headerIcon ?? nothing}"></ha-icon>
                    </div>
                </div>
                <div class="clock-container">
                    <div class="clock">
                        <div class="clock-face" id="clock-face">
                            <div class="hours-markers">
                                ${map(range(24), (i) => this.renderHourMarker(i))}
                            </div>
                            <div class="hour_hand" style="${styleMap({background: this.handColor, transform: `translateX(-50%) translateY(-100%) rotate(${this.tic}deg)` })}"></div>
                            <div class="center-dot" style="${styleMap({background: this.handColor})}"></div>
                            <div class="rings">
                                <div class="ring1 ${classMap({ hidden: !this.showRings })}"></div>
                                <div class="ring2 ${classMap({ hidden: !this.showRings })}"></div>
                                <div class="ring3 ${classMap({ hidden: !this.showRings })}"></div>
                                <div class="ring4 ${classMap({ hidden: !this.showRings })}"></div>
                            </div>
                            <div class="arcs">
                                ${this.rangesConfig.map((range, idx) => this.renderRange(range, idx))}
                            </div>
                            <div class="markers">
                                ${this.markersConfig.map((marker, idx) => this.renderMarker(marker, idx))}
                            </div>
                        </div>
                    </div>
                    <div class="legends-container ${classMap({ hidden: !this.showLegends })}" id="legends-container"></div>
                </div>
                <ha-card>
        `;

    }

    updated() {
        this.updateCard();
    }

    firstUpdated() {
        this._elements.clockFace = this.renderRoot.querySelector("#clock-face");
        this._elements.rings = this._elements.clockFace.querySelectorAll('.static-ring');
        this._elements.legendsContainer = this.renderRoot.querySelector("#legends-container");
        this.doRender();
    }


    /**
     * Renders all dynamic elements of the clock (hour markers, arcs, hands, markers).
     * This is called on setConfig, so it clears and recreates elements as necessary.
     */
    doRender() {
        // Clear existing dynamic elements before re-rendering
        // This is important because setConfig might change configuration
        // that affects the number or type of elements (e.g., new ranges/markers)
        this._elements.clockFace.querySelectorAll('.hour-marker, .hour-number, .arc, .sun-marker, .custom-marker, #hourHand, #centerDot').forEach(el => el.remove());

       // this.createHourHandAndCenterDot();
        //this.createArcs();
        this.createSunMarkers();
        this.createLegends();
    }

    // ========================================================================
    //  CLOCK ELEMENTS (Hour Markers, Rings, Hand, Center Dot)
    // ========================================================================

    /**
     * Creates and appends the 24-hour markers and hour numbers to the clock face.
     */

    renderHourMarker(hour) {
        return html`
            <div
                    class="${classMap({major: hour % 6 === 0 })} hour_marker"
                    style="transform: translateX(-50%) rotate(${hour * 15}deg)"
            >
            </div>
            <div
                    class="hour_number ${classMap({ hidden: !this.showHours })}"
                    style="transform: translateX(-50%) rotate(${hour * 15}deg)"
            >
                <span style="transform: rotate(${-hour * 15}deg)">${hour.toString().padStart(2, '0')}</span>
            </div>
        `;
    }


    /**
     * Updates the position of the hour hand based on the current time.
     */
    updateTic() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Calculate total minutes in a 24-hour cycle for smooth rotation
        const totalMinutes = hours * 60 + minutes + seconds / 60;
        const hourAngle = (totalMinutes / (24 * 60)) * 360;

        this.tic= hourAngle;
    }

    // ========================================================================
    //  TIME RANGES (Arcs)
    // ========================================================================

    renderRange(rangeConfig, index){
        const startTime = this.parseTime(rangeConfig.start_time);
        const endTime = this.parseTime(rangeConfig.end_time);

        if (!startTime || !endTime) {
            return html``;
        }

        const startAngle = this.timeToAngle(startTime);
        let endAngle = this.timeToAngle(endTime);

        // Adjust end angle if it crosses midnight (e.g., 22:00 to 06:00)
        if (endAngle < startAngle) {
            endAngle += 360;
        }

        const arcLength = endAngle - startAngle;
        const color = rangeConfig.color || 'var(--accent-color, #03a9f4)';

        const divStyle = {
            color: color,
            background: `conic-gradient(from ${startAngle}deg, transparent 0deg, ${color} 0deg, ${color} ${arcLength}deg, transparent ${arcLength}deg)` // Apply conic gradient to create the arc
        };

        return html`
            <div id="arc_${index}" 
                 class="${rangeConfig.ring || 'ring1'} clock_arc"
                 style="${styleMap(divStyle)}"
                 
            >
            </div>
        `;
    }
    
    // ========================================================================
    //  TIME UTILITIES
    // ========================================================================

    /**
     * Parses a time input (e.g., "HH:MM" or an entity ID or entity.attribute path) into an object
     * with hours and minutes.
     * @param {string} timeInput - The time string, entity ID, or entity.attribute path.
     * @returns {object|null} An object { hours, minutes } or null if invalid.
     */
    parseTime(timeInput) {
        if (!timeInput) return null;

        let timeStr = timeInput;

        // Check if timeInput is an entity ID or an entity.attribute path
        if (typeof timeInput === 'string' && timeInput.includes('.')) {
            const parts = timeInput.split('#attributes#');
            const entityId = parts[0];
            const attributePath = parts.length > 1 ? parts[1] : null;

            const entityState = this._hass?.states[entityId];

            if (entityState && entityState.state !== 'unavailable' && entityState.state !== 'unknown') {
                if (attributePath) {
                    // Navigate through attributes to find the value
                    let attributeValue = entityState.attributes;
                    for (const attr of attributePath.split('.')) {
                        if (attributeValue && attributeValue.hasOwnProperty(attr)) {
                            attributeValue = attributeValue[attr];
                        } else {
                            attributeValue = null; // Path not found
                            break;
                        }
                    }

                    if (attributeValue) {
                        // If it's a date string (like next_rising/setting), parse it as a Date object first
                        const date = new Date(attributeValue);
                        if (!isNaN(date.getTime())) {
                            return { hours: date.getHours(), minutes: date.getMinutes() };
                        } else {
                            timeStr = String(attributeValue); // Treat as a direct time string if not a valid date
                        }
                    } else {
                        return null; // Attribute value not found or invalid
                    }
                } else {
                    timeStr = entityState.state; // Use the direct state if no attribute path
                }
            } else {
                return null; // Entity state is not available or invalid
            }
        }

        // Handle "HH:MM" format or value obtained from entity/attribute
        const parts = timeStr.split(':').map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { hours: parts[0], minutes: parts[1] };
        }

        return null; // Invalid time format
    }

    /**
     * Converts a time object (hours, minutes) to an angle in degrees for a 24-hour clock.
     * @param {object} time - An object with hours and minutes.
     * @returns {number} The angle in degrees (0-360).
     */
    timeToAngle(time) {
        // 24 hours * 15 degrees/hour = 360 degrees
        // 60 minutes * 0.25 degrees/minute = 15 degrees/hour
        return (time.hours * 15) + (time.minutes * 0.25);
    }

    /**
     * Converts a Date object to an angle in degrees for a 24-hour clock.
     * @param {Date} date - The Date object.
     * @returns {number} The angle in degrees (0-360).
     */
    dateToAngle(date) {
        return this.timeToAngle({ hours: date.getHours(), minutes: date.getMinutes() });
    }

    // ========================================================================
    //  CUSTOM MARKERS
    // ========================================================================


    renderMarker(markerConfig, index) {
        const time = this.parseTime(markerConfig.marker);

        if (!time) { // if time not valid
            return html``
        }
        const markerAngle = this.timeToAngle(time);
        
        const divStyle = {
            transform: `translateX(-50%) rotate(${markerAngle}deg)`,
            color: markerConfig.color ? `${markerConfig.color}` : '',
            background: 'var(--card-background-color, #fff)'
        };

        return html`
            <div class="marker"
                 style="${styleMap(divStyle)}"
                 id="custom-marker-${index}"
            >
                ${(markerConfig.icon && markerConfig.icon.startsWith('mdi:')) ? html`
                    <ha-icon style="transform: rotate(${-markerAngle}deg)" icon="${markerConfig.icon}"></ha-icon>` : ''}
            </div>
        `;
    }

    // ========================================================================
    //  SUN MARKERS
    // ========================================================================

    /**
     * Creates and appends the sunrise and sunset marker elements.
     * These elements are only created once during doRender if showSunMarkers is true.
     */
    createSunMarkers() {
        const showSunMarkers = this.sunConfig.show !== false;

        // Ensure existing markers are cleared if re-creating
        if (this._elements.sunriseMarker) this._elements.sunriseMarker.remove();
        if (this._elements.sunsetMarker) this._elements.sunsetMarker.remove();

        this._elements.sunriseMarker = null;
        this._elements.sunsetMarker = null;

        if (showSunMarkers) {
            const fragment = document.createDocumentFragment();

            this._elements.sunriseMarker = document.createElement('div');
            this._elements.sunriseMarker.className = 'sun-marker';
            this._elements.sunriseMarker.id = 'sunrise-marker';
            if (this.sunConfig.sunrise_icon && this.sunConfig.sunrise_icon.startsWith('mdi:')) {
                this._elements.sunriseMarker.innerHTML = `<ha-icon icon="${this.sunConfig.sunrise_icon}"></ha-icon>`;
            } else {
                this._elements.sunriseMarker.innerHTML = `<span>${this.sunConfig.sunrise_icon || RingsClockCard.DEFAULT_SUNRISE_ICON_TEXT}</span>`;
            }
            fragment.appendChild(this._elements.sunriseMarker);

            this._elements.sunsetMarker = document.createElement('div');
            this._elements.sunsetMarker.className = 'sun-marker';
            this._elements.sunsetMarker.id = 'sunset-marker';
            if (this.sunConfig.sunset_icon && this.sunConfig.sunset_icon.startsWith('mdi:')) {
                this._elements.sunsetMarker.innerHTML = `<ha-icon icon="${this.sunConfig.sunset_icon}"></ha-icon>`;
            } else {
                this._elements.sunsetMarker.innerHTML = `<span>${this.sunConfig.sunset_icon || RingsClockCard.DEFAULT_SUNSET_ICON_TEXT}</span>`;
            }
            fragment.appendChild(this._elements.sunsetMarker);

            this._elements.clockFace.appendChild(fragment);
        }
    }

    /**
     * Updates the position and visibility of sun (sunrise/sunset) markers.
     */
    updateSunMarkers() {
        const showSunMarkers = this.sunConfig.show !== false;
        const sunEntityId = this.sunConfig.entity || 'sun.sun';

        // Check if markers elements exist and are supposed to be shown
        if (!showSunMarkers || !this._elements.sunriseMarker || !this._elements.sunsetMarker || !this._hass || !this._hass.states[sunEntityId]) {
            if (this._elements.sunriseMarker) this._elements.sunriseMarker.style.display = 'none';
            if (this._elements.sunsetMarker) this._elements.sunsetMarker.style.display = 'none';
            return;
        }

        const sunState = this._hass.states[sunEntityId];
        const attributes = sunState.attributes;

        if (attributes.next_rising && attributes.next_setting) {
            const sunrise = new Date(attributes.next_rising);
            const sunset = new Date(attributes.next_setting);

            if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
                this._elements.sunriseMarker.style.display = 'none';
                this._elements.sunsetMarker.style.display = 'none';
                return;
            }

            this._elements.sunriseMarker.style.display = '';
            this._elements.sunriseMarker.style.color = this.sunConfig.color || 'var(--accent-color, #FFA500)';
            this._elements.sunsetMarker.style.display = '';
            this._elements.sunsetMarker.style.color = this.sunConfig.color || 'var(--accent-color, #FFA500)';


            const sunriseAngle = this.dateToAngle(sunrise);
            const sunsetAngle = this.dateToAngle(sunset);

            this._elements.sunriseMarker.style.transform = `translateX(-50%) rotate(${sunriseAngle}deg)`;
            const sunriseInnerContent = this._elements.sunriseMarker.querySelector('ha-icon') || this._elements.sunriseMarker.querySelector('span');
            if (sunriseInnerContent) {
                sunriseInnerContent.style.transform = `rotate(${-sunriseAngle}deg)`;
            }

            this._elements.sunsetMarker.style.transform = `translateX(-50%) rotate(${sunsetAngle}deg)`;
            const sunsetInnerContent = this._elements.sunsetMarker.querySelector('ha-icon') || this._elements.sunsetMarker.querySelector('span');
            if (sunsetInnerContent) {
                sunsetInnerContent.style.transform = `rotate(${-sunsetAngle}deg)`;
            }
        } else {
            this._elements.sunriseMarker.style.display = 'none';
            this._elements.sunsetMarker.style.display = 'none';
        }
    }

    // ========================================================================
    //  LEGENDS
    // ========================================================================

    /**
     * Renders the legends for arcs, custom markers, and sun markers.
     */
    createLegends() {
        const fragment = document.createDocumentFragment();

        // Add Arc Legends
        this.rangesConfig.forEach(range => {
            // Only add legend if a name is provided AND show_in_legend is true
            if (range.name && range.show_in_legend !== false) {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                legendItem.innerHTML = `
                    <div class="legend-color-box" style="background-color: ${range.color || 'var(--accent-color, #03a9f4)'};"></div>
                    <span>${range.name}</span>
                `;
                fragment.appendChild(legendItem);
            }
        });

        // Add Custom Marker Legends
        this.markersConfig.forEach(markerConfig => {
            // Only add legend if a name is provided and show_in_legend is not explicitly false
            // A name is generally expected for a legend entry
            if (markerConfig.name && markerConfig.show_in_legend !== false) {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';

                let iconHtml = '';
                if (markerConfig.icon && markerConfig.icon.startsWith('mdi:')) {
                    iconHtml = `<div class="legend-icon" style="color: ${markerConfig.color || 'var(--primary-text-color, #333)'};"><ha-icon icon="${markerConfig.icon}"></ha-icon></div>`;
                } else if (markerConfig.icon) {
                    iconHtml = `<div class="legend-icon" style="color: ${markerConfig.color || 'var(--primary-text-color, #333)'};"><span>${markerConfig.icon}</span></div>`;
                } else {
                    iconHtml = `<div class="legend-icon" style="color: ${markerConfig.color || 'var(--primary-text-color, #333)'};"><span>${RingsClockCard.DEFAULT_CUSTOM_MARKER_ICON_TEXT}</span></div>`;
                }

                // Display full name for legend
                legendItem.innerHTML = `${iconHtml}<span>${markerConfig.name || 'Custom Marker'}</span>`;
                fragment.appendChild(legendItem);
            }
        });

        this._elements.legendsContainer.appendChild(fragment);
    }

    // ========================================================================
    //  CARD METADATA & EXAMPLE CONFIG
    // ========================================================================

    /**
     * Provides a stub configuration for the card, used for example purposes.
     * @returns {object} An example configuration object.
     */
    static getStubConfig() {
        return {
            title: '24-Hour Rings Clock',
            header_icon: 'mdi:clock-outline', // Added new header icon
            hand_color: "#03a9f4",
            show_rings: true,
            show_hours: true,
            show_legends: true,
            sun: {
                entity: 'sun.sun',
                show: true,
                color: '#FFA500',
                sunrise_icon: 'mdi:weather-sunny-alert',
                sunset_icon: 'mdi:weather-night'
            },
            ranges: [{
                start_time: 'input_datetime.start_time',
                end_time: 'input_datetime.end_time',
                ring: 'ring1',
                color: '#03a9f4',
                name: 'Custom Event'
            }, {
                start_time: '06:00',
                end_time: '18:00',
                ring: 'ring2',
                color: '#FFD700',
                name: 'Daylight Hours',
                show_in_legend: false
            }, {
                start_time: 'sun.sun#attributes#next_setting', // Night arc
                end_time: 'sun.sun#attributes#next_rising',
                ring: 'ring1',
                color: '#34495e',
                name: 'Night'
            }, {
                start_time: 'sun.sun#attributes#next_rising', // Day arc
                end_time: 'sun.sun#attributes#next_setting',
                ring: 'ring1',
                color: '#FFD700',
                name: 'Day'
            }],
            markers: [
                {
                    marker: '12:00',
                    name: 'Noon',
                    icon: 'mdi:white-balance-sunny',
                    color: 'gold'
                },
                {
                    marker: '22:30',
                    name: 'Bedtime',
                    icon: 'mdi:bed',
                    color: 'purple'
                },
                {
                    marker: 'input_datetime.my_custom_marker_time',
                    name: 'Meeting',
                    icon: 'mdi:calendar-star',
                    color: 'green'
                }
            ],
        };
    }
}