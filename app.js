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

        // Render initial view
        this.renderVisualField();
        this.updateResults();
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
        this.renderVisualField();
        this.updateResults();
    }

    selectAll() {
        this.points.forEach(point => {
            point.isVisible = true;
        });
        this.renderVisualField();
        this.updateResults();
    }

    deselectAll() {
        this.points.forEach(point => {
            point.isVisible = false;
        });
        this.renderVisualField();
        this.updateResults();
    }

    reset() {
        // Reset to default test type
        this.currentTestType = '10-2';
        document.querySelector('input[value="10-2"]').checked = true;
        this.points = initializePoints(this.currentTestType);
        this.renderVisualField();
        this.updateResults();
    }

    togglePoint(pointId) {
        const point = this.points.find(p => p.id === pointId);
        if (point) {
            point.isVisible = !point.isVisible;
            this.renderVisualField();
            this.updateResults();
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

        const circle = this.createSVGElement('circle', {
            cx: x,
            cy: y,
            r: 6,
            class: point.isVisible ? 'point visible' : 'point invisible'
        });

        circle.addEventListener('click', () => {
            this.togglePoint(point.id);
        });

        group.appendChild(circle);
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

        if (visiblePoints.length === 0) {
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
                return turf.bboxPolygon([
                    p.x - halfSize,
                    p.y - halfSize,
                    p.x + halfSize,
                    p.y + halfSize
                ]);
            });

            // Step 2: Merge all squares into visible region
            let visibleRegion = squares[0];
            for (let i = 1; i < squares.length; i++) {
                try {
                    visibleRegion = turf.union(visibleRegion, squares[i]);
                } catch (e) {
                    console.warn('Union failed, continuing...', e);
                }
            }

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

            if (!isFixationVisible) {
                // Fixation point is not visible
                return {
                    maxDiameter: 0,
                    angleDegrees: 0,
                    endpoint1: null,
                    endpoint2: null,
                    visibleRegion: visibleRegion
                };
            }

            // Test lines at different angles
            for (let angle = 0; angle < 180; angle += 0.5) {
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
                    // Find intersection points with visible region
                    const intersections = turf.lineIntersect(line, visibleRegion);

                    if (intersections.features.length >= 2) {
                        // Find the two points furthest from each other
                        let maxDist = 0;
                        let point1 = null;
                        let point2 = null;

                        for (let i = 0; i < intersections.features.length; i++) {
                            for (let j = i + 1; j < intersections.features.length; j++) {
                                const p1 = intersections.features[i];
                                const p2 = intersections.features[j];
                                const dist = turf.distance(p1, p2, { units: 'degrees' });

                                if (dist > maxDist) {
                                    maxDist = dist;
                                    point1 = p1;
                                    point2 = p2;
                                }
                            }
                        }

                        // Check if fixation point is between these points
                        if (point1 && point2) {
                            const line12 = turf.lineString([
                                point1.geometry.coordinates,
                                point2.geometry.coordinates
                            ]);
                            const distToFix1 = turf.distance(point1, fixPoint, { units: 'degrees' });
                            const distToFix2 = turf.distance(point2, fixPoint, { units: 'degrees' });
                            const totalDist = turf.distance(point1, point2, { units: 'degrees' });

                            // Check if fixation point is approximately on the line
                            if (Math.abs(distToFix1 + distToFix2 - totalDist) < 0.1) {
                                if (totalDist > maxDiameter) {
                                    maxDiameter = totalDist;
                                    maxAngle = angle;
                                    maxEndpoint1 = {
                                        x: point1.geometry.coordinates[0],
                                        y: point1.geometry.coordinates[1]
                                    };
                                    maxEndpoint2 = {
                                        x: point2.geometry.coordinates[0],
                                        y: point2.geometry.coordinates[1]
                                    };
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Skip this angle if intersection fails
                    continue;
                }
            }

            return {
                maxDiameter: maxDiameter,
                angleDegrees: maxAngle,
                endpoint1: maxEndpoint1,
                endpoint2: maxEndpoint2,
                visibleRegion: visibleRegion
            };
        } catch (error) {
            console.error('Calculation error:', error);
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

        // Update display
        const diameterEl = document.getElementById('maxDiameter');
        const directionEl = document.getElementById('direction');
        const endpoint1El = document.getElementById('endpoint1');
        const endpoint2El = document.getElementById('endpoint2');

        if (this.result.maxDiameter > 0) {
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

        // Re-render to show visible region and diameter line
        this.renderVisualField();
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
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

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

        img.src = url;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HumphreyFieldCalculator();
});
