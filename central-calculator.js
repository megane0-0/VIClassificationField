/**
 * Humphrey Visual Field Diameter Calculator
 * Main application logic
 */

class HumphreyFieldCalculator {
    constructor() {
        this.currentTestType = '10-2';
        this.points = [];
        this.svgNamespace = 'http://www.w3.org/2000/svg';
        this.scale = 15; // pixels per degree
        this.result = null;

        this.init();
    }

    init() {
        // Initialize points
        this.points = initializePoints(this.currentTestType);

        // Set up event listeners
        this.setupEventListeners();

        // Calculate and render initial view
        this.updateResults();
        this.renderVisualField();
    }

    setupEventListeners() {
        // Test type selection
        document.querySelectorAll('input[name="testType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.changeTestType(e.target.value);
            });
        });

        // Control buttons
        document.getElementById('selectAll').addEventListener('click', () => {
            this.selectAll();
        });

        document.getElementById('deselectAll').addEventListener('click', () => {
            this.deselectAll();
        });

        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });

        // Result actions
        document.getElementById('copyResults').addEventListener('click', () => {
            this.copyResults();
        });

        document.getElementById('saveImage').addEventListener('click', () => {
            this.saveImage();
        });
    }

    changeTestType(newType) {
        this.currentTestType = newType;
        this.points = initializePoints(newType);
        this.updateResults();
        this.renderVisualField();
    }

    selectAll() {
        this.points.forEach(point => {
            point.isVisible = true;
        });
        this.updateResults();
        this.renderVisualField();
    }

    deselectAll() {
        this.points.forEach(point => {
            point.isVisible = false;
        });
        this.updateResults();
        this.renderVisualField();
    }

    reset() {
        // Reset to default test type
        this.currentTestType = '10-2';
        document.querySelector('input[value="10-2"]').checked = true;
        this.points = initializePoints(this.currentTestType);
        this.updateResults();
        this.renderVisualField();
    }

    togglePoint(pointId) {
        const point = this.points.find(p => p.id === pointId);
        if (point) {
            point.isVisible = !point.isVisible;
            console.log(`Point ${pointId} toggled to ${point.isVisible}`);
            const visibleCount = this.points.filter(p => p.isVisible).length;
            console.log(`Total visible points: ${visibleCount}`);
            this.updateResults();
            this.renderVisualField();
        }
    }

    renderVisualField() {
        const svg = document.getElementById('visualField');
        const config = TEST_CONFIGS[this.currentTestType];

        // Clear SVG
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        // Calculate SVG dimensions based on range
        const range = config.range;
        const svgWidth = 600;
        const svgHeight = 600;
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;

        // Update scale based on range
        this.scale = Math.min(svgWidth, svgHeight) / (2 * range * 1.2);

        // Create group for visualization
        const visGroup = this.createSVGElement('g', { id: 'visualization' });
        svg.appendChild(visGroup);

        // Render visible region and diameter line (if applicable)
        this.renderVisibleRegion(visGroup, centerX, centerY);

        // Create group for grid
        const gridGroup = this.createSVGElement('g', { id: 'grid' });
        svg.appendChild(gridGroup);

        // Draw axes
        this.drawAxes(gridGroup, centerX, centerY, range);

        // Create group for points
        const pointsGroup = this.createSVGElement('g', { id: 'points' });
        svg.appendChild(pointsGroup);

        // Render fixation point
        this.renderFixationPoint(pointsGroup, centerX, centerY);

        // Render measurement points
        this.points.forEach(point => {
            this.renderPoint(pointsGroup, point, centerX, centerY);
        });
    }

    createSVGElement(tag, attributes = {}) {
        const element = document.createElementNS(this.svgNamespace, tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    drawAxes(group, centerX, centerY, range) {
        // Horizontal axis
        const hLine = this.createSVGElement('line', {
            x1: centerX - range * this.scale,
            y1: centerY,
            x2: centerX + range * this.scale,
            y2: centerY,
            stroke: '#ddd',
            'stroke-width': 1
        });
        group.appendChild(hLine);

        // Vertical axis
        const vLine = this.createSVGElement('line', {
            x1: centerX,
            y1: centerY - range * this.scale,
            x2: centerX,
            y2: centerY + range * this.scale,
            stroke: '#ddd',
            'stroke-width': 1
        });
        group.appendChild(vLine);

        // Draw grid circles every 10 degrees
        for (let r = 10; r <= range; r += 10) {
            const circle = this.createSVGElement('circle', {
                cx: centerX,
                cy: centerY,
                r: r * this.scale,
                fill: 'none',
                stroke: '#eee',
                'stroke-width': 1
            });
            group.appendChild(circle);
        }
    }

    renderFixationPoint(group, centerX, centerY) {
        const size = 10;

        // Draw cross
        const hLine = this.createSVGElement('line', {
            x1: centerX - size,
            y1: centerY,
            x2: centerX + size,
            y2: centerY,
            class: 'fixation-point'
        });
        group.appendChild(hLine);

        const vLine = this.createSVGElement('line', {
            x1: centerX,
            y1: centerY - size,
            x2: centerX,
            y2: centerY + size,
            class: 'fixation-point'
        });
        group.appendChild(vLine);

        // Draw circle around cross
        const circle = this.createSVGElement('circle', {
            cx: centerX,
            cy: centerY,
            r: 6,
            class: 'fixation-point'
        });
        group.appendChild(circle);
    }

    renderPoint(group, point, centerX, centerY) {
        const x = centerX + point.x * this.scale;
        const y = centerY - point.y * this.scale; // Invert Y for screen coordinates

        // Create a group for this point
        const pointGroup = this.createSVGElement('g', {
            class: 'point-group'
        });

        // Add a larger transparent circle for easier clicking
        const hitArea = this.createSVGElement('circle', {
            cx: x,
            cy: y,
            r: 16, // Larger radius for click area
            class: 'point-hitarea'
        });

        // Add the visible circle
        const circle = this.createSVGElement('circle', {
            cx: x,
            cy: y,
            r: 10,
            class: point.isVisible ? 'point visible' : 'point invisible'
        });

        // Add click handler to the group
        pointGroup.addEventListener('click', () => {
            this.togglePoint(point.id);
        });

        pointGroup.appendChild(hitArea);
        pointGroup.appendChild(circle);
        group.appendChild(pointGroup);
    }

    renderVisibleRegion(group, centerX, centerY) {
        if (!this.result || !this.result.visibleRegion) {
            return;
        }

        try {
            const geometry = this.result.visibleRegion.geometry;

            if (geometry.type === 'Polygon') {
                this.renderPolygon(group, geometry.coordinates[0], centerX, centerY, 'visible-region');
            } else if (geometry.type === 'MultiPolygon') {
                geometry.coordinates.forEach(polygon => {
                    this.renderPolygon(group, polygon[0], centerX, centerY, 'visible-region');
                });
            }

            // Render diameter line
            if (this.result.endpoint1 && this.result.endpoint2) {
                this.renderDiameterLine(group, this.result.endpoint1, this.result.endpoint2, centerX, centerY);
            }
        } catch (error) {
            console.error('Error rendering visible region:', error);
        }
    }

    renderPolygon(group, coordinates, centerX, centerY, className) {
        const points = coordinates.map(coord => {
            const x = centerX + coord[0] * this.scale;
            const y = centerY - coord[1] * this.scale;
            return `${x},${y}`;
        }).join(' ');

        const polygon = this.createSVGElement('polygon', {
            points: points,
            class: className
        });

        group.appendChild(polygon);
    }

    renderDiameterLine(group, endpoint1, endpoint2, centerX, centerY) {
        const x1 = centerX + endpoint1.x * this.scale;
        const y1 = centerY - endpoint1.y * this.scale;
        const x2 = centerX + endpoint2.x * this.scale;
        const y2 = centerY - endpoint2.y * this.scale;

        // Draw line
        const line = this.createSVGElement('line', {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            class: 'diameter-line'
        });
        group.appendChild(line);

        // Draw endpoints
        const endpoint1Circle = this.createSVGElement('circle', {
            cx: x1,
            cy: y1,
            r: 5,
            class: 'diameter-endpoint'
        });
        group.appendChild(endpoint1Circle);

        const endpoint2Circle = this.createSVGElement('circle', {
            cx: x2,
            cy: y2,
            r: 5,
            class: 'diameter-endpoint'
        });
        group.appendChild(endpoint2Circle);
    }

    calculateMaxDiameter() {
        const config = TEST_CONFIGS[this.currentTestType];
        const visiblePoints = this.points.filter(p => p.isVisible);

        console.log(`calculateMaxDiameter called, visible points: ${visiblePoints.length}`);

        if (visiblePoints.length === 0) {
            console.log('No visible points, returning zero result');
            return {
                maxDiameter: 0,
                angleDegrees: 0,
                endpoint1: null,
                endpoint2: null,
                visibleRegion: null
            };
        }

        // Check if Turf.js is loaded
        if (typeof turf === 'undefined') {
            console.error('Turf.js is not loaded!');
            alert('エラー: Turf.jsライブラリが読み込まれていません。インターネット接続を確認してください。');
            return {
                maxDiameter: 0,
                angleDegrees: 0,
                endpoint1: null,
                endpoint2: null,
                visibleRegion: null
            };
        }

        try {
            // Step 1: Create squares from visible points
            const halfSize = config.gridSize / 2;
            const squares = visiblePoints.map(p => {
                // Create a square polygon around each point
                const minX = p.x - halfSize;
                const minY = p.y - halfSize;
                const maxX = p.x + halfSize;
                const maxY = p.y + halfSize;

                return turf.polygon([[
                    [minX, minY],
                    [maxX, minY],
                    [maxX, maxY],
                    [minX, maxY],
                    [minX, minY]
                ]]);
            });

            // Step 2: Merge all squares into visible region
            console.log('Merging squares...');
            let visibleRegion = squares[0];
            for (let i = 1; i < squares.length; i++) {
                try {
                    // Check if both geometries are valid
                    if (!visibleRegion || !squares[i]) {
                        console.warn(`Invalid geometry at index ${i}`);
                        continue;
                    }

                    // Use turf.union with Feature Collection
                    const fc = turf.featureCollection([visibleRegion, squares[i]]);
                    const unionResult = turf.union(fc);

                    if (unionResult) {
                        visibleRegion = unionResult;
                    }
                } catch (e) {
                    console.warn(`Union failed at index ${i}, continuing...`, e);
                    // If union fails, try to continue with current region
                }
            }
            console.log('Visible region created:', visibleRegion);

            // Step 3: Find maximum diameter through fixation point
            const fixationPoint = [0, 0];
            let maxDiameter = 0;
            let maxAngle = 0;
            let maxEndpoint1 = null;
            let maxEndpoint2 = null;

            const farDistance = config.range * 2;

            // Check if fixation point is inside visible region
            const fixPoint = turf.point(fixationPoint);
            const isFixationVisible = turf.booleanPointInPolygon(fixPoint, visibleRegion);
            console.log('Fixation point visible:', isFixationVisible);

            // NOTE: Even if fixation point is not visible (center 4 points not visible),
            // we still calculate the major axis through the fixation point if peripheral points are visible.
            // The algorithm works because it uses intersection points with the visible region boundary.

            // Test lines at different angles (0 to 180 degrees, 0.25 degree increments)
            // Exclude hemianopia boundary lines (0°, 90°, 180°, 270°)
            for (let angle = 0; angle <= 180; angle += 0.25) {
                // Skip boundary lines (horizontal: 0°/180°, vertical: 90°/270°)
                const isHorizontal = Math.abs(angle - 0) < 0.01 || Math.abs(angle - 180) < 0.01;
                const isVertical = Math.abs(angle - 90) < 0.01;

                if (isHorizontal || isVertical) {
                    continue;
                }

                const radians = (angle * Math.PI) / 180;

                // Create line through fixation point
                const dx = Math.cos(radians);
                const dy = Math.sin(radians);

                const x1 = fixationPoint[0] + farDistance * dx;
                const y1 = fixationPoint[1] + farDistance * dy;
                const x2 = fixationPoint[0] - farDistance * dx;
                const y2 = fixationPoint[1] - farDistance * dy;

                const line = turf.lineString([[x1, y1], [x2, y2]]);

                try {
                    // Find intersection points with visible region (polygon directly)
                    const intersections = turf.lineIntersect(line, visibleRegion);

                    // Log first angle for debugging
                    if (angle === 0) {
                        console.log(`Angle ${angle}: found ${intersections.features.length} intersections`);
                    }

                    if (intersections.features.length >= 2) {
                        // Calculate diameter through fixation point
                        // Find the furthest points on opposite sides of fixation
                        let maxDistToFix1 = 0;
                        let maxDistToFix2 = 0;
                        let bestPoint1 = null;
                        let bestPoint2 = null;

                        // Separate points by which side of fixation they're on
                        const side1Points = [];
                        const side2Points = [];

                        for (const feature of intersections.features) {
                            const coord = feature.geometry.coordinates;
                            const vecX = coord[0] - fixationPoint[0];
                            const vecY = coord[1] - fixationPoint[1];

                            // Check which side of fixation this point is on
                            const dotProduct = vecX * dx + vecY * dy;

                            if (dotProduct > 0) {
                                side1Points.push(feature);
                            } else {
                                side2Points.push(feature);
                            }
                        }

                        // Debug log for first angle
                        if (angle === 0) {
                            console.log(`Side1 points: ${side1Points.length}, Side2 points: ${side2Points.length}`);
                            if (side1Points.length > 0) {
                                console.log('Side1 first point:', side1Points[0].geometry.coordinates);
                            }
                            if (side2Points.length > 0) {
                                console.log('Side2 first point:', side2Points[0].geometry.coordinates);
                            }
                        }

                        // Special case: if all points are on one side, try to find major axis anyway
                        if (side1Points.length === 0 || side2Points.length === 0) {
                            // All intersection points are on the same side
                            // We need to find two separate rays and calculate visible length for each
                            const allPoints = [...side1Points, ...side2Points];

                            // Sort all points by distance
                            const sortedAll = allPoints.map(p => {
                                const coord = p.geometry.coordinates;
                                const dist = Math.sqrt(
                                    Math.pow(coord[0] - fixationPoint[0], 2) +
                                    Math.pow(coord[1] - fixationPoint[1], 2)
                                );
                                return { coord, dist };
                            }).sort((a, b) => b.dist - a.dist); // furthest first

                            if (sortedAll.length >= 2) {
                                // Take the two furthest points as endpoints
                                const p1 = sortedAll[0];
                                const p2 = sortedAll[1];

                                // For each endpoint, find all intersections along that ray and calculate visible length
                                // Direction 1
                                const dx1 = p1.coord[0] - fixationPoint[0];
                                const dy1 = p1.coord[1] - fixationPoint[1];
                                const pointsOnRay1 = sortedAll.filter(p => {
                                    const dx = p.coord[0] - fixationPoint[0];
                                    const dy = p.coord[1] - fixationPoint[1];
                                    // Check if point is on the same ray (same direction)
                                    const cross = dx * dy1 - dy * dx1;
                                    const dot = dx * dx1 + dy * dy1;
                                    return Math.abs(cross) < 0.01 && dot > 0;
                                }).sort((a, b) => a.dist - b.dist);

                                let visibleLength1 = 0;
                                if (pointsOnRay1.length > 0) {
                                    // Check first segment
                                    const firstDist = pointsOnRay1[0].dist;
                                    const midX = fixationPoint[0] + (pointsOnRay1[0].coord[0] - fixationPoint[0]) / 2;
                                    const midY = fixationPoint[1] + (pointsOnRay1[0].coord[1] - fixationPoint[1]) / 2;
                                    if (turf.booleanPointInPolygon(turf.point([midX, midY]), visibleRegion)) {
                                        visibleLength1 += firstDist;
                                    }
                                    // Check segments between consecutive intersections
                                    for (let i = 0; i < pointsOnRay1.length - 1; i++) {
                                        const segLen = pointsOnRay1[i + 1].dist - pointsOnRay1[i].dist;
                                        const segMidX = (pointsOnRay1[i].coord[0] + pointsOnRay1[i + 1].coord[0]) / 2;
                                        const segMidY = (pointsOnRay1[i].coord[1] + pointsOnRay1[i + 1].coord[1]) / 2;
                                        if (turf.booleanPointInPolygon(turf.point([segMidX, segMidY]), visibleRegion)) {
                                            visibleLength1 += segLen;
                                        }
                                    }
                                }

                                // Direction 2
                                const dx2 = p2.coord[0] - fixationPoint[0];
                                const dy2 = p2.coord[1] - fixationPoint[1];
                                const pointsOnRay2 = sortedAll.filter(p => {
                                    const dx = p.coord[0] - fixationPoint[0];
                                    const dy = p.coord[1] - fixationPoint[1];
                                    const cross = dx * dy2 - dy * dx2;
                                    const dot = dx * dx2 + dy * dy2;
                                    return Math.abs(cross) < 0.01 && dot > 0;
                                }).sort((a, b) => a.dist - b.dist);

                                let visibleLength2 = 0;
                                if (pointsOnRay2.length > 0) {
                                    const firstDist = pointsOnRay2[0].dist;
                                    const midX = fixationPoint[0] + (pointsOnRay2[0].coord[0] - fixationPoint[0]) / 2;
                                    const midY = fixationPoint[1] + (pointsOnRay2[0].coord[1] - fixationPoint[1]) / 2;
                                    if (turf.booleanPointInPolygon(turf.point([midX, midY]), visibleRegion)) {
                                        visibleLength2 += firstDist;
                                    }
                                    for (let i = 0; i < pointsOnRay2.length - 1; i++) {
                                        const segLen = pointsOnRay2[i + 1].dist - pointsOnRay2[i].dist;
                                        const segMidX = (pointsOnRay2[i].coord[0] + pointsOnRay2[i + 1].coord[0]) / 2;
                                        const segMidY = (pointsOnRay2[i].coord[1] + pointsOnRay2[i + 1].coord[1]) / 2;
                                        if (turf.booleanPointInPolygon(turf.point([segMidX, segMidY]), visibleRegion)) {
                                            visibleLength2 += segLen;
                                        }
                                    }
                                }

                                const totalDist = visibleLength1 + visibleLength2;
                                if (totalDist > maxDiameter) {
                                    maxDiameter = totalDist;
                                    maxAngle = angle;
                                    maxEndpoint1 = { x: p1.coord[0], y: p1.coord[1] };
                                    maxEndpoint2 = { x: p2.coord[0], y: p2.coord[1] };
                                }
                            }
                            continue; // Skip normal processing
                        }

                        // MAJOR AXIS (長径) with gap subtraction:
                        // Calculate visible length by checking segments between intersection points

                        // Process side 1
                        let visibleLength1 = 0;
                        let bestEndpoint1 = null;
                        if (side1Points.length > 0) {
                            // Sort by distance from fixation
                            const sortedPoints = side1Points.map(p => {
                                const coord = p.geometry.coordinates;
                                const dist = Math.sqrt(
                                    Math.pow(coord[0] - fixationPoint[0], 2) +
                                    Math.pow(coord[1] - fixationPoint[1], 2)
                                );
                                return { coord, dist };
                            }).sort((a, b) => a.dist - b.dist);

                            bestEndpoint1 = sortedPoints[sortedPoints.length - 1].coord;

                            // Check segment from fixation to first intersection
                            const firstDist = sortedPoints[0].dist;
                            const midX = fixationPoint[0] + (sortedPoints[0].coord[0] - fixationPoint[0]) / 2;
                            const midY = fixationPoint[1] + (sortedPoints[0].coord[1] - fixationPoint[1]) / 2;
                            const midPoint = turf.point([midX, midY]);

                            if (turf.booleanPointInPolygon(midPoint, visibleRegion)) {
                                visibleLength1 += firstDist;
                            }

                            // Check segments between consecutive intersections
                            for (let i = 0; i < sortedPoints.length - 1; i++) {
                                const point1 = sortedPoints[i];
                                const point2 = sortedPoints[i + 1];
                                const segmentLength = point2.dist - point1.dist;

                                const segMidX = (point1.coord[0] + point2.coord[0]) / 2;
                                const segMidY = (point1.coord[1] + point2.coord[1]) / 2;
                                const segMidPoint = turf.point([segMidX, segMidY]);

                                if (turf.booleanPointInPolygon(segMidPoint, visibleRegion)) {
                                    visibleLength1 += segmentLength;
                                }
                            }
                        }

                        // Process side 2
                        let visibleLength2 = 0;
                        let bestEndpoint2 = null;
                        if (side2Points.length > 0) {
                            const sortedPoints = side2Points.map(p => {
                                const coord = p.geometry.coordinates;
                                const dist = Math.sqrt(
                                    Math.pow(coord[0] - fixationPoint[0], 2) +
                                    Math.pow(coord[1] - fixationPoint[1], 2)
                                );
                                return { coord, dist };
                            }).sort((a, b) => a.dist - b.dist);

                            bestEndpoint2 = sortedPoints[sortedPoints.length - 1].coord;

                            const firstDist = sortedPoints[0].dist;
                            const midX = fixationPoint[0] + (sortedPoints[0].coord[0] - fixationPoint[0]) / 2;
                            const midY = fixationPoint[1] + (sortedPoints[0].coord[1] - fixationPoint[1]) / 2;
                            const midPoint = turf.point([midX, midY]);

                            if (turf.booleanPointInPolygon(midPoint, visibleRegion)) {
                                visibleLength2 += firstDist;
                            }

                            for (let i = 0; i < sortedPoints.length - 1; i++) {
                                const point1 = sortedPoints[i];
                                const point2 = sortedPoints[i + 1];
                                const segmentLength = point2.dist - point1.dist;

                                const segMidX = (point1.coord[0] + point2.coord[0]) / 2;
                                const segMidY = (point1.coord[1] + point2.coord[1]) / 2;
                                const segMidPoint = turf.point([segMidX, segMidY]);

                                if (turf.booleanPointInPolygon(segMidPoint, visibleRegion)) {
                                    visibleLength2 += segmentLength;
                                }
                            }
                        }

                        // Calculate total major axis
                        if (visibleLength1 > 0 && visibleLength2 > 0) {
                            const totalDist = visibleLength1 + visibleLength2;

                            if (totalDist > maxDiameter) {
                                maxDiameter = totalDist;
                                maxAngle = angle;
                                maxEndpoint1 = {
                                    x: bestEndpoint1[0],
                                    y: bestEndpoint1[1]
                                };
                                maxEndpoint2 = {
                                    x: bestEndpoint2[0],
                                    y: bestEndpoint2[1]
                                };
                                console.log(`New max at angle ${angle.toFixed(2)}°: ${totalDist.toFixed(4)} degrees (${visibleLength1.toFixed(2)}+${visibleLength2.toFixed(2)})`);
                            }
                        }
                    }
                } catch (e) {
                    // Skip this angle if intersection fails
                    continue;
                }
            }

            console.log(`Calculation complete: maxDiameter=${maxDiameter}, angle=${maxAngle}`);

            return {
                maxDiameter: maxDiameter,
                angleDegrees: maxAngle,
                endpoint1: maxEndpoint1,
                endpoint2: maxEndpoint2,
                visibleRegion: visibleRegion
            };
        } catch (error) {
            console.error('Calculation error:', error);
            alert(`計算エラーが発生しました: ${error.message}`);
            return {
                maxDiameter: 0,
                angleDegrees: 0,
                endpoint1: null,
                endpoint2: null,
                visibleRegion: null
            };
        }
    }

    updateResults() {
        this.result = this.calculateMaxDiameter();
        console.log('Calculation result:', this.result);

        // Update display
        const diameterEl = document.getElementById('maxDiameter');
        const directionEl = document.getElementById('direction');
        const endpoint1El = document.getElementById('endpoint1');
        const endpoint2El = document.getElementById('endpoint2');

        if (!diameterEl || !directionEl || !endpoint1El || !endpoint2El) {
            console.error('Result display elements not found');
            return;
        }

        if (this.result && this.result.maxDiameter > 0) {
            diameterEl.textContent = `${this.result.maxDiameter.toFixed(1)} 度`;

            const directionText = this.getDirectionText(this.result.angleDegrees);
            directionEl.textContent = `${this.result.angleDegrees.toFixed(1)}° (${directionText})`;

            if (this.result.endpoint1) {
                endpoint1El.textContent = `(${this.result.endpoint1.x.toFixed(1)}, ${this.result.endpoint1.y.toFixed(1)})`;
            }
            if (this.result.endpoint2) {
                endpoint2El.textContent = `(${this.result.endpoint2.x.toFixed(1)}, ${this.result.endpoint2.y.toFixed(1)})`;
            }
        } else {
            diameterEl.textContent = '-- 度';
            directionEl.textContent = '--';
            endpoint1El.textContent = '--';
            endpoint2El.textContent = '--';
        }
    }

    getDirectionText(angle) {
        if (angle >= 0 && angle < 22.5) return '右方向';
        if (angle >= 22.5 && angle < 67.5) return '右上方向';
        if (angle >= 67.5 && angle < 112.5) return '上方向';
        if (angle >= 112.5 && angle < 157.5) return '左上方向';
        return '左方向';
    }

    copyResults() {
        if (!this.result) return;

        const config = TEST_CONFIGS[this.currentTestType];
        const date = new Date().toLocaleString('ja-JP');

        const text = `ハンフリー視野検査 最大直径計算結果
===============================
検査タイプ: ${config.name}
最大直径: ${this.result.maxDiameter.toFixed(1)}度
方向: ${this.result.angleDegrees.toFixed(1)}° (${this.getDirectionText(this.result.angleDegrees)})
端点1: ${this.result.endpoint1 ? `(${this.result.endpoint1.x.toFixed(1)}, ${this.result.endpoint1.y.toFixed(1)})` : '--'}
端点2: ${this.result.endpoint2 ? `(${this.result.endpoint2.x.toFixed(1)}, ${this.result.endpoint2.y.toFixed(1)})` : '--'}
測定日時: ${date}`;

        navigator.clipboard.writeText(text).then(() => {
            alert('結果をクリップボードにコピーしました！');
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('コピーに失敗しました');
        });
    }

    saveImage() {
        const svg = document.getElementById('visualField');
        const svgClone = svg.cloneNode(true);

        // Add inline styles to the cloned SVG
        const style = document.createElementNS(this.svgNamespace, 'style');
        style.textContent = `
            .point-hitarea {
                fill: transparent;
                stroke: none;
            }
            .point.visible {
                fill: #4CAF50;
                stroke: #2E7D32;
                stroke-width: 2.5;
            }
            .point.invisible {
                fill: none;
                stroke: #CCCCCC;
                stroke-width: 1.5;
            }
            .fixation-point {
                fill: none;
                stroke: #F44336;
                stroke-width: 3;
            }
            .visible-region {
                fill: rgba(76, 175, 80, 0.2);
                stroke: #4CAF50;
                stroke-width: 1;
            }
            .diameter-line {
                stroke: #F44336;
                stroke-width: 3;
                stroke-dasharray: 8, 4;
            }
            .diameter-endpoint {
                fill: #F44336;
                stroke: #C62828;
                stroke-width: 2;
            }
            line[stroke="#ddd"], line[stroke="#eee"] {
                stroke: #ddd;
                stroke-width: 1;
            }
            circle[stroke="#eee"] {
                fill: none;
                stroke: #eee;
                stroke-width: 1;
            }
        `;
        svgClone.insertBefore(style, svgClone.firstChild);

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // Create image from SVG
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Download
            canvas.toBlob((blob) => {
                const config = TEST_CONFIGS[this.currentTestType];
                const date = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
                const filename = `humphrey_${this.currentTestType}_${date}.png`;

                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();

                URL.revokeObjectURL(url);
            });
        };

        img.onerror = (error) => {
            console.error('Image load error:', error);
            alert('画像の保存に失敗しました');
        };

        img.src = url;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HumphreyFieldCalculator();
});
