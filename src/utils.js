// Time Utilities
/**
 * Parses a time input (e.g., "HH:MM" or an entity ID or entity.attribute path) into an object
 * with hours and minutes.
 * @param {string} timeInput - The time string, entity ID, or entity.attribute path.
 * @param hass
 * @returns {object|null} An object { hours, minutes } or null if invalid.
 */
export function parseTime(timeInput, hass) {
    if (!timeInput) return null;

    let timeStr = timeInput;

    // Check if timeInput is an entity ID or an entity.attribute path
    if (typeof timeInput === 'string' && timeInput.includes('.')) {
        const parts = timeInput.split('#attributes#');
        const entityId = parts[0];
        const attributePath = parts.length > 1 ? parts[1] : null;

        const entityState = hass?.states[entityId];

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
export function timeToAngle(time) {
    // 24 hours * 15 degrees/hour = 360 degrees
    // 60 minutes * 0.25 degrees/minute = 15 degrees/hour
    return (time.hours * 15) + (time.minutes * 0.25);
}

/**
 * Converts a Date object to an angle in degrees for a 24-hour clock.
 * @param {Date} date - The Date object.
 * @returns {number} The angle in degrees (0-360).
 */
export function dateToAngle(date) {
    return timeToAngle({ hours: date.getHours(), minutes: date.getMinutes() });
}


/**
 * Converts degrees to radians.
 * @param {number} degrees - Angle in degrees.
 * @returns {number} Angle in radians.
 */
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Converts polar coordinates (angle, radius) to Cartesian coordinates (x, y).
 * @param {number} radius - The radius from the center.
 * @param {number} angleInDegrees - The angle in degrees.
 * @returns {{x: number, y: number}} An object with x and y coordinates.
 */
export function polarToCartesian(radius, angleInDegrees) {
    const cx=50; // x position
    const cy=50; // x position
    const angleInRadians = degToRad(angleInDegrees - 90); // Adjusting for SVG's Y-axis (0 degrees is typically at 3 o'clock, we want 12 o'clock to be 0)
    return {
        x: cx + (radius * Math.cos(angleInRadians)),
        y: cy + (radius * Math.sin(angleInRadians))
    };
}
