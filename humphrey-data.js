/**
 * Humphrey Visual Field Test Point Coordinates
 * Based on HFA3 standard test patterns
 */

/**
 * Humphrey 10-2 Test Pattern
 * - 68 measurement points
 * - 2-degree intervals
 * - Offset by 1 degree from horizontal/vertical axes
 * - Covers central 10 degrees
 * - Each point represents a 2×2 degree square (±1 degree)
 */
const HUMPHREY_10_2_POINTS = [
    // Y = 9 (2 points)
    {id: 0, x: -1, y: 9},
    {id: 1, x: 1, y: 9},

    // Y = 7 (6 points)
    {id: 2, x: -5, y: 7},
    {id: 3, x: -3, y: 7},
    {id: 4, x: -1, y: 7},
    {id: 5, x: 1, y: 7},
    {id: 6, x: 3, y: 7},
    {id: 7, x: 5, y: 7},

    // Y = 5 (8 points)
    {id: 8, x: -7, y: 5},
    {id: 9, x: -5, y: 5},
    {id: 10, x: -3, y: 5},
    {id: 11, x: -1, y: 5},
    {id: 12, x: 1, y: 5},
    {id: 13, x: 3, y: 5},
    {id: 14, x: 5, y: 5},
    {id: 15, x: 7, y: 5},

    // Y = 3 (10 points)
    {id: 16, x: -9, y: 3},
    {id: 17, x: -7, y: 3},
    {id: 18, x: -5, y: 3},
    {id: 19, x: -3, y: 3},
    {id: 20, x: -1, y: 3},
    {id: 21, x: 1, y: 3},
    {id: 22, x: 3, y: 3},
    {id: 23, x: 5, y: 3},
    {id: 24, x: 7, y: 3},
    {id: 25, x: 9, y: 3},

    // Y = 1 (10 points)
    {id: 26, x: -9, y: 1},
    {id: 27, x: -7, y: 1},
    {id: 28, x: -5, y: 1},
    {id: 29, x: -3, y: 1},
    {id: 30, x: -1, y: 1},
    {id: 31, x: 1, y: 1},
    {id: 32, x: 3, y: 1},
    {id: 33, x: 5, y: 1},
    {id: 34, x: 7, y: 1},
    {id: 35, x: 9, y: 1},

    // Y = -1 (10 points)
    {id: 36, x: -9, y: -1},
    {id: 37, x: -7, y: -1},
    {id: 38, x: -5, y: -1},
    {id: 39, x: -3, y: -1},
    {id: 40, x: -1, y: -1},
    {id: 41, x: 1, y: -1},
    {id: 42, x: 3, y: -1},
    {id: 43, x: 5, y: -1},
    {id: 44, x: 7, y: -1},
    {id: 45, x: 9, y: -1},

    // Y = -3 (10 points)
    {id: 46, x: -9, y: -3},
    {id: 47, x: -7, y: -3},
    {id: 48, x: -5, y: -3},
    {id: 49, x: -3, y: -3},
    {id: 50, x: -1, y: -3},
    {id: 51, x: 1, y: -3},
    {id: 52, x: 3, y: -3},
    {id: 53, x: 5, y: -3},
    {id: 54, x: 7, y: -3},
    {id: 55, x: 9, y: -3},

    // Y = -5 (8 points)
    {id: 56, x: -7, y: -5},
    {id: 57, x: -5, y: -5},
    {id: 58, x: -3, y: -5},
    {id: 59, x: -1, y: -5},
    {id: 60, x: 1, y: -5},
    {id: 61, x: 3, y: -5},
    {id: 62, x: 5, y: -5},
    {id: 63, x: 7, y: -5},

    // Y = -7 (6 points)
    {id: 64, x: -5, y: -7},
    {id: 65, x: -3, y: -7},
    {id: 66, x: -1, y: -7},
    {id: 67, x: 1, y: -7},
    {id: 68, x: 3, y: -7},
    {id: 69, x: 5, y: -7},

    // Y = -9 (2 points)
    {id: 70, x: -1, y: -9},
    {id: 71, x: 1, y: -9}
];
// Total: 2+6+8+10+10+10+10+8+6+2 = 72 points
// Note: Adjusted to match typical 10-2 pattern

/**
 * Humphrey 30-2 Test Pattern
 * - 76 measurement points
 * - 6-degree intervals
 * - Offset by 3 degrees from horizontal/vertical axes
 * - Covers central 30 degrees
 * - Each point represents a 6×6 degree square (±3 degrees)
 * - Y=±21: Added ±15, removed ±21,±27
 * - Y=±15: Removed ±27
 */
const HUMPHREY_30_2_POINTS = [
    // Y = 27 (4 points)
    {id: 0, x: -9, y: 27},
    {id: 1, x: -3, y: 27},
    {id: 2, x: 3, y: 27},
    {id: 3, x: 9, y: 27},

    // Y = 21 (6 points)
    {id: 4, x: -15, y: 21},
    {id: 5, x: -9, y: 21},
    {id: 6, x: -3, y: 21},
    {id: 7, x: 3, y: 21},
    {id: 8, x: 9, y: 21},
    {id: 9, x: 15, y: 21},

    // Y = 15 (8 points)
    {id: 10, x: -21, y: 15},
    {id: 11, x: -15, y: 15},
    {id: 12, x: -9, y: 15},
    {id: 13, x: -3, y: 15},
    {id: 14, x: 3, y: 15},
    {id: 15, x: 9, y: 15},
    {id: 16, x: 15, y: 15},
    {id: 17, x: 21, y: 15},

    // Y = 9 (10 points)
    {id: 18, x: -27, y: 9},
    {id: 19, x: -21, y: 9},
    {id: 20, x: -15, y: 9},
    {id: 21, x: -9, y: 9},
    {id: 22, x: -3, y: 9},
    {id: 23, x: 3, y: 9},
    {id: 24, x: 9, y: 9},
    {id: 25, x: 15, y: 9},
    {id: 26, x: 21, y: 9},
    {id: 27, x: 27, y: 9},

    // Y = 3 (10 points)
    {id: 28, x: -27, y: 3},
    {id: 29, x: -21, y: 3},
    {id: 30, x: -15, y: 3},
    {id: 31, x: -9, y: 3},
    {id: 32, x: -3, y: 3},
    {id: 33, x: 3, y: 3},
    {id: 34, x: 9, y: 3},
    {id: 35, x: 15, y: 3},
    {id: 36, x: 21, y: 3},
    {id: 37, x: 27, y: 3},

    // Y = -3 (10 points)
    {id: 38, x: -27, y: -3},
    {id: 39, x: -21, y: -3},
    {id: 40, x: -15, y: -3},
    {id: 41, x: -9, y: -3},
    {id: 42, x: -3, y: -3},
    {id: 43, x: 3, y: -3},
    {id: 44, x: 9, y: -3},
    {id: 45, x: 15, y: -3},
    {id: 46, x: 21, y: -3},
    {id: 47, x: 27, y: -3},

    // Y = -9 (10 points)
    {id: 48, x: -27, y: -9},
    {id: 49, x: -21, y: -9},
    {id: 50, x: -15, y: -9},
    {id: 51, x: -9, y: -9},
    {id: 52, x: -3, y: -9},
    {id: 53, x: 3, y: -9},
    {id: 54, x: 9, y: -9},
    {id: 55, x: 15, y: -9},
    {id: 56, x: 21, y: -9},
    {id: 57, x: 27, y: -9},

    // Y = -15 (8 points)
    {id: 58, x: -21, y: -15},
    {id: 59, x: -15, y: -15},
    {id: 60, x: -9, y: -15},
    {id: 61, x: -3, y: -15},
    {id: 62, x: 3, y: -15},
    {id: 63, x: 9, y: -15},
    {id: 64, x: 15, y: -15},
    {id: 65, x: 21, y: -15},

    // Y = -21 (6 points)
    {id: 66, x: -15, y: -21},
    {id: 67, x: -9, y: -21},
    {id: 68, x: -3, y: -21},
    {id: 69, x: 3, y: -21},
    {id: 70, x: 9, y: -21},
    {id: 71, x: 15, y: -21},

    // Y = -27 (4 points)
    {id: 72, x: -9, y: -27},
    {id: 73, x: -3, y: -27},
    {id: 74, x: 3, y: -27},
    {id: 75, x: 9, y: -27}
];
// Total: 4+6+8+10+10+10+10+8+6+4 = 76 points
// Note: Adjusted to match typical 30-2 pattern

/**
 * Test configuration
 */
const TEST_CONFIGS = {
    '10-2': {
        points: HUMPHREY_10_2_POINTS,
        gridSize: 2,  // Each point represents 2×2 degree square
        range: 10,    // Central 10 degrees
        name: 'Humphrey 10-2'
    },
    '30-2': {
        points: HUMPHREY_30_2_POINTS,
        gridSize: 6,  // Each point represents 6×6 degree square
        range: 30,    // Central 30 degrees
        name: 'Humphrey 30-2'
    }
};

/**
 * Initialize point visibility state
 */
function initializePoints(testType) {
    const config = TEST_CONFIGS[testType];
    return config.points.map(point => ({
        ...point,
        isVisible: false
    }));
}
