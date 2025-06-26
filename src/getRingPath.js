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
