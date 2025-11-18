/**
 * Binocular Esterman Visual Field Test Pattern Coordinates
 * Standard 120-point pattern for binocular visual field testing
 * Used for visual impairment classification in sports
 *
 * NOTE: To replace with Goldmann FF120 coordinates:
 * 1. Replace ESTERMAN_COORDINATES array below with FF120 coordinate data
 * 2. Update getFF120Coordinates() function to handle right/left eye if needed
 * 3. Update title and descriptions in this file and index.html
 * 4. For FF120 with separate right/left eye coordinates:
 *    - Add FF120_RIGHT_EYE_COORDINATES and FF120_LEFT_EYE_COORDINATES arrays
 *    - Modify getFF120Coordinates(eye) to return appropriate array based on eye parameter
 */

// Binocular Esterman Pattern Coordinates
// Coordinates are in degrees from fixation point
// Format: {x: horizontal (positive=right, negative=left),
//          y: vertical (positive=up, negative=down)}

const ESTERMAN_COORDINATES = [
    {x: -76, y: -3},
    {x: -76, y: -8},
    {x: -75, y: 3},
    {x: -75, y: -13},
    {x: -74, y: -21},
    {x: -73, y: 10},
    {x: -69, y: -30},
    {x: -57, y: 21},
    {x: -57, y: 10},
    {x: -57, y: 3},
    {x: -57, y: -3},
    {x: -57, y: -8},
    {x: -57, y: -13},
    {x: -57, y: -21},
    {x: -55, y: -43},
    {x: -49, y: -30},
    {x: -42, y: 10},
    {x: -42, y: 3},
    {x: -42, y: -3},
    {x: -42, y: -8},
    {x: -42, y: -13},
    {x: -42, y: -21},
    {x: -34, y: 21},
    {x: -33, y: -30},
    {x: -30, y: 10},
    {x: -30, y: 3},
    {x: -30, y: -3},
    {x: -30, y: -8},
    {x: -30, y: -13},
    {x: -30, y: -21},
    {x: -30, y: -53},
    {x: -29, y: -43},
    {x: -23, y: 36},
    {x: -20, y: 10},
    {x: -20, y: 3},
    {x: -20, y: -3},
    {x: -20, y: -8},
    {x: -20, y: -13},
    {x: -20, y: -21},
    {x: -17, y: 21},
    {x: -17, y: -30},
    {x: -13, y: 3},
    {x: -13, y: -3},
    {x: -13, y: -8},
    {x: -13, y: -13},
    {x: -13, y: -21},
    {x: -10, y: 10},
    {x: -8, y: 3},
    {x: -8, y: -3},
    {x: -8, y: -8},
    {x: -8, y: -13},
    {x: -8, y: -21},
    {x: -8, y: -43},
    {x: -8, y: -57},
    {x: -6, y: 21},
    {x: -5, y: -30},
    {x: -3, y: 10},
    {x: -3, y: -8},
    {x: -3, y: -13},
    {x: -3, y: -21},
    {x: 3, y: 10},
    {x: 3, y: -8},
    {x: 3, y: -13},
    {x: 3, y: -21},
    {x: 5, y: -30},
    {x: 6, y: 21},
    {x: 8, y: 3},
    {x: 8, y: -3},
    {x: 8, y: -8},
    {x: 8, y: -13},
    {x: 8, y: -21},
    {x: 8, y: -43},
    {x: 8, y: -57},
    {x: 10, y: 10},
    {x: 13, y: 3},
    {x: 13, y: -3},
    {x: 13, y: -8},
    {x: 13, y: -13},
    {x: 13, y: -21},
    {x: 17, y: 21},
    {x: 17, y: -30},
    {x: 20, y: 10},
    {x: 20, y: 3},
    {x: 20, y: -3},
    {x: 20, y: -8},
    {x: 20, y: -13},
    {x: 20, y: -21},
    {x: 23, y: 36},
    {x: 29, y: -43},
    {x: 30, y: 10},
    {x: 30, y: 3},
    {x: 30, y: -3},
    {x: 30, y: -8},
    {x: 30, y: -13},
    {x: 30, y: -21},
    {x: 30, y: -53},
    {x: 33, y: -30},
    {x: 34, y: 21},
    {x: 42, y: 10},
    {x: 42, y: 3},
    {x: 42, y: -3},
    {x: 42, y: -8},
    {x: 42, y: -13},
    {x: 42, y: -21},
    {x: 49, y: -30},
    {x: 55, y: -43},
    {x: 57, y: 21},
    {x: 57, y: 10},
    {x: 57, y: 3},
    {x: 57, y: -3},
    {x: 57, y: -8},
    {x: 57, y: -13},
    {x: 57, y: -21},
    {x: 69, y: -30},
    {x: 73, y: 10},
    {x: 74, y: -21},
    {x: 75, y: 3},
    {x: 75, y: -13},
    {x: 76, y: -3},
    {x: 76, y: -8}
];

// Verify we have exactly 120 points
if (ESTERMAN_COORDINATES.length !== 120) {
    console.warn(`Expected 120 points, but got ${ESTERMAN_COORDINATES.length}`);
}

/**
 * Get visual field coordinates
 * @param {string} eye - Not used for Esterman (binocular test), kept for compatibility
 * @returns {Array} Array of 120 coordinate objects
 */
function getFF120Coordinates(eye = 'binocular') {
    return ESTERMAN_COORDINATES.map((coord, index) => ({
        id: index,
        x: coord.x,
        y: coord.y,
        isVisible: false
    }));
}

/**
 * Example for FF120 with separate eye coordinates:
 *
 * const FF120_RIGHT_EYE_COORDINATES = [
 *     {x: 0, y: 3}, {x: 2.6, y: 1.5}, ...  // Your FF120 right eye coordinates
 * ];
 *
 * const FF120_LEFT_EYE_COORDINATES = [
 *     {x: 0, y: 3}, {x: -2.6, y: 1.5}, ...  // Your FF120 left eye coordinates (mirrored)
 * ];
 *
 * function getFF120Coordinates(eye = 'right') {
 *     const coords = eye === 'right' ? FF120_RIGHT_EYE_COORDINATES : FF120_LEFT_EYE_COORDINATES;
 *     return coords.map((coord, index) => ({
 *         id: index,
 *         x: coord.x,
 *         y: coord.y,
 *         isVisible: false
 *     }));
 * }
 */
