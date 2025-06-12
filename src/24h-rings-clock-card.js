class RingsClockCard extends HTMLElement {

    // private properties
    _config;
    _hass;
    _elements = {};

    // ========================================================================
    //  CONSTANTS (Defaults, Icons, Metadata)
    // ========================================================================
    static CARD_DESCRIPTION = 'Enhanced 24-hours analog clock with time ranges, sun information, custom markers, and more display options.';
    static CARD_VERSION = '0.0.1'; // Increment this with new features/fixes

    // Default Icons (text-based for simplicity if MDI is not used)
    static DEFAULT_SUNRISE_ICON_TEXT = '↑';
    static DEFAULT_SUNSET_ICON_TEXT = '↓';
    static DEFAULT_CUSTOM_MARKER_ICON_TEXT = '•';

    // ========================================================================
    //  Home Assistant Code
    // ========================================================================

    constructor() {
        super();
        this.doCard(); // Initializes the base card structure
        this.doStyle(); // Applies the CSS styles
        this.doAttach(); // Attaches the shadow DOM
        this.doQueryElements(); // Queries and stores references to key DOM elements
        this.updateClock = this.updateClock.bind(this); // Binds 'this' context for clock updates
        this.updateSunMarkers = this.updateSunMarkers.bind(this); // Binds 'this' context for sun marker updates
        this.updateMarkers = this.updateMarkers.bind(this); // Bind this context for custom marker updates
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

        this.doRender(); // Rerender the clock elements based on the new config
    }

    /**
     * Sets the Home Assistant object. This method is called by Home Assistant
     * whenever the Home Assistant state changes.
     * @param {object} hass - The Home Assistant object.
     */
    set hass(hass) {
        this._hass = hass;
        this.doUpdateConfig(); // Update card title based on config (always refreshes)
        this.updateClock(); // Update clock hand position and arc ranges
        this.updateSunMarkers(); // Update sun marker positions
        this.updateMarkers(); // Update custom marker positions
        this.updateRingsVisibility(); // Update visibility of static rings
        this.doRenderLegends(); // Update legends based on current state (e.g., entity names)
    }

    // ========================================================================
    //  DOM MANIPULATION & STYLING
    // ========================================================================

    /**
     * Attaches the shadow DOM to the custom element.
     */
    doAttach() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(this._elements.style, this._elements.card);
    }

    /**
     * Creates and appends the `<style>` element for the card.
     */
    doStyle() {
        this._elements.style = document.createElement("style");
        this._elements.style.textContent = `
                ha-card {
                    padding: 0 16px;
                }
                          
                .hidden {
                  display: none !important;
                }               

                /* Modified header styling */
                .card-header {
                    display: flex; 
                    justify-content: space-between; /* Space out title and icon */
                    align-items: center; 
                    padding: 0 10px;
                    color: inherit;
                    font-size: 1.2em;
                    font-weight: var(--mcg-title-font-weight, 500);
                }

                .card-title-text {
                    flex-grow: 1; /* Allow text to take available space */
                    text-align: left;
                    padding-right: 10px; /* Space between title and icon */
                }

                .card-header-icon ha-icon {
                    --mdc-icon-size: 24px; /* Adjust icon size */
                    color: var(--primary-text-color, #333); /* Icon color */
                }


                .clock-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    padding-bottom: 10px;
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
                    /* Masking ensures only the ring area is colored, not the full circle */
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
                    transition: transform 0.1s linear; /* Smooth transition for clock hand */
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
                
                .custom-marker {
                    position: absolute;
                    font-size: 16px;
                    color: var(--primary-text-color, #333);
                    left: 50%;
                    top: 5px;
                    transform-origin: 50% 185px;
                    transform: translateX(-50%);
                    font-weight: bold;
                    pointer-events: none;
                    background: var(--card-background-color, #fff);
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 0 5px rgba(0,0,0,0.3);
                }

                .custom-marker span {
                    display: block;
                    transform: translateY(1px);
                }

                .custom-marker ha-icon {
                    --mdc-icon-size: 20px;
                    color: inherit;
                }

                /* Legends Styling */
                .legends-container {
                    display: flex;
                    flex-wrap: wrap; /* Allows items to wrap to next line */
                    justify-content: center;
                    gap: 15px; /* Space between legend items */
                    margin-top: 20px;
                    width: 100%;
                    padding: 0 10px 10px 0;
                    box-sizing: border-box; /* Include padding in element's total width */
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    color: var(--primary-text-color, #333);
                    white-space: nowrap; /* Prevent text wrapping within an item */
                }

                .legend-color-box {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    margin-right: 8px;
                    border: 1px solid var(--divider-color, #e0e0e0); /* Add a subtle border */
                    flex-shrink: 0; /* Prevent the box from shrinking */
                }

                .legend-icon {
                    margin-right: 8px;
                    font-size: 18px; /* Base size for text icons */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .legend-icon ha-icon {
                    --mdc-icon-size: 18px; /* MDI icon specific size */
                    color: inherit; 
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
                    
                    .custom-marker {
                        transform-origin: 50% 135px;
                        font-size: 14px;
                        width: 20px;
                        height: 20px;
                    }
                    .custom-marker ha-icon {
                        --mdc-icon-size: 16px;
                    }

                    .legend-item {
                        font-size: 12px;
                    }
                    .legend-color-box {
                        width: 15px;
                        height: 15px;
                    }
                    .legend-icon {
                        font-size: 15px;
                    }
                    .legend-icon ha-icon {
                        --mdc-icon-size: 15px;
                    }
                }
            `;
    }

    /**
     * Creates the main `<ha-card>` element and its initial HTML structure.
     */
    doCard() {
        this._elements.card = document.createElement("ha-card");
        this._elements.card.innerHTML = `         
            <div class="card-header hidden" id="card-header">
                <div class="card-title-text" id="card-title-text"></div>
                <div class="card-header-icon" id="card-header-icon"></div>
            </div>
            <div class="clock-container">
                <div class="clock">
                    <div class="clock-face" id="clock-face">
                        <div class="ring1 static-ring" ></div>
                        <div class="ring2 static-ring"></div>
                        <div class="ring3 static-ring"></div>
                        <div class="ring4 static-ring"></div>
                    </div>
                </div>
                <div class="legends-container hidden" id="legends-container"></div>
            </div>
        `;
    }

    /**
     * Queries and stores references to essential DOM elements within the card.
     */
    doQueryElements() {
        const card = this._elements.card;
        this._elements.cardHeader = card.querySelector("#card-header"); // Get the full header div
        this._elements.cardTitleText = card.querySelector("#card-title-text"); // Get the title text div
        this._elements.cardHeaderIcon = card.querySelector("#card-header-icon"); // Get the icon div
        this._elements.clockFace = card.querySelector("#clock-face");
        this._elements.rings = this._elements.clockFace.querySelectorAll('.static-ring');
        this._elements.legendsContainer = card.querySelector("#legends-container");
    }

    /**
     * Updates the card's title and icon visibility based on the configuration.
     */
    doUpdateConfig() {
        const hasTitle = !!this.headerTitle;
        const hasIcon = !!this.headerIcon;

        // Show/hide the entire header based on whether title or icon exists
        if (hasTitle || hasIcon) {
            this._elements.cardHeader.classList.remove("hidden");
        } else {
            this._elements.cardHeader.classList.add("hidden");
        }

        // Update title text
        this._elements.cardTitleText.textContent = this.headerTitle || '';

        // Update header icon
        if (hasIcon) {
            this._elements.cardHeaderIcon.innerHTML = `<ha-icon icon="${this.headerIcon}"></ha-icon>`;
            this._elements.cardHeaderIcon.classList.remove("hidden");
        } else {
            this._elements.cardHeaderIcon.innerHTML = '';
            this._elements.cardHeaderIcon.classList.add("hidden");
        }
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

        this.createHourMarkers();
        this.createArcs();
        this.createSunMarkers();
        this.createMarkers();
        this.createHourHandAndCenterDot();
        this.doRenderLegends();
    }

    // ========================================================================
    //  CLOCK ELEMENTS (Hour Markers, Rings, Hand, Center Dot)
    // ========================================================================

    /**
     * Toggles the visibility of the static rings based on the `showRings` configuration.
     */
    updateRingsVisibility() {
        this._elements.rings.forEach(ring => {
            if (ring) {
                ring.classList.toggle('hidden', !this.showRings);
            }
        });
    }

    /**
     * Creates and appends the 24-hour markers and hour numbers to the clock face.
     */
    createHourMarkers() {
        const fragment = document.createDocumentFragment();
        for (let hour = 0; hour < 24; hour++) {
            const marker = document.createElement('div');
            marker.className = hour % 6 === 0 ? 'hour-marker major' : 'hour-marker';
            marker.style.transform = `translateX(-50%) rotate(${hour * 15}deg)`;
            fragment.appendChild(marker);

            const hourNumber = document.createElement('div');
            hourNumber.className = 'hour-number';
            if (!this.showHours) {
                hourNumber.classList.add('hidden'); // Hide if show_hours is false
            }
            hourNumber.style.transform = `translateX(-50%) rotate(${hour * 15}deg)`;

            const textSpan = document.createElement('span');
            textSpan.textContent = hour.toString().padStart(2, '0');
            textSpan.style.transform = `rotate(${-hour * 15}deg)`; // Counter-rotate to keep text upright

            hourNumber.appendChild(textSpan);
            fragment.appendChild(hourNumber);
        }
        this._elements.clockFace.appendChild(fragment);
    }

    /**
     * Creates the hour hand and the center dot of the clock.
     */
    createHourHandAndCenterDot() {
        const fragment = document.createDocumentFragment(); // Create a document fragment

        this._elements.hourHand = document.createElement('div');
        this._elements.hourHand.className = 'hour-hand';
        this._elements.hourHand.id = 'hourHand';
        // Apply custom color if provided
        if (this._elements.handColor) {
            this._elements.hourHand.style.background = this._elements.handColor;
        }
        fragment.appendChild(this._elements.hourHand); // Append to the fragment

        this._elements.centerDot = document.createElement('div');
        this._elements.centerDot.className = 'center-dot';
        this._elements.centerDot.id = 'centerDot';
        // Apply custom color to center dot for consistency
        if (this._elements.handColor) {
            this._elements.centerDot.style.background = this._elements.handColor;
        }
        fragment.appendChild(this._elements.centerDot); // Append to the fragment

        this._elements.clockFace.appendChild(fragment); // Append the fragment to the clock face
    }

    /**
     * Updates the position of the hour hand based on the current time.
     */
    updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Calculate total minutes in a 24-hour cycle for smooth rotation
        const totalMinutes = hours * 60 + minutes + seconds / 60;
        const hourAngle = (totalMinutes / (24 * 60)) * 360;

        if (this._elements.hourHand) {
            this._elements.hourHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`;
        }

        // Update arc ranges in case their entity states have changed
        if (this._hass && this._elements.arcs) {
            this._elements.arcs.forEach(({ element, range }) => {
                this.updateArc(element, range);
            });
        }
    }

    // ========================================================================
    //  TIME RANGES (Arcs)
    // ========================================================================

    /**
     * Creates and appends the arc elements for time ranges.
     */
    createArcs() {
        this._elements.arcs = []; // Store references to arc elements and their configurations
        const fragment = document.createDocumentFragment();

        this.rangesConfig.forEach((range, index) => {
            const arc = document.createElement('div');
            arc.className = `arc ${range.ring || 'ring1'}`; // Assign ring class, default to ring1
            arc.id = `arc-${index}`;
            fragment.appendChild(arc);
            this._elements.arcs.push({ element: arc, range: range });
        });
        this._elements.clockFace.appendChild(fragment);
    }

    /**
     * Updates the style of a single arc element to reflect its start, end, and color.
     * @param {HTMLElement} arcElement - The arc DOM element.
     * @param {object} range - The range configuration object.
     */
    updateArc(arcElement, range) {
        const startTime = this.parseTime(range.start_time);
        const endTime = this.parseTime(range.end_time);

        if (!startTime || !endTime) {
            arcElement.style.background = 'transparent'; // Hide arc if times are invalid
            return;
        }

        const startAngle = this.timeToAngle(startTime);
        let endAngle = this.timeToAngle(endTime);

        // Adjust end angle if it crosses midnight (e.g., 22:00 to 06:00)
        if (endAngle < startAngle) {
            endAngle += 360;
        }

        const arcLength = endAngle - startAngle;
        const color = range.color || 'var(--accent-color, #03a9f4)';

        // Apply conic gradient to create the arc
        arcElement.style.background = `conic-gradient(from ${startAngle}deg, transparent 0deg, ${color} 0deg, ${color} ${arcLength}deg, transparent ${arcLength}deg)`;
    }

    // ========================================================================
    //  TIME UTILITIES
    // ========================================================================

    /**
     * Parses a time input (e.g., "HH:MM" or an entity ID) into an object
     * with hours and minutes.
     * @param {string} timeInput - The time string or entity ID.
     * @returns {object|null} An object { hours, minutes } or null if invalid.
     */
    parseTime(timeInput) {
        if (!timeInput) return null;

        let timeStr = timeInput;

        // If timeInput is an entity ID, retrieve its state from Home Assistant
        if (typeof timeInput === 'string' && timeInput.includes('.')) {
            const entityState = this._hass?.states[timeInput];
            if (entityState && entityState.state !== 'unavailable' && entityState.state !== 'unknown') {
                timeStr = entityState.state;
            } else {
                return null; // Entity state is not available or invalid
            }
        }

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

    /**
     * Creates and appends custom marker elements to the clock face.
     */
    createMarkers() {
        this._elements.markers = [];
        const fragment = document.createDocumentFragment();

        this.markersConfig.forEach((markerConfig, index) => {
            const markerDiv = document.createElement('div');
            markerDiv.className = 'custom-marker';
            markerDiv.id = `custom-marker-${index}`;

            // Determine content based on icon or name, falling back to a default text icon
            if (markerConfig.icon && markerConfig.icon.startsWith('mdi:')) {
                markerDiv.innerHTML = `<ha-icon icon="${markerConfig.icon}"></ha-icon>`;
            } else if (markerConfig.icon) {
                markerDiv.innerHTML = `<span>${markerConfig.icon}</span>`;
            } else if (markerConfig.name) {
                markerDiv.innerHTML = `<span>${markerConfig.name.substring(0, 3)}</span>`;
            } else {
                markerDiv.innerHTML = `<span>${RingsClockCard.DEFAULT_CUSTOM_MARKER_ICON_TEXT}</span>`;
            }

            // Apply custom color if provided
            if (markerConfig.color) {
                markerDiv.style.color = markerConfig.color;
                markerDiv.style.backgroundColor = 'var(--card-background-color, #fff)';
            }

            fragment.appendChild(markerDiv);
            this._elements.markers.push({ element: markerDiv, config: markerConfig });
        });
        this._elements.clockFace.appendChild(fragment);
    }

    /**
     * Updates the position and visibility of custom markers.
     */
    updateMarkers() {
        if (!this._elements.markers || this._elements.markers.length === 0) {
            return;
        }

        this._elements.markers.forEach(({ element, config }) => {
            const time = this.parseTime(config.marker); // Parse time for marker position (can be entity)
            if (!time) {
                element.style.display = 'none'; // Hide if time is invalid/unavailable
                return;
            }

            element.style.display = ''; // Show if time is valid

            const markerAngle = this.timeToAngle(time);
            element.style.transform = `translateX(-50%) rotate(${markerAngle}deg)`;

            // Counter-rotate the inner content (icon/text) to keep it upright
            const innerContent = element.querySelector('span') || element.querySelector('ha-icon');
            if (innerContent) {
                innerContent.style.transform = `rotate(${-markerAngle}deg)`;
            }
        });
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
    doRenderLegends() {
        if (!this.showLegends) {
            this._elements.legendsContainer.classList.add('hidden');
            return;
        }

        this._elements.legendsContainer.classList.remove('hidden');
        this._elements.legendsContainer.innerHTML = ''; // Clear existing legends

        const fragment = document.createDocumentFragment();

        // Add Arc Legends
        this.rangesConfig.forEach(range => {
            if (range.name) { // Only add legend if a name is provided for the arc
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
            hand_color: '#FF0000',
            show_rings: true,
            show_hours: true,
            show_legends: true,
            sun: {
                entity: 'sun.sun',
                show: true,
                color: '#FFA500',
                sunrise_icon: 'mdi:weather-sunny-alert',
                sunset_icon: 'mdi:weather-night',
                sunrise_name: 'Sunrise',
                sunset_name: 'Sunset'
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
                name: 'Daylight Hours'
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

// Define the custom element for Home Assistant
customElements.define('rings-clock-card', RingsClockCard);

// Register the card with the Home Assistant custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'rings-clock-card',
    name: '24-Hours Rings Clock Card',
    description: RingsClockCard.CARD_DESCRIPTION
});

// Log card version to console for debugging/information
console.info('%c24H-RINGS-CLOCK-CARD %c' + RingsClockCard.CARD_VERSION,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',);