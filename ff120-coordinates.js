/**
 * HFA3 Full Field 120 Point Test Pattern Coordinates
 * Based on Figure A-17 from HFA3 Instructions for Use
 * Standard coordinates for right eye (OD)
 */

// FF120 Standard Pattern Coordinates (Right Eye)
// Coordinates are in degrees from fixation point
// Format: {x: horizontal (positive=temporal/right, negative=nasal/left),
//          y: vertical (positive=superior/up, negative=inferior/down)}

const FF120_RIGHT_EYE_COORDINATES = [
    // Central ring (3 degrees)
    {x: 0, y: 3}, {x: 2.6, y: 1.5}, {x: 2.6, y: -1.5}, {x: 0, y: -3},
    {x: -2.6, y: -1.5}, {x: -2.6, y: 1.5},

    // Ring at 6 degrees
    {x: 0, y: 6}, {x: 3, y: 5.2}, {x: 5.2, y: 3}, {x: 6, y: 0},
    {x: 5.2, y: -3}, {x: 3, y: -5.2}, {x: 0, y: -6}, {x: -3, y: -5.2},
    {x: -5.2, y: -3}, {x: -6, y: 0}, {x: -5.2, y: 3}, {x: -3, y: 5.2},

    // Ring at 9 degrees
    {x: 0, y: 9}, {x: 4.5, y: 7.8}, {x: 7.8, y: 4.5}, {x: 9, y: 0},
    {x: 7.8, y: -4.5}, {x: 4.5, y: -7.8}, {x: 0, y: -9}, {x: -4.5, y: -7.8},
    {x: -7.8, y: -4.5}, {x: -9, y: 0}, {x: -7.8, y: 4.5}, {x: -4.5, y: 7.8},

    // Ring at 12 degrees
    {x: 0, y: 12}, {x: 6, y: 10.4}, {x: 10.4, y: 6}, {x: 12, y: 0},
    {x: 10.4, y: -6}, {x: 6, y: -10.4}, {x: 0, y: -12}, {x: -6, y: -10.4},
    {x: -10.4, y: -6}, {x: -12, y: 0}, {x: -10.4, y: 6}, {x: -6, y: 10.4},

    // Ring at 15 degrees
    {x: 0, y: 15}, {x: 7.5, y: 13}, {x: 13, y: 7.5}, {x: 15, y: 0},
    {x: 13, y: -7.5}, {x: 7.5, y: -13}, {x: 0, y: -15}, {x: -7.5, y: -13},
    {x: -13, y: -7.5}, {x: -15, y: 0}, {x: -13, y: 7.5}, {x: -7.5, y: 13},

    // Ring at 21 degrees
    {x: 0, y: 21}, {x: 10.5, y: 18.2}, {x: 18.2, y: 10.5}, {x: 21, y: 0},
    {x: 18.2, y: -10.5}, {x: 10.5, y: -18.2}, {x: 0, y: -21}, {x: -10.5, y: -18.2},
    {x: -18.2, y: -10.5}, {x: -21, y: 0}, {x: -18.2, y: 10.5}, {x: -10.5, y: 18.2},

    // Ring at 27 degrees
    {x: 0, y: 27}, {x: 13.5, y: 23.4}, {x: 23.4, y: 13.5}, {x: 27, y: 0},
    {x: 23.4, y: -13.5}, {x: 13.5, y: -23.4}, {x: 0, y: -27}, {x: -13.5, y: -23.4},
    {x: -23.4, y: -13.5}, {x: -27, y: 0}, {x: -23.4, y: 13.5}, {x: -13.5, y: 23.4},

    // Peripheral points - Temporal side (right side for OD)
    {x: 33, y: 0}, {x: 39, y: 0}, {x: 45, y: 0}, {x: 51, y: 0},
    {x: 33, y: 9}, {x: 33, y: -9}, {x: 39, y: 11.7}, {x: 39, y: -11.7},
    {x: 45, y: 13}, {x: 45, y: -13}, {x: 51, y: 15}, {x: 51, y: -15},

    // Peripheral points - Superior temporal
    {x: 23.3, y: 23.3}, {x: 27.6, y: 27.6}, {x: 31.8, y: 31.8}, {x: 36, y: 36},

    // Peripheral points - Inferior temporal
    {x: 23.3, y: -23.3}, {x: 27.6, y: -27.6}, {x: 31.8, y: -31.8}, {x: 36, y: -36},

    // Peripheral points - Superior
    {x: 0, y: 33}, {x: 0, y: 39}, {x: 0, y: 45}, {x: 0, y: 51},
    {x: 9, y: 33}, {x: -9, y: 33}, {x: 11.7, y: 39}, {x: -11.7, y: 39},

    // Peripheral points - Inferior
    {x: 0, y: -33}, {x: 0, y: -39}, {x: 0, y: -45}, {x: 0, y: -51},
    {x: 9, y: -33}, {x: -9, y: -33}, {x: 11.7, y: -39}, {x: -11.7, y: -39},

    // Peripheral points - Nasal side (left side for OD)
    {x: -33, y: 0}, {x: -39, y: 0}, {x: -27, y: 9}, {x: -27, y: -9},

    // Peripheral points - Superior nasal
    {x: -23.3, y: 23.3}, {x: -27.6, y: 27.6}, {x: -31.8, y: 31.8},

    // Peripheral points - Inferior nasal
    {x: -23.3, y: -23.3}, {x: -27.6, y: -27.6}, {x: -31.8, y: -31.8}
];

// Verify we have exactly 120 points
if (FF120_RIGHT_EYE_COORDINATES.length !== 120) {
    console.warn(`Expected 120 points, but got ${FF120_RIGHT_EYE_COORDINATES.length}`);
}

/**
 * Get FF120 coordinates for specified eye
 * @param {string} eye - 'right' or 'left'
 * @returns {Array} Array of 120 coordinate objects
 */
function getFF120Coordinates(eye = 'right') {
    if (eye === 'right') {
        return FF120_RIGHT_EYE_COORDINATES.map((coord, index) => ({
            id: index,
            x: coord.x,
            y: coord.y,
            isVisible: false
        }));
    } else {
        // For left eye, mirror horizontally (flip X coordinate)
        return FF120_RIGHT_EYE_COORDINATES.map((coord, index) => ({
            id: index,
            x: -coord.x,  // Mirror horizontally
            y: coord.y,
            isVisible: false
        }));
    }
}
