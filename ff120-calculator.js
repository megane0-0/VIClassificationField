/**
 * Goldmann Visual Field FF120 Maximum Diameter Calculator
 * IBTA Visual Classification Field Support Tool
 * Version 1.1 - 2025-11-10
 */

class FF120Calculator {
    constructor() {
        this.points = [];
        this.result = null;
        this.currentEye = 'right'; // 'right' or 'left'
        this.svg = document.getElementById('visualField');
        this.init();
    }

    /**
     * Initialize the calculator
     */
    init() {
        this.points = getFF120Coordinates(this.currentEye);
        this.calculatePointPolarCoordinates();
        this.renderRadialLines();
        this.renderPoints();
        this.attachEventListeners();
        this.updateResults();
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
     * Switch between right and left eye
     */
    switchEye(eye) {
        if (eye === this.currentEye) return;

        this.currentEye = eye;
        this.points = getFF120Coordinates(eye);
        this.calculatePointPolarCoordinates();
        this.renderPoints();
        this.updateResults();
        this.updateEyeDisplay();
    }

    /**
     * Update eye display in results panel
     */
    updateEyeDisplay() {
        const eyeDisplay = document.getElementById('eyeDisplay');
        eyeDisplay.textContent = this.currentEye === 'right' ? '右目 (OD)' : '左目 (OS)';
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
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', -point.y); // Flip Y for SVG coordinate system
            circle.setAttribute('r', '0.8');
            circle.setAttribute('class', `test-point ${point.isVisible ? 'on' : 'off'}`);
            circle.setAttribute('data-id', point.id);

            // Add tooltip with coordinates
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `座標: (${point.x.toFixed(1)}, ${point.y.toFixed(1)}), 距離: ${point.radius.toFixed(1)}°`;
            circle.appendChild(title);

            circle.addEventListener('click', () => this.togglePoint(point.id));

            container.appendChild(circle);
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
        const circle = document.querySelector(`[data-id="${id}"]`);
        const point = this.points.find(p => p.id === id);
        if (circle && point) {
            circle.setAttribute('class', `test-point ${point.isVisible ? 'on' : 'off'}`);
        }
    }

    /**
     * Calculate boundary points by analyzing all directions
     */
    calculateBoundaryPoints() {
        // Group points by direction (rounded to nearest degree)
        const directionGroups = {};

        this.points.forEach(point => {
            const dir = point.direction;
            if (!directionGroups[dir]) {
                directionGroups[dir] = [];
            }
            directionGroups[dir].push(point);
        });

        const boundaryPoints = [];

        // Get unique directions and sort them
        const directions = Object.keys(directionGroups).map(Number).sort((a, b) => a - b);

        directions.forEach(direction => {
            const dirPoints = directionGroups[direction].sort((a, b) => a.radius - b.radius);

            // Find outermost visible point
            let lastVisibleIndex = -1;
            for (let i = dirPoints.length - 1; i >= 0; i--) {
                if (dirPoints[i].isVisible) {
                    lastVisibleIndex = i;
                    break;
                }
            }

            if (lastVisibleIndex === -1) {
                // No visible points in this direction - boundary at origin
                boundaryPoints.push({
                    direction: direction,
                    x: 0,
                    y: 0,
                    radius: 0
                });
            } else {
                const lastVisible = dirPoints[lastVisibleIndex];

                // Check if there's a next point
                if (lastVisibleIndex + 1 < dirPoints.length) {
                    const nextPoint = dirPoints[lastVisibleIndex + 1];

                    if (!nextPoint.isVisible) {
                        // Next point is invisible - boundary is midpoint
                        const midX = (lastVisible.x + nextPoint.x) / 2;
                        const midY = (lastVisible.y + nextPoint.y) / 2;
                        const midRadius = (lastVisible.radius + nextPoint.radius) / 2;

                        boundaryPoints.push({
                            direction: direction,
                            x: midX,
                            y: midY,
                            radius: midRadius
                        });
                    } else {
                        // Next point is also visible - boundary at outermost visible point
                        boundaryPoints.push({
                            direction: direction,
                            x: lastVisible.x,
                            y: lastVisible.y,
                            radius: lastVisible.radius
                        });
                    }
                } else {
                    // No more points beyond - boundary at outermost visible point
                    boundaryPoints.push({
                        direction: direction,
                        x: lastVisible.x,
                        y: lastVisible.y,
                        radius: lastVisible.radius
                    });
                }
            }
        });

        // Sort by direction
        boundaryPoints.sort((a, b) => a.direction - b.direction);

        return boundaryPoints;
    }

    /**
     * Calculate maximum diameter through fixation point
     */
    calculateMaxDiameter(boundaryPoints) {
        // Check if all boundary points are at origin
        if (boundaryPoints.every(p => p.radius === 0)) {
            return {
                maxDiameter: 0,
                angleDegrees: 0,
                endpoint1: null,
                endpoint2: null,
                boundaryPoints: boundaryPoints,
                visibleRegion: null
            };
        }

        // Create polygon from boundary points
        const polygonCoords = boundaryPoints.map(p => [p.x, -p.y]); // Flip Y for Turf.js
        polygonCoords.push(polygonCoords[0]); // Close the polygon

        let visibleRegion;
        try {
            visibleRegion = turf.polygon([polygonCoords]);
        } catch (e) {
            console.error('Error creating polygon:', e);
            return {
                maxDiameter: 0,
                angleDegrees: 0,
                endpoint1: null,
                endpoint2: null,
                boundaryPoints: boundaryPoints,
                visibleRegion: null
            };
        }

        // Search for maximum diameter
        let maxDiameter = 0;
        let maxAngle = 0;
        let maxEndpoint1 = null;
        let maxEndpoint2 = null;

        const farDistance = 100; // Sufficiently large value

        // Test lines through fixation point at 0.5-degree increments
        for (let angle = 0; angle < 180; angle += 0.5) {
            const radians = (angle * Math.PI) / 180;

            // Line endpoints (in Turf.js coordinate system with flipped Y)
            const x1 = farDistance * Math.cos(radians);
            const y1 = -farDistance * Math.sin(radians);
            const x2 = -farDistance * Math.cos(radians);
            const y2 = -(-farDistance * Math.sin(radians));

            const line = turf.lineString([[x1, y1], [x2, y2]]);

            try {
                const intersections = turf.lineIntersect(line, visibleRegion);

                if (intersections.features.length >= 2) {
                    // Calculate diameter between two intersection points
                    const p1 = intersections.features[0];
                    const p2 = intersections.features[1];
                    const diameter = turf.distance(p1, p2, { units: 'degrees' });

                    if (diameter > maxDiameter) {
                        maxDiameter = diameter;
                        maxAngle = angle;
                        maxEndpoint1 = {
                            x: p1.geometry.coordinates[0],
                            y: p1.geometry.coordinates[1]
                        };
                        maxEndpoint2 = {
                            x: p2.geometry.coordinates[0],
                            y: p2.geometry.coordinates[1]
                        };
                    }
                }
            } catch (e) {
                // No intersection or error - skip
                continue;
            }
        }

        return {
            maxDiameter: maxDiameter,
            angleDegrees: maxAngle,
            endpoint1: maxEndpoint1,
            endpoint2: maxEndpoint2,
            boundaryPoints: boundaryPoints,
            visibleRegion: visibleRegion
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

        // Draw visible region
        if (this.result.visibleRegion) {
            const coords = this.result.visibleRegion.geometry.coordinates[0];
            const pathData = coords.map((coord, i) => {
                const [x, y] = coord;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ' Z';

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('class', 'boundary-line');
            document.getElementById('visibleRegion').appendChild(path);
        }

        // Draw maximum diameter line
        if (this.result.endpoint1 && this.result.endpoint2) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', this.result.endpoint1.x);
            line.setAttribute('y1', this.result.endpoint1.y);
            line.setAttribute('x2', this.result.endpoint2.x);
            line.setAttribute('y2', this.result.endpoint2.y);
            line.setAttribute('class', 'diameter-line');
            document.getElementById('diameterLine').appendChild(line);

            // Draw endpoints
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
        const eyeStr = this.currentEye === 'right' ? '右目 (OD)' : '左目 (OS)';

        let text = `ゴールドマン視野検査 (FF120) 最大直径計算結果\n`;
        text += `========================================\n`;
        text += `検査タイプ: FF120\n`;
        text += `測定眼: ${eyeStr}\n`;
        text += `最大直径: ${this.result.maxDiameter.toFixed(1)}度\n`;

        if (this.result.angleDegrees !== 0) {
            text += `方向: ${this.result.angleDegrees.toFixed(1)}° (${this.getDirectionName(this.result.angleDegrees)})\n`;
        }

        if (this.result.endpoint1 && this.result.endpoint2) {
            text += `端点1: (${this.result.endpoint1.x.toFixed(1)}, ${this.result.endpoint1.y.toFixed(1)})\n`;
            text += `端点2: (${this.result.endpoint2.x.toFixed(1)}, ${this.result.endpoint2.y.toFixed(1)})\n`;
        }

        text += `測定日時: ${dateStr}\n\n`;
        text += `境界点（主要方向）:\n`;

        const mainDirections = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
        mainDirections.forEach(dir => {
            const bp = this.result.boundaryPoints.find(p => Math.abs(p.direction - dir) < 15);
            if (bp) {
                text += `  ${bp.direction.toString().padStart(3)}°: ${bp.radius.toFixed(1)}度\n`;
            }
        });

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
        const svgData = new XMLSerializer().serializeToString(svg);
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
                const eyeStr = this.currentEye === 'right' ? 'OD' : 'OS';
                const filename = `goldmann_FF120_${eyeStr}_${timestamp}.png`;

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
        // Eye selection buttons
        document.getElementById('rightEye').addEventListener('click', () => {
            document.getElementById('rightEye').classList.add('active');
            document.getElementById('leftEye').classList.remove('active');
            this.switchEye('right');
        });

        document.getElementById('leftEye').addEventListener('click', () => {
            document.getElementById('leftEye').classList.add('active');
            document.getElementById('rightEye').classList.remove('active');
            this.switchEye('left');
        });

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
