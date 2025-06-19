import { html, LitElement, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import { repeat } from 'lit/directives/repeat.js';

import styles from './card.style';

export class RingsClockCard extends LitElement {

    // Private Properties
    _config;
    _hass;
    tic;

    // Constants (Defaults, Icons, Metadata)
    static CARD_DESCRIPTION = 'Enhanced 24-hours analog clock with time ranges, sun information, custom markers, and more display options.';
    static CARD_VERSION = '0.0.1';
    static DEFAULT_SUNRISE_ICON_TEXT = '↑';
    static DEFAULT_SUNSET_ICON_TEXT = '↓';
    static DEFAULT_CUSTOM_MARKER_ICON_TEXT = '•';

    // LitElement Static Styles
    static styles = styles;

    // Reactive Properties
    static get properties() {
        return {
            rangesConfig: { state: true },
            markersConfig: { state: true },
            sunConfig: { state: true },
            handColor: { state: true },
            showRings: { state: true },
            showHours: { state: true },
            showLegends: { state: true },
            headerTitle: { state: true },
            headerIcon: { state: true },
        };
    }

    // Home Assistant Lifecycle
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

        // Initialize configuration for different clock elements
        this.rangesConfig = config.ranges || [];    //todo(hatem) default value
        this.markersConfig = config.markers || [];  //todo(hatem) default value
        this.sunConfig = {
            entity: 'sun.sun', // Default sun entity
            show: true, // Default show sun markers
            color: '#FFA500', // Default sun marker color
            sunrise_icon: 'mdi:weather-sunny', // Default sunrise icon
            sunset_icon: 'mdi:weather-night', // Default sunset icon
            show_day_night_arcs: false, // NEW: Default to false
            ...(config.sun || {}) // Override with user config
        };

        // Toggles and styles for various display elements
        this.handColor = config.hand_color;
        this.showRings = config.show_rings !== false;
        this.showHours = config.show_hours !== false;
        this.showLegends = config.show_legends !== false;

        // Header specific configuration
        this.headerTitle = config.title;
        this.headerIcon = config.header_icon;
    }

    /**
     * Sets the Home Assistant object. This method is called by Home Assistant
     * whenever the Home Assistant state changes.
     * @param {object} hass - The Home Assistant object.
     */
    set hass(hass) {
        this._hass = hass;
        // Trigger card update when Home Assistant state changes
        // Update clock hand position based on current time
        this.updateTic();
    }

    // LitElement Lifecycle Callbacks
    /**
     * Called after the component's DOM has been updated.
     */
    updated() {
        // Update clock hand position based on current time
        this.updateTic();
    }

    // Rendering Logic
    /**
     * Renders the main structure of the card.
     */
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
                            <div class="hour_hand" style="${styleMap({
                                background: this.handColor,
                                transform: `translateX(-50%) translateY(-100%) rotate(${this.tic}deg)`
                            })}"></div>
                            <div class="center-dot" style="${styleMap({ background: this.handColor })}"></div>
                            <div class="rings">
                                <div class="ring1 ${classMap({ hidden: !this.showRings })}"></div>
                                <div class="ring2 ${classMap({ hidden: !this.showRings })}"></div>
                                <div class="ring3 ${classMap({ hidden: !this.showRings })}"></div>
                                <div class="ring4 ${classMap({ hidden: !this.showRings })}"></div>
                            </div>
                            <div class="arcs">
                                ${this.rangesConfig.map((range, idx) => this.renderRange(range, idx))}
                                ${this.renderDayNightArc()}
                            </div>
                            <div class="markers">
                                ${this.markersConfig.map((marker, idx) => this.renderMarker(marker, idx))}
                            </div>
                            <div class="sun-markers">
                                ${this.renderSunMarkers()}
                            </div>
                        </div>
                    </div>
                    <div class="legends-container ${classMap({ hidden: !this.showLegends })}" id="legends-container">
                        ${this.renderLegends()}
                    </div>
                </div>
            </ha-card>
        `;
    }


    // Clock Elements
    /**
     * Creates and appends the 24-hour markers and hour numbers to the clock face.
     * @param {number} hour - The hour to render (0-23).
     */
    renderHourMarker(hour) {
        return html`
            <div
                    class="${classMap({ major: hour % 6 === 0 })} hour_marker"
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
     * Calculates the angle for a 24-hour clock rotation.
     */
    updateTic() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Calculate total minutes in a 24-hour cycle for smooth rotation
        const totalMinutes = hours * 60 + minutes + seconds / 60;
        // Each hour is 15 degrees (360 degrees / 24 hours)
        const hourAngle = (totalMinutes / (24 * 60)) * 360;

        this.tic = hourAngle;
    }

    // Time Ranges (Arcs)
    /**
     * Renders a single time range as an arc on the clock face.
     * @param {object} rangeConfig - Configuration for the time range.
     * @param {number} index - Index of the range, used for unique ID.
     */
    renderRange(rangeConfig, index) {
        const startTime = (typeof rangeConfig.start_time === 'object' && rangeConfig.start_time !== null) ? rangeConfig.start_time : this.parseTime(rangeConfig.start_time);
        const endTime = (typeof rangeConfig.end_time === 'object' && rangeConfig.end_time !== null) ? rangeConfig.end_time : this.parseTime(rangeConfig.end_time);

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
            // Create a conic gradient for the arc
            background: `conic-gradient(from ${startAngle}deg, transparent 0deg, ${color} 0deg, ${color} ${arcLength}deg, transparent ${arcLength}deg)`
        };

        return html`
            <div id="arc_${index}"
                 class="${rangeConfig.ring || 'ring1'} clock_arc"
                 style="${styleMap(divStyle)}"
            >
            </div>
        `;
    }

    // Custom Markers
    /**
     * Renders a single custom marker on the clock face.
     * @param {object} markerConfig - Configuration for the custom marker.
     * @param {number} index - Index of the marker, used for unique ID.
     */
    renderMarker(markerConfig, index) {
        const time = this.parseTime(markerConfig.marker);

        if (!time) {
            return html``;
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
                    <ha-icon style="transform: rotate(${-markerAngle}deg)" icon="${markerConfig.icon}"></ha-icon>` : html`
                    <span style="transform: rotate(${-markerAngle}deg)">${markerConfig.icon || RingsClockCard.DEFAULT_CUSTOM_MARKER_ICON_TEXT}</span>`}
            </div>
        `;
    }

    // Sun Markers
    /**
     * Renders sunrise and sunset markers based on the 'sun.sun' entity.
     */
    renderSunMarkers() {
        const sunEntityId = this.sunConfig.entity || 'sun.sun';

        // Check if sun markers are enabled and sun entity data is available
        if (!this.sunConfig.show || !this._hass || !this._hass.states[sunEntityId]) {
            return html``;
        }

        const sunState = this._hass.states[sunEntityId];
        const attributes = sunState.attributes;

        if (attributes.next_rising && attributes.next_setting) {
            const sunrise = new Date(attributes.next_rising);
            const sunset = new Date(attributes.next_setting);

            if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
                return html``;
            }

            const sunriseAngle = this.dateToAngle(sunrise);
            const sunsetAngle = this.dateToAngle(sunset);

            const sunriseDivStyle = {
                color: this.sunConfig.color || 'var(--accent-color, #FFA500)',
                transform: `translateX(-50%) rotate(${sunriseAngle}deg)`,
            };

            const sunsetDivStyle = {
                color: this.sunConfig.color || 'var(--accent-color, #FFA500)',
                transform: `translateX(-50%) rotate(${sunsetAngle}deg)`,
            };

            return html`
                <div id="sunrise-marker"
                     class="sun_marker ${classMap({ hidden: !this.sunConfig.show })}"
                     style="${styleMap(sunriseDivStyle)}"
                >
                    ${(this.sunConfig.sunrise_icon && this.sunConfig.sunrise_icon.startsWith('mdi:')) ? html`
                        <ha-icon style="transform: rotate(${-sunriseAngle}deg)"
                                 icon="${this.sunConfig.sunrise_icon}"></ha-icon>` : html`
                        <span style="transform: rotate(${-sunriseAngle}deg)">${this.sunConfig.sunrise_icon || RingsClockCard.DEFAULT_SUNRISE_ICON_TEXT}</span>`}
                </div>
                <div id="sunset-marker"
                     class="sun_marker ${classMap({ hidden: !this.sunConfig.show })}"
                     style="${styleMap(sunsetDivStyle)}"
                >
                    ${(this.sunConfig.sunset_icon && this.sunConfig.sunset_icon.startsWith('mdi:')) ? html`
                        <ha-icon style="transform: rotate(${-sunsetAngle}deg)" icon="${this.sunConfig.sunset_icon}"></ha-icon>` : html`
                        <span style="transform: rotate(${-sunsetAngle}deg)">${this.sunConfig.sunset_icon || RingsClockCard.DEFAULT_SUNSET_ICON_TEXT}</span>`}
                </div>`;
        } else {
            return html``;
        }
    }


    // Sun Arcs
    /**
     * Renders sunrise and sunset arcs based on the 'sun.sun' entity.
     */
    renderDayNightArc() {
        const showDayNightArcs = this.sunConfig.show_day_night_arcs;
        const sunEntityId = this.sunConfig.entity || 'sun.sun';

        if (!showDayNightArcs || !this._hass || !this._hass.states[sunEntityId]) {
            return;
        }

        const sunState = this._hass.states[sunEntityId];
        const attributes = sunState.attributes;

        if (attributes.next_rising && attributes.next_setting) {
            const sunrise = new Date(attributes.next_rising);
            const sunset = new Date(attributes.next_setting);

            if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
                return html``;
            }

            return html`
                <div class="sun_arcs">
                    ${
                            // Day Arc (Sunrise to Sunset)
                            this.renderRange({
                                start_time: { hours: sunrise.getHours(), minutes: sunrise.getMinutes() },
                                end_time: { hours: sunset.getHours(), minutes: sunset.getMinutes() },
                                color: this.sunConfig.day_arc_color || '#FFD700', // Default day color
                                ring: 'outer_arc day_night_arc',
                            }, 0)
                    }
                    ${
                            // Night Arc (Sunset to Sunrise)
                            this.renderRange({
                                start_time: { hours: sunset.getHours(), minutes: sunset.getMinutes() },
                                end_time: { hours: sunrise.getHours(), minutes: sunrise.getMinutes() },
                                color: this.sunConfig.night_arc_color || '#34495e', // Default night color
                                ring: 'outer_arc day_night_arc',
                            }, -1)
                    }
                </div>`;

        } else {
            return html``;
        }

    }


    // Legends
    /**
     * Renders the legends for arcs, custom markers, and sun markers.
     */
    renderLegends() {
        return html`
            ${repeat(this.rangesConfig, (range) => html`
                <div class="legend_item ${classMap({ hidden: !range.name || range.show_in_legend === false })}">
                    <div class="legend_color_box" style="background-color: ${range.color || 'var(--accent-color, #03a9f4)'};"></div>
                    <span>${range.name}</span>
                </div>`)
            }
            ${repeat(this.markersConfig, (marker) => html`
                <div class="legend_item ${classMap({ hidden: !marker.name || marker.show_in_legend === false })}">
                    <div class="legend_icon" style="color: ${marker.color || 'var(--primary-text-color, #333)'};">
                        ${(marker.icon && marker.icon.startsWith('mdi:')) ? html`
                            <ha-icon icon="${marker.icon}"></ha-icon>` : html`
                            <span>${marker.icon || RingsClockCard.DEFAULT_CUSTOM_MARKER_ICON_TEXT}</span>`}
                    </div>
                    <span>${marker.name}</span>
                </div>`)
            }
        `;
    }

    // Time Utilities
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

    // Card Metadata & Example Config
    /**
     * Provides a stub configuration for the card, used for example purposes in the Home Assistant UI editor.
     * @returns {object} An example configuration object.
     */
    static getStubConfig() {
        return {
            title: '24-Hour Rings Clock',
            header_icon: 'mdi:clock-outline',
            hand_color: "#03a9f4",
            show_rings: true,
            show_hours: true,
            show_legends: true,
            sun: {
                entity: 'sun.sun',
                show: true,
                color: '#FFA500',
                sunrise_icon: 'mdi:weather-sunny-alert',
                sunset_icon: 'mdi:weather-night',
                show_day_night_arcs: true, // Set to true to show them by default
                day_arc_color: '#FFD700', // Optional: customize day arc color
                night_arc_color: '#34495e', // Optional: customize night arc color
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
                    color: 'gold',
                    show_in_legend: false
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