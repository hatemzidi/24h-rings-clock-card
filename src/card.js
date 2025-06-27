import {html, svg, LitElement, nothing} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';
import {repeat} from 'lit/directives/repeat.js';

import * as Constants from './const';
import * as Utils from "./utils";

import styles from './card.css';

export class RingsClockCard extends LitElement {

    // LitElement Static Styles
    static styles = styles;

    // Reactive Properties
    static get properties() {
        return {
            hass: { attribute: false },
            config: { attribute: false },
            tic: { attribute: false }
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

        // Initialize configuration for different clock elements with sensible defaults
        this.rangesConfig = config.ranges || [];
        this.markersConfig = config.markers || [];
        this.sunConfig = {
            entity: 'sun.sun', // Default sun entity
            show: true, // Default show sun markers
            color: 'var(--accent-color, #FFA500)', // Default sun marker color
            show_day_night_arcs: false, // Default to false
            day_arc_color: 'var(--day-arc-color, #FFD700)', // Default day color
            night_arc_color: 'var(--night-arc-color, #34495e)', // Default night color
            ...(config.sun || {}) // Override with user config
        };

        // Toggles and styles for various display elements
        this.handColor = config.hand_color || 'var(--accent-color, #03a9f4)';
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
    updated(changed) {
        super.updated(changed);

        if (!this._config || !this.hass) {
            return;
        }
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
                <div class="card-header" id="card-header">
                    <div class="card-title-text ${classMap({ hidden: !(this.headerTitle || this.headerIcon) })}" id="card-title-text">${this.headerTitle ?? nothing}</div>
                    <div class="card-header-icon ${classMap({ hidden: !(this.headerTitle || this.headerIcon) })}" id="card-header-icon">
                        <ha-icon icon="${this.headerIcon ?? nothing}"></ha-icon>
                    </div>
                </div>
                <div class="clock-container">
                    <div class="clock">
                        <div class="clock-face" id="clock-face">
                            <div class="hours-markers">
                                ${map(range(24), (i) => this.renderHourMarker(i))}
                            </div>

                            <div class="svg-container" role="timer" aria-live="polite" aria-label="24-hour clock displaying current time and configured events">
                                <svg
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="xMidYMid meet"
                                >
                                    ${this.renderDayNightArc()}
                                    ${this.renderSunMarkers()}

                                    ${this.rangesConfig.map((range, idx) => this.renderRing(range, idx))}

                                    ${this.markersConfig.map((marker, idx) => this.renderMarker(marker, idx))}


                                    ${this.renderHourHand()}

                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="legends-container ${classMap({hidden: !this.showLegends})}" id="legends-container">
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
                    id="hour-${hour}"
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


    renderHourHand() {
        return svg`
                    <g class="hour_hand"
                       transform="rotate(${this.tic} 50 50)">
                        <line class="pointer" 
                              stroke-linecap="round" 
                              x1="50"
                              y1="57"
                              x2="50"
                              y2="3"
                              stroke="color-mix(in srgb, ${this.handColor} 80%, var(--primary-text-color))"
                              stroke-width="1.5">
                        </line>
                        <circle class="pointer"
                                cx="50"
                                cy="50"
                                r="2.5"
                                fill="color-mix(in srgb, ${this.handColor} 80%, var(--primary-text-color))">
                        </circle>
                        <circle class="pointer-centre"
                                fill="var(--card-background-color, white)"
                                cx="50"
                                cy="50"
                                r="1.4">
                        </circle>
                    </g>`;
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
        this.tic = (totalMinutes / (24 * 60)) * 360;
    }

    // Custom Markers
    /**
     * Renders the marker
     * @param {object} markerConfig - Configuration for the custom marker.
     * @param {number} index - Index of the marker, used for unique ID.
     */

    renderMarker(markerConfig, index){
        if (markerConfig.indicator === 'dot')
            return svg`${this.renderDot(markerConfig, index)}`;
        else // default
            return svg`${this.renderEvent(markerConfig, index)}`;
    }


    /**
     * Renders a single custom marker on the clock face.
     * @param {Object} eventConfig - Configuration for the event marker.
     * @param {number} index - Index of the event, used for unique ID.
     */
    renderEvent(eventConfig, index) {
        const time = (typeof eventConfig.time === 'object' && eventConfig.time !== null) ? eventConfig.time : Utils.parseTime(eventConfig.time, this._hass);

        if (!time) {
            console.warn(`RingsClockCard: Could not parse time for marker "${eventConfig.name || `marker_${index}`}". Skipping marker.`);
            return svg``;
        }
        const eventAngle = Utils.timeToAngle(time);
        const color = eventConfig.color || 'var(--primary-text-color, #333)';
        const markerLabel = `${eventConfig.name || 'Event'}: ${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;

        return svg`<g
                    id="marker_${index}"
                    class="marker"
                    transform="rotate(${eventAngle + 180} 50 50)"
                    aria-label="${markerLabel}"
                    role="presentation"
                    >
                        <path stroke="var(--card-background-color, white)"
                              stroke-linejoin="bevel"
                              d="M 50 100 l 2.6775 -4.6375660372656693 h -5.355 Z"
                              fill="${color}"
                              stroke-width="0.5"
                              >
                        </path>
                </g>`

    }

    /**
     * Renders a single dot marker on the clock face.
     * @param {Object} dotConfig - Configuration for the event dot.
     * @param {number} index - Index of the event, used for unique ID.
     */
    renderDot(dotConfig, index) {
        const time = (typeof dotConfig.time === 'object' && dotConfig.time !== null) ? dotConfig.time : Utils.parseTime(dotConfig.time, this._hass);

        if (!time) {
            console.warn(`RingsClockCard: Could not parse time for dot marker "${dotConfig.name || `dot_${index}`}". Skipping marker.`);
            return svg``;
        }

        const ringWidth = 50; //todo(hatem) use RADII
        const dotOutline = 0.7;
        const dotRadius = 1.7;

        const color = dotConfig.color || 'var(--primary-text-color, #333)';

        const dotAngle = Utils.timeToAngle(time);
        const dotCoord = Utils.getCoordFromDegrees(dotAngle, ringWidth);
        const dotLabel = `${dotConfig.name || 'Dot'}: ${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;


        return svg`
            <g class="indicator"
               id="dot_${index}"
               aria-label="${dotLabel}"
               role="presentation">
              <circle
                class="dot-outline"
                cx=${dotCoord[0]}
                cy=${dotCoord[1]}
                r=${dotRadius + dotOutline / 2}
                clip-path="url(#ring-clip)"
                fill="${ dotConfig.fill || 'var(--card-background-color, white)' }"
              />
              <circle
                class="dot"
                cx=${dotCoord[0]}
                cy=${dotCoord[1]}
                r=${dotRadius - dotOutline / 2}
                fill=${color}
              />
            </g>`;
    }

    // Sun Markers
    /**
     * Renders sunrise and sunset markers based on the 'sun.sun' entity.
     */
    renderSunMarkers() {
        const sunEntityId = this.sunConfig.entity || 'sun.sun';

        // Check if sun markers are enabled and sun entity data is available
        if (!this.sunConfig.show || !this._hass || !this._hass.states[sunEntityId]) {
            return svg``;
        }

        const sunState = this._hass.states[sunEntityId];
        const attributes = sunState.attributes;

        if (attributes.next_rising && attributes.next_setting) {
            const sunrise = new Date(attributes.next_rising);
            const sunset = new Date(attributes.next_setting);

            if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
                console.warn(`RingsClockCard: Invalid sunrise or sunset times for entity "${sunEntityId}". Skipping sun markers.`);
                return svg``;
            }

            return svg`
                        ${this.renderDot({
                            time: { hours: sunrise.getHours(), minutes: sunrise.getMinutes() },
                            color: this.sunConfig.color,
                            fill: 'white',
                            name: 'Sunrise' // Added for better a11y label
                        }, 'sun_rise')}
                        ${this.renderDot({
                            time: { hours: sunset.getHours(), minutes: sunset.getMinutes() },
                            color: this.sunConfig.color,
                            name: 'Sunset' // Added for better a11y label
                        }, 'sun_set')}
            `;
        } else {
            console.warn(`RingsClockCard: Sun entity "${sunEntityId}" is missing 'next_rising' or 'next_setting' attributes. Skipping sun markers.`);
            return svg``;
        }
    }


    // Sun Arcs
    /**
     * Renders sunrise and sunset arcs based on the 'sun.sun' entity.
     */
    renderDayNightArc() {
        const showDayNightArcs = this.sunConfig.show_day_night_arcs;
        const sunEntityId = this.sunConfig.entity || 'sun.sun';
        const mainRing = Constants.RING_RADII['ring5']; // Use the named constant for clarity

        if (!showDayNightArcs || !this._hass || !this._hass.states[sunEntityId]) {
            return svg`
                ${// Full Ring as default "day" background if arcs are off
                this.renderRing({
                    start_time: {hours: 0, minutes: 0},
                    end_time: {hours: 23, minutes: 59}, 
                    color: 'var(--divider-color, #e0e0e0)', // Default full ring color
                    ring: mainRing, 
                    name: 'Clock', 
                    show_in_legend: false, 
                }, 'full_day_arc')}
            `;
        }

        const sunState = this._hass.states[sunEntityId];
        const attributes = sunState.attributes;

        if (attributes.next_rising && attributes.next_setting) {
            const sunrise = new Date(attributes.next_rising);
            const sunset = new Date(attributes.next_setting);

            if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
                console.warn(`RingsClockCard: Invalid sunrise or sunset times for entity "${sunEntityId}". Skipping day/night arcs.`);
                return svg``;
            }

            return svg`
                ${// Day Arc (Sunrise to Sunset)
                this.renderRing({
                    start_time: {hours: sunrise.getHours(), minutes: sunrise.getMinutes()},
                    end_time: {hours: sunset.getHours(), minutes: sunset.getMinutes()},
                    color: this.sunConfig.day_arc_color,
                    ring: mainRing,
                    name: 'Daylight', 
                    show_in_legend: false, // Generally don't show dynamic sun arcs in legend
                }, 'day_arc')}
                ${// Night Arc (Sunset to Sunrise)
                this.renderRing({
                    start_time: {hours: sunset.getHours(), minutes: sunset.getMinutes()},
                    end_time: {hours: sunrise.getHours(), minutes: sunrise.getMinutes()},
                    color: this.sunConfig.night_arc_color,
                    ring: mainRing,
                    name: 'Night', 
                    show_in_legend: false, // Generally don't show dynamic sun arcs in legend
                }, 'night_arc')}
            `;

        } else {
            console.warn(`RingsClockCard: Sun entity "${sunEntityId}" is missing 'next_rising' or 'next_setting' attributes. Skipping day/night arcs.`);
            return svg``;
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
                    <span class="legend_name">${range.name}</span>
                </div>`)
            }
            ${repeat(this.markersConfig, (marker) => html`
                <div class="legend_item ${classMap({ hidden: !marker.name || marker.show_in_legend === false })}">
                    <div class="legend_icon" style="color: ${marker.color || 'var(--primary-text-color, #333)'};">
                        ${(marker.icon && marker.icon.startsWith('mdi:')) ? html`
                            <ha-icon icon="${marker.icon}"></ha-icon>` : html`
                            <span>${marker.icon || Constants.DEFAULT_CUSTOM_MARKER_ICON_TEXT}</span>`}
                    </div>
                    <span class="legend_name">${marker.name}</span>
                </div>`)
            }
        `;
    }


    /**
     * Renders a single time range as an arc on the clock face.
     * @param {object} rangeConfig - Configuration for the time range.
     * @param {string|number} id - Unique ID for the arc, used for `id` attribute.
     */
    renderRing(rangeConfig, id) {
        // Use the defined RING_RADII constant for clarity
        const ringRadius = Constants.RING_RADII[rangeConfig.ring] || Constants.RING_RADII['ring1']; // Default to ring1 if not specified or invalid

        const startTime = (typeof rangeConfig.start_time === 'object' && rangeConfig.start_time !== null) ? rangeConfig.start_time : Utils.parseTime(rangeConfig.start_time, this._hass);
        const endTime = (typeof rangeConfig.end_time === 'object' && rangeConfig.end_time !== null) ? rangeConfig.end_time : Utils.parseTime(rangeConfig.end_time, this._hass);

        if (!startTime || !endTime) {
            console.warn(`RingsClockCard: Could not parse start or end time for range "${rangeConfig.name || `range_${id}`}". Skipping ring.`);
            return svg``;
        }

        const startAngle = Utils.timeToAngle(startTime);
        let endAngle = Utils.timeToAngle(endTime);

        // Adjust end angle if it crosses midnight (e.g., 22:00 to 06:00)
        if (endAngle < startAngle) {
            endAngle += 360;
        }

        const color = rangeConfig.color || 'var(--accent-color, #03a9f4)';

        // Default width if not specified or invalid
        const arcWidth = Utils.getSize(rangeConfig.width) || 3;

        // Calculate the start and end points of the arc
        const startPoint = Utils.polarToCartesian(ringRadius, endAngle); // SVG arc direction is opposite, so swap start/end for path calculation
        const endPoint = Utils.polarToCartesian(ringRadius, startAngle);

        // Determine if the arc is a 'large-arc' (greater than 180 degrees)
        const angleDifference = (endAngle - startAngle + 360) % 360; // Ensure positive difference
        const largeArcFlag = angleDifference > 180 ? 1 : 0;

        // The sweep flag (1 for clockwise, 0 for counter-clockwise)
        // For a 24-hour clock rotating clockwise, and drawing arcs from start to end time
        // if we swap start and end points for `A` command, we need sweepFlag=0 for clockwise visual arc.
        const sweepFlag = 0;

        // Construct the SVG path data string
        // M: Move to (startPoint)
        // A: Arc (rx ry x-axis-rotation large-arc-flag sweep-flag endX endY)
        const d = `M ${startPoint.x} ${startPoint.y} A ${ringRadius} ${ringRadius} 0 ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`;

        // Line cap logic: 'butt' for 'ring5' (often used for background/day-night arcs)
        // and 'round' for other rings, providing a visually distinct style.
        const lineCap = rangeConfig.ring === 'ring5' ? 'butt' : 'round';

        // Accessibility label for the arc
        const arcLabel = `${rangeConfig.name || 'Time Range'}: ${startTime.hours.toString().padStart(2, '0')}:${startTime.minutes.toString().padStart(2, '0')} to ${endTime.hours.toString().padStart(2, '0')}:${endTime.minutes.toString().padStart(2, '0')}`;


        return svg`
        <path
          class="ring"
          id="arc_${id}"
          d="${d}"
          stroke="${color}"
          stroke-width="${arcWidth}"
          fill="none"
          stroke-linecap="${lineCap}"
          aria-label="${arcLabel}"
          role="presentation"
        />
      `;
    }


    // Card Metadata & Example Config
    /**
     * Provides a stub configuration for the card, used for example purposes in the Home Assistant UI editor.
     * @returns {object} An example configuration object.
     */
    static getStubConfig() {
        return {
            "title": "24-Hours Rings Clock",
            "header_icon": "mdi:clock-outline",
            "hand_color": "#03a9f4",
            "show_hours": true,
            "show_legends": true,
            "show_header": true,
            "sun": {
                "entity": "sun.sun",
                "show": true,
                "color": "#FFA500",
                "show_day_night_arcs": true,
                "day_arc_color": "#FFD700",
                "night_arc_color": "#34495e"
            },
            "ranges": [{
                "start_time": "0:00",
                "end_time": "8:00",
                "ring": "ring4",
                "name": "Early Morning",
                "color": "purple",
                "width": "S",
            }, {
                "start_time": "input_datetime.start_time",
                "end_time": "input_datetime.end_time",
                "ring": "ring3",
                "color": "pink",
                "name": "Meeting Block",
                "width": "M",
            }, {
                "start_time": "06:00",
                "end_time": "18:00",
                "ring": "ring2",
                "name": "Standard Workday",
                "width": "XS",
            }],
            "markers": [{
                "time": "12:00",
                "name": "Noon",
                "icon": "mdi:white-balance-sunny",
                "color": "gold",
                "indicator": "dot",
                "show_in_legend": false
            }, {
                "time": "22:31", "name": "Bedtime", "icon": "mdi:bed", "color": "purple"
            }, {
                "time": "input_datetime.my_custom_marker_time",
                "name": "Reminder",
                "icon": "mdi:calendar-star",
                "color": "green"
            }]
        };
    }
}