/**
 * MeditationWidget - Reusable meditation progress component
 * Can be embedded on any page with meditation data visualization
 */
class MeditationWidget {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            showChart: true,
            showStats: true,
            chartDays: 7,
            ...options
        };
        
        // Centralized meditation data
        this.meditationData = [
            {
                date: "2025-08-20T12:00:00.000Z",
                minutes: 21
            },
            {
                date: "2025-08-21T12:00:00.000Z", 
                minutes: 17
            }
        ];
        
        this.chart = null;
        this.init();
    }

    /**
     * Initialize the widget
     */
    init() {
        this.render();
        if (this.options.showChart) {
            this.initChart();
        }
        this.updateStats();
    }

    /**
     * Render the widget HTML structure
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID "${this.containerId}" not found`);
            return;
        }

        let html = '<div class="meditation-widget">';
        
        if (this.options.showStats) {
            html += `
                <h3>Meditation Progress</h3>
                <div class="meditation-stats-mini">
                    <div class="stat-mini">
                        <span class="stat-label">Total</span>
                        <span class="stat-value-mini" id="widget-total-minutes-${this.containerId}">0</span>
                        <span class="stat-unit">min</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-label">Streak</span>
                        <span class="stat-value-mini" id="widget-streak-${this.containerId}">0</span>
                        <span class="stat-unit">days</span>
                    </div>
                </div>
            `;
        }

        if (this.options.showChart) {
            html += `
                <div class="widget-chart-container">
                    <canvas id="widget-chart-${this.containerId}"></canvas>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Initialize the chart
     */
    initChart() {
        const ctx = document.getElementById(`widget-chart-${this.containerId}`);
        if (!ctx) return;
        
        const chartData = this.getChartData(this.options.chartDays);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(day => day.dateLabel),
                datasets: [{
                    label: 'Minutes',
                    data: chartData.map(day => day.minutes),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 1.5,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        display: true,
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    x: {
                        display: true,
                        ticks: {
                            font: {
                                size: 9
                            },
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const totalMinutes = this.getTotalMinutes();
        const streak = this.getStreak();

        const totalElement = document.getElementById(`widget-total-minutes-${this.containerId}`);
        const streakElement = document.getElementById(`widget-streak-${this.containerId}`);

        if (totalElement) totalElement.textContent = totalMinutes;
        if (streakElement) streakElement.textContent = streak;
    }

    /**
     * Calculate total meditation minutes
     */
    getTotalMinutes() {
        return this.meditationData.reduce((sum, session) => sum + session.minutes, 0);
    }

    /**
     * Calculate current streak
     */
    getStreak() {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            const hasSession = this.meditationData.some(session => 
                session.date.split('T')[0] === dateStr
            );
            
            if (hasSession) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    /**
     * Generate chart data for the specified number of days
     */
    getChartData(days) {
        const chartData = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayData = this.meditationData.filter(session => 
                session.date.split('T')[0] === dateStr
            );
            
            const totalMinutes = dayData.reduce((sum, session) => sum + session.minutes, 0);
            
            chartData.push({
                date: dateStr,
                minutes: totalMinutes,
                label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                dateLabel: date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
            });
        }
        
        return chartData;
    }

    /**
     * Update meditation data and refresh the widget
     */
    updateData(newData) {
        this.meditationData = newData;
        this.refresh();
    }

    /**
     * Refresh the widget display
     */
    refresh() {
        if (this.chart) {
            const chartData = this.getChartData(this.options.chartDays);
            this.chart.data.labels = chartData.map(day => day.dateLabel);
            this.chart.data.datasets[0].data = chartData.map(day => day.minutes);
            this.chart.update();
        }
        this.updateStats();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MeditationWidget;
}