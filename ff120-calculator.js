/**
 * Visual Field Maximum Diameter Calculator
 * Supports multiple test types: Esterman, FF120 Right, FF120 Left
 * IBTA Visual Classification Field Support Tool
 * Version 2.1 - 2025-11-18
 */

class FF120Calculator {
    constructor() {
        this.points = [];
        this.result = null;
        this.currentTestType = 'esterman'; // 'esterman', 'ff120-right', 'ff120-left'
        this.svg = document.getElementById('visualField');
        this.init();
    }

    /**
     * Initialize the calculator
     */
    init() {
        this.points = getVisualFieldCoordinates(this.currentTestType);
        this.calculatePointPolarCoordinates();
        this.renderRadialLines();
        this.renderPoints();
        this.attachEventListeners();
        this.updateResults();
        this.updateTestTypeDisplay();
    }

    /**
     * Calculate polar coordinates (direction and radius) for each point
     */
    calculatePointPolarCoordinates() {
        this.points.forEach(point => {
            // Calculate radius (distance from origin)
            point.radius = Math.sqrt(point.x * point.x + point.y * point.y);

            // Calculate direction (angle in degrees)
            let angle = Math.atan2(-point.y, point.x) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            point.direction = Math.round(angle);
        });
    }

    /**
     * Switch test type
     */
    switchTestType(testType) {
        if (testType === this.currentTestType) return;

        this.currentTestType = testType;
        this.points = getVisualFieldCoordinates(testType);
        this.calculatePointPolarCoordinates();
        this.renderPoints();
        this.updateResults();
        this.updateTestTypeDisplay();
    }

    /**
     * Update test type display in results panel
     */
    updateTestTypeDisplay() {
        const testTypeDisplay = document.getElementById('testTypeDisplay');
        if (!testTypeDisplay) return;

        let displayText = '';
        switch(this.currentTestType) {
            case 'esterman':
                displayText = '両眼開放エスターマン';
                break;
            case 'ff120-right':
                displayText = 'FF120 右眼 (OD)';
                break;
            case 'ff120-left':
                displayText = 'FF120 左眼 (OS)';
                break;
        }
        testTypeDisplay.textContent = displayText;
    }

    /**
     * Get test type name for display
     */
    getTestTypeName() {
        switch(this.currentTestType) {
            case 'esterman':
                return '両眼開放エスターマン (Binocular Esterman)';
            case 'ff120-right':
                return 'FF120 右眼 (OD)';
            case 'ff120-left':
                return 'FF120 左眼 (OS)';
            default:
                return this.currentTestType;
        }
    }

    /**
     * Render radial grid lines
     */
    renderRadialLines() {
        const gridLines = document.getElementById('gridLines');

        // Clear existing radial lines (keep concentric circles)
        const existingLines = gridLines.querySelectorAll('.grid-line');
        existingLines.forEach(line => line.remove());

        const directions = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

        directions.forEach(angle => {
            const radians = (angle * Math.PI) / 180;
            const x = 55 * Math.cos(radians);
            const y = -55 * Math.sin(radians);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', '0');
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'grid-line');
            gridLines.appendChild(line);
        });
    }

    /**
     * Render test points on SVG
     */
    renderPoints() {
        const container = document.getElementById('testPoints');
        container.innerHTML = '';

        this.points.forEach(point => {
            // Create a group for each point (visual + clickable area)
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('data-id', point.id);

            // Add tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `座標: (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), 距離: ${point.radius.toFixed(1)}°`;
            group.appendChild(title);

            // Invisible clickable area (larger for easier clicking)
            const clickArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            clickArea.setAttribute('cx', point.x);
            clickArea.setAttribute('cy', -point.y); // Flip Y for SVG coordinate system
            clickArea.setAttribute('r', '3.0');
            clickArea.setAttribute('fill', 'transparent');
            clickArea.setAttribute('cursor', 'pointer');
            group.appendChild(clickArea);

            // Visible point (smaller, for visual clarity)
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', -point.y); // Flip Y for SVG coordinate system
            circle.setAttribute('r', '1.2');
            circle.setAttribute('class', `test-point ${point.isVisible ? 'on' : 'off'}`);
            circle.setAttribute('pointer-events', 'none'); // Let the clickArea handle clicks
            group.appendChild(circle);

            // Add click event to the group
            group.addEventListener('click', () => this.togglePoint(point.id));

            container.appendChild(group);
        });
    }

    /**
     * Toggle point visibility
     */
    togglePoint(id) {
        const point = this.points.find(p => p.id === id);
        if (point) {
            point.isVisible = !point.isVisible;
            this.updatePointDisplay(id);
            this.updateResults();
        }
    }

    /**
     * Update single point display
     */
    updatePointDisplay(id) {
        const group = document.querySelector(`g[data-id="${id}"]`);
        const point = this.points.find(p => p.id === id);
        if (group && point) {
            const circle = group.querySelector('.test-point');
            if (circle) {
                circle.setAttribute('class', `test-point ${point.isVisible ? 'on' : 'off'}`);
            }
        }
    }

    /**
     * Check if a point at (x, y) is visible based on nearest neighbor interpolation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if the nearest test point is visible
     */
    isPointVisible(x, y) {
        if (this.points.length === 0) return false;

        // Find nearest test point
        let nearestPoint = this.points[0];
        let minDistance = Math.sqrt(
            Math.pow(x - nearestPoint.x, 2) + Math.pow(y - nearestPoint.y, 2)
        );

        for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];
            const distance = Math.sqrt(
                Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
            }
        }

        return nearestPoint.isVisible;
    }

    /**
     * Calculate visible segments along a line through the fixation point
     * @param {number} angleDegrees - Angle in degrees (0 = right, counterclockwise)
     * @returns {Array} Array of visible segments {start, end} where start and end are distances from origin
     */
    calculateVisibleSegments(angleDegrees) {
        const angleRadians = (angleDegrees * Math.PI) / 180;
        const maxRadius = 60; // Maximum radius to check
        const step = 0.1; // Step size in degrees

        const segments = [];
        let currentSegment = null;

        // Check points along the line from -maxRadius to +maxRadius
        for (let radius = -maxRadius; radius <= maxRadius; radius += step) {
            const x = radius * Math.cos(angleRadians);
            const y = radius * Math.sin(angleRadians);

            const isVisible = this.isPointVisible(x, y);

            if (isVisible) {
                if (currentSegment === null) {
                    currentSegment = { start: radius, end: radius };
                } else {
                    currentSegment.end = radius;
                }
            } else {
                if (currentSegment !== null) {
                    segments.push(currentSegment);
                    currentSegment = null;
                }
            }
        }

        // Save any remaining segment
        if (currentSegment !== null) {
            segments.push(currentSegment);
        }

        return segments;
    }

    /**
     * Calculate total visible length along a diameter line
     * @param {number} angleDegrees - Angle in degrees
     * @returns {number} Total visible length in degrees
     */
    calculateVisibleLength(angleDegrees) {
        const segments = this.calculateVisibleSegments(angleDegrees);

        // Calculate total length of all visible segments
        let totalLength = 0;
        for (const segment of segments) {
            totalLength += Math.abs(segment.end - segment.start);
        }

        return totalLength;
    }

    /**
     * Calculate boundary points by analyzing all directions (for visualization)
     */
    calculateBoundaryPoints() {
        const boundaryPoints = [];
        const angleStep = 1; // Check every 1 degree

        for (let angle = 0; angle < 360; angle += angleStep) {
            const angleRadians = (angle * Math.PI) / 180;
            const maxRadius = 60;

            // Find the outermost visible point in this direction
            let maxVisibleRadius = 0;

            for (let radius = 0; radius <= maxRadius; radius += 0.5) {
                const x = radius * Math.cos(angleRadians);
                const y = radius * Math.sin(angleRadians);

                if (this.isPointVisible(x, y)) {
                    maxVisibleRadius = radius;
                }
            }

            boundaryPoints.push({
                direction: angle,
                x: maxVisibleRadius * Math.cos(angleRadians),
                y: maxVisibleRadius * Math.sin(angleRadians),
                radius: maxVisibleRadius
            });
        }

        return boundaryPoints;
    }

    /**
     * Calculate maximum diameter through fixation point
     * Uses nearest neighbor interpolation and calculates visible length only
     */
    calculateMaxDiameter(boundaryPoints) {
        // Check if any points are visible
        const hasVisiblePoints = this.points.some(p => p.isVisible);

        if (!hasVisiblePoints) {
            return {
                maxDiameter: 0,
                angleDegrees: 0,
                endpoint1: null,
                endpoint2: null,
                boundaryPoints: boundaryPoints,
                visibleRegion: null,
                visibleSegments: []
            };
        }

        // Create Voronoi tessellation for ALL test points (120 blocks)
        // Then show only the cells where the test point is visible
        let visibleRegion = null;
        
        if (this.points.length > 0) {
            try {
                // Create Voronoi diagram from ALL test points
                const pointFeatures = turf.featureCollection(
                    this.points.map(p => turf.point([p.x, -p.y]))
                );

const bbox = [-80, -80, 80, 80];
                const voronoiPolygons = turf.voronoi(pointFeatures, { bbox: bbox });

                if (voronoiPolygons && voronoiPolygons.features) {
                    const visibleCells = [];

                    voronoiPolygons.features.forEach(cell => {
                        if (cell.geometry && cell.geometry.type === 'Polygon') {
                            // Find centroid of this cell
                            const centroid = turf.centroid(cell);
                            const [cx, cy] = centroid.geometry.coordinates;

                            // Find nearest test point to this centroid
                            let nearestPoint = null;
                            let minDist = Infinity;

                            this.points.forEach(p => {
                                const dist = Math.sqrt(
                                    Math.pow(p.x - cx, 2) + Math.pow(-p.y - cy, 2)
                                );
                                if (dist < minDist) {
                                    minDist = dist;
                                    nearestPoint = p;
                                }
                            });

                            // If the nearest point is visible, include this cell
                            if (nearestPoint && nearestPoint.isVisible) {
                                visibleCells.push(cell);
                            }
                        }
                    });

                    if (visibleCells.length > 0) {
                        visibleRegion = turf.featureCollection(visibleCells);
                    }
                }
            } catch (e) {
                console.warn('Could not create Voronoi tessellation:', e);
            }
        }
        // Search for maximum visible diameter
        let maxDiameter = 0;
        let maxAngle = 0;
        let maxSegments = [];

        // Test lines through fixation point at 0.5-degree increments
        for (let angle = 0; angle < 180; angle += 0.5) {
            // Skip hemianopia boundary lines
            const isHorizontal = Math.abs(angle - 0) < 0.01 || Math.abs(angle - 180) < 0.01;
            const isVertical = Math.abs(angle - 90) < 0.01;

            if (isHorizontal || isVertical) {
                continue;
            }

            const visibleLength = this.calculateVisibleLength(angle);

            if (visibleLength > maxDiameter) {
                maxDiameter = visibleLength;
                maxAngle = angle;
                maxSegments = this.calculateVisibleSegments(angle);
            }
        }

        // Calculate endpoints from the maximum segments
        let maxEndpoint1 = null;
        let maxEndpoint2 = null;

        if (maxSegments.length > 0) {
            const angleRadians = (maxAngle * Math.PI) / 180;

            let furthestNegative = 0;
            let furthestPositive = 0;

            for (const segment of maxSegments) {
                const points = [segment.start, segment.end];

                for (const point of points) {
                    if (point < furthestNegative) {
                        furthestNegative = point;
                    }
                    if (point > furthestPositive) {
                        furthestPositive = point;
                    }
                }
            }

            if (furthestNegative < -0.01) {
                maxEndpoint1 = {
                    x: furthestNegative * Math.cos(angleRadians),
                    y: -furthestNegative * Math.sin(angleRadians)
                };
            }

            if (furthestPositive > 0.01) {
                maxEndpoint2 = {
                    x: furthestPositive * Math.cos(angleRadians),
                    y: -furthestPositive * Math.sin(angleRadians)
                };
            }
        }

        return {
            maxDiameter: maxDiameter,
            angleDegrees: maxAngle,
            endpoint1: maxEndpoint1,
            endpoint2: maxEndpoint2,
            boundaryPoints: boundaryPoints,
            visibleRegion: visibleRegion,
            visibleSegments: maxSegments
        };
    }

    /**
     * Update calculation results and visualization
     */
    updateResults() {
        const boundaryPoints = this.calculateBoundaryPoints();
        this.result = this.calculateMaxDiameter(boundaryPoints);

        // Update display
        this.updateResultDisplay();
        this.updateVisualization();
    }

    /**
     * Update result display panel
     */
    updateResultDisplay() {
        const maxDiameterEl = document.getElementById('maxDiameter');
        const directionEl = document.getElementById('direction');
        const pointCountEl = document.getElementById('pointCount');
        const boundaryDetailsEl = document.getElementById('boundaryPointsDetails');

        const visibleCount = this.points.filter(p => p.isVisible).length;
        pointCountEl.textContent = `${visibleCount} / 120`;

        if (this.result.maxDiameter === 0) {
            maxDiameterEl.textContent = '0.0 度';
            directionEl.textContent = '-';
        } else {
            maxDiameterEl.textContent = `${this.result.maxDiameter.toFixed(1)} 度`;
            directionEl.textContent = `${this.result.angleDegrees.toFixed(1)}° (${this.getDirectionName(this.result.angleDegrees)})`;
        }

        // Display boundary points details (show first 12 for readability)
        if (this.result.boundaryPoints.length > 0) {
            boundaryDetailsEl.innerHTML = '<h3>境界点（主要方向）:</h3>';
            const mainDirections = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

            mainDirections.forEach(dir => {
                const bp = this.result.boundaryPoints.find(p => Math.abs(p.direction - dir) < 15);
                if (bp) {
                    const item = document.createElement('div');
                    item.className = 'boundary-point-item';
                    item.innerHTML = `
                        <span>${bp.direction}°:</span>
                        <span>${bp.radius.toFixed(1)}度</span>
                    `;
                    boundaryDetailsEl.appendChild(item);
                }
            });
        }
    }

    /**
     * Get direction name in Japanese
     */
    getDirectionName(angle) {
        if (angle >= 0 && angle < 22.5) return '右方向';
        if (angle >= 22.5 && angle < 67.5) return '右上方向';
        if (angle >= 67.5 && angle < 112.5) return '上方向';
        if (angle >= 112.5 && angle < 157.5) return '左上方向';
        if (angle >= 157.5 && angle <= 180) return '左方向';
        return '';
    }

    /**
     * Update SVG visualization
     */
    updateVisualization() {
        // Clear previous visualization
        document.getElementById('visibleRegion').innerHTML = '';
        document.getElementById('boundaryLines').innerHTML = '';
        document.getElementById('diameterLine').innerHTML = '';

        if (!this.result || this.result.maxDiameter === 0) {
            return;
        }

        // Draw visible Voronoi cells
        if (this.result.visibleRegion) {
            const cells = this.result.visibleRegion.features || [this.result.visibleRegion];

            cells.forEach(cell => {
                if (cell.geometry && cell.geometry.coordinates) {
                    const coords = cell.geometry.coordinates[0];
                    const pathData = coords.map((coord, i) => {
                        const [x, y] = coord;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ') + ' Z';

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', pathData);
                    path.setAttribute('class', 'boundary-line');
                    document.getElementById('visibleRegion').appendChild(path);
                }
            });
        }

        // Draw visible segments of the maximum diameter line
        if (this.result.visibleSegments && this.result.visibleSegments.length > 0) {
            const angleRadians = (this.result.angleDegrees * Math.PI) / 180;

            this.result.visibleSegments.forEach(segment => {
                const x1 = segment.start * Math.cos(angleRadians);
                const y1 = -segment.start * Math.sin(angleRadians);
                const x2 = segment.end * Math.cos(angleRadians);
                const y2 = -segment.end * Math.sin(angleRadians);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('class', 'diameter-line');
                line.setAttribute('stroke-width', '0.8');
                document.getElementById('diameterLine').appendChild(line);
            });
        }
        // Draw endpoints (overall extent of all visible segments)
        if (this.result.endpoint1 && this.result.endpoint2) {
            [this.result.endpoint1, this.result.endpoint2].forEach(ep => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', ep.x);
                circle.setAttribute('cy', ep.y);
                circle.setAttribute('r', '1.2');
                circle.setAttribute('class', 'diameter-endpoint');
                document.getElementById('diameterLine').appendChild(circle);
            });
        }
    }

    /**
     * Select all points
     */
    selectAll() {
        this.points.forEach(point => {
            point.isVisible = true;
        });
        this.renderPoints();
        this.updateResults();
    }

    /**
     * Clear all points
     */
    clearAll() {
        this.points.forEach(point => {
            point.isVisible = false;
        });
        this.renderPoints();
        this.updateResults();
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.clearAll();
    }

    /**
     * Generate result text for copying
     */
    getResultText() {
        const now = new Date();
        const dateStr = now.toLocaleString('ja-JP');
        const testTypeName = this.getTestTypeName();

        let text = `視野検査 最大直径計算結果 / Visual Field Maximum Diameter Results\n`;
        text += `========================================\n`;
        text += `検査タイプ / Test Type: ${testTypeName}\n`;
        text += `最大直径 / Maximum Diameter: ${this.result.maxDiameter.toFixed(1)}度 / ${this.result.maxDiameter.toFixed(1)}°\n`;

        if (this.result.angleDegrees !== 0) {
            text += `方向 / Direction: ${this.result.angleDegrees.toFixed(1)}° (${this.getDirectionName(this.result.angleDegrees)})\n`;
        }

        if (this.result.endpoint1 && this.result.endpoint2) {
            text += `端点1 / Endpoint 1: (${this.result.endpoint1.x.toFixed(1)}, ${this.result.endpoint1.y.toFixed(1)})\n`;
            text += `端点2 / Endpoint 2: (${this.result.endpoint2.x.toFixed(1)}, ${this.result.endpoint2.y.toFixed(1)})\n`;
        }

        text += `測定日時 / Measurement Date: ${dateStr}\n`;

        return text;
    }

    /**
     * Copy results to clipboard
     */
    copyResults() {
        const text = this.getResultText();
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('結果をクリップボードにコピーしました');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('コピーに失敗しました');
        });
    }

    /**
     * Save as image (PNG)
     */
    saveAsImage() {
        const svg = document.getElementById('visualField');
        const svgClone = svg.cloneNode(true);

        // Embed CSS styles into the SVG
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            .grid-circle { fill: none; stroke: #E0E0E0; stroke-width: 0.3; }
            .grid-line { stroke: #E0E0E0; stroke-width: 0.2; }
            .test-point.off { fill: none; stroke: #CCCCCC; stroke-width: 0.3; }
            .test-point.on { fill: #4CAF50; stroke: #2E7D32; stroke-width: 0.4; }
            .boundary-line { fill: rgba(76, 175, 80, 0.15); stroke: #4CAF50; stroke-width: 0.5; }
            .diameter-line { stroke: #F44336; stroke-width: 0.8; stroke-dasharray: 2, 2; }
            .diameter-endpoint { fill: #F44336; stroke: white; stroke-width: 0.3; }
        `;
        svgClone.insertBefore(style, svgClone.firstChild);

        const svgData = new XMLSerializer().serializeToString(svgClone);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 700;
        canvas.height = 700;

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            canvas.toBlob(blob => {
                const now = new Date();
                const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);

                let filePrefix = '';
                switch(this.currentTestType) {
                    case 'esterman':
                        filePrefix = 'esterman_binocular';
                        break;
                    case 'ff120-right':
                        filePrefix = 'ff120_OD';
                        break;
                    case 'ff120-left':
                        filePrefix = 'ff120_OS';
                        break;
                }
                const filename = `${filePrefix}_${timestamp}.png`;

                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                a.click();
                URL.revokeObjectURL(a.href);

                this.showToast('画像を保存しました');
            });
        };

        img.src = url;
    }

    /**
     * Show toast notification
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Attach event listeners to UI controls
     */
    attachEventListeners() {
        // Test type selection buttons
        const estermanBtn = document.getElementById('testTypeEsterman');
        const ff120RightBtn = document.getElementById('testTypeFF120Right');
        const ff120LeftBtn = document.getElementById('testTypeFF120Left');

        if (estermanBtn) {
            estermanBtn.addEventListener('click', () => {
                document.querySelectorAll('.btn-test-type').forEach(btn => btn.classList.remove('active'));
                estermanBtn.classList.add('active');
                this.switchTestType('esterman');
            });
        }

        if (ff120RightBtn) {
            ff120RightBtn.addEventListener('click', () => {
                document.querySelectorAll('.btn-test-type').forEach(btn => btn.classList.remove('active'));
                ff120RightBtn.classList.add('active');
                this.switchTestType('ff120-right');
            });
        }

        if (ff120LeftBtn) {
            ff120LeftBtn.addEventListener('click', () => {
                document.querySelectorAll('.btn-test-type').forEach(btn => btn.classList.remove('active'));
                ff120LeftBtn.classList.add('active');
                this.switchTestType('ff120-left');
            });
        }

        // Control buttons
        document.getElementById('selectAll').addEventListener('click', () => this.selectAll());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('reset').addEventListener('click', () => this.reset());
        document.getElementById('copyResult').addEventListener('click', () => this.copyResults());
        document.getElementById('saveImage').addEventListener('click', () => this.saveAsImage());
    }
}

// Initialize the calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new FF120Calculator();
});
