/**
 * Visual Field Test Pattern Coordinates
 * Supports multiple test types:
 * - Binocular Esterman (120 points)
 * - FF120 Right Eye (120 points) - TO BE REPLACED WITH ACTUAL DATA
 * - FF120 Left Eye (120 points) - TO BE REPLACED WITH ACTUAL DATA
 */

// =============================================================================
// BINOCULAR ESTERMAN COORDINATES (CONFIRMED DATA)
// =============================================================================
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

// =============================================================================
// FF120 COORDINATES (PLACEHOLDER - REPLACE WITH ACTUAL DATA)
// =============================================================================
// TODO: Replace these with actual FF120 coordinates when available
//
// Instructions for replacement:
// 1. Obtain the actual FF120 right eye coordinate data (120 points)
// 2. Replace the FF120_RIGHT_EYE_COORDINATES array below
// 3. The left eye coordinates will be automatically mirrored from right eye
//    OR you can provide separate left eye data if available
// 4. Verify the point count is exactly 120 points
//
// Expected format:
// {x: horizontal degrees (+ = temporal/right, - = nasal/left),
//  y: vertical degrees (+ = superior/up, - = inferior/down)}

// PLACEHOLDER: Currently using a subset pattern for demonstration
// This should be replaced with actual 120-point FF120 data
const FF120_RIGHT_EYE_COORDINATES = [
{x: -3, y: 20},
{x: 3, y: 20},
{x: -10, y: 17},
{x: 10, y: 17},
{x: -3, y: 15},
{x: 3, y: 15},
{x: -7, y: 13},
{x: 7, y: 13},
{x: -22, y: 12},
{x: -11, y: 11},
{x: 11, y: 11},
{x: -17, y: 10},
{x: -3, y: 10},
{x: 3, y: 10},
{x: 17, y: 10},
{x: -13, y: 7},
{x: -7, y: 7},
{x: 7, y: 7},
{x: 13, y: 7},
{x: -24, y: 6},
{x: 24, y: 6},
{x: -2, y: 5},
{x: 2, y: 5},
{x: -20, y: 3},
{x: -15, y: 3},
{x: -10, y: 3},
{x: 10, y: 3},
{x: -25, y: 2},
{x: -5, y: 2},
{x: -2, y: 2},
{x: 2, y: 2},
{x: 5, y: 2},
{x: -25, y: -2},
{x: -5, y: -2},
{x: -2, y: -2},
{x: 2, y: -2},
{x: 5, y: -2},
{x: -20, y: -3},
{x: -15, y: -3},
{x: -10, y: -3},
{x: 10, y: -3},
{x: -2, y: -5},
{x: 2, y: -5},
{x: -24, y: -6},
{x: 24, y: -6},
{x: -13, y: -7},
{x: -7, y: -7},
{x: 7, y: -7},
{x: 13, y: -7},
{x: -17, y: -10},
{x: -3, y: -10},
{x: 3, y: -10},
{x: 17, y: -10},
{x: -11, y: -11},
{x: 11, y: -11},
{x: -22, y: -12},
{x: -7, y: -13},
{x: 7, y: -13},
{x: -3, y: -15},
{x: 3, y: -15},
{x: -10, y: -17},
{x: 10, y: -17},
{x: -3, y: -20},
{x: 3, y: -20},
{x: -7, y: 39},
{x: 7, y: 39},
{x: -17, y: 36},
{x: 17, y: 36},
{x: -5, y: 30},
{x: 5, y: 30},
{x: -28, y: 28},
{x: 28, y: 28},
{x: -13, y: 27},
{x: 13, y: 27},
{x: -39, y: 22},
{x: -21, y: 21},
{x: 21, y: 21},
{x: -47, y: 17},
{x: -30, y: 17},
{x: 58, y: 16},
{x: -38, y: 14},
{x: -43, y: 12},
{x: -28, y: 10},
{x: 39, y: 10},
{x: -49, y: 9},
{x: -34, y: 9},
{x: -39, y: 7},
{x: -30, y: 5},
{x: -45, y: 4},
{x: -35, y: 3},
{x: -35, y: -3},
{x: -45, y: -4},
{x: -30, y: -5},
{x: -39, y: -7},
{x: -49, y: -9},
{x: -34, y: -9},
{x: -28, y: -10},
{x: 39, y: -10},
{x: -43, y: -12},
{x: -38, y: -14},
{x: 58, y: -16},
{x: -47, y: -17},
{x: -30, y: -17},
{x: -21, y: -21},
{x: 21, y: -21},
{x: -39, y: -22},
{x: -13, y: -27},
{x: 13, y: -27},
{x: -28, y: -28},
{x: 28, y: -28},
{x: -5, y: -30},
{x: 5, y: -30},
{x: -17, y: -36},
{x: 17, y: -36},
{x: -7, y: -39},
{x: 7, y: -39},
{x: -29, y: -41},
{x: 42, y: -42},
{x: -10, y: -54},
{x: 10, y: -54}
];

// Verify point counts
if (ESTERMAN_COORDINATES.length !== 120) {
    console.warn(`Esterman: Expected 120 points, but got ${ESTERMAN_COORDINATES.length}`);
}
if (FF120_RIGHT_EYE_COORDINATES.length !== 120) {
    console.warn(`FF120 Right Eye: Expected 120 points, but got ${FF120_RIGHT_EYE_COORDINATES.length}`);
}

/**
 * Get visual field coordinates based on test type
 * @param {string} testType - 'esterman', 'ff120-right', or 'ff120-left'
 * @returns {Array} Array of 120 coordinate objects
 */
function getVisualFieldCoordinates(testType = 'esterman') {
    let coords;

    switch(testType) {
        case 'esterman':
            coords = ESTERMAN_COORDINATES;
            break;
        case 'ff120-right':
            coords = FF120_RIGHT_EYE_COORDINATES;
            break;
        case 'ff120-left':
            // Mirror FF120 right eye coordinates horizontally for left eye
            coords = FF120_RIGHT_EYE_COORDINATES.map(coord => ({
                x: -coord.x,  // Mirror horizontally
                y: coord.y
            }));
            break;
        default:
            console.error(`Unknown test type: ${testType}`);
            coords = ESTERMAN_COORDINATES;
    }

    return coords.map((coord, index) => ({
        id: index,
        x: coord.x,
        y: coord.y,
        isVisible: false
    }));
}

// Backward compatibility: Keep the old function name
function getFF120Coordinates(eye = 'binocular') {
    if (eye === 'binocular') {
        return getVisualFieldCoordinates('esterman');
    } else if (eye === 'right') {
        return getVisualFieldCoordinates('ff120-right');
    } else if (eye === 'left') {
        return getVisualFieldCoordinates('ff120-left');
    }
    return getVisualFieldCoordinates('esterman');
}
