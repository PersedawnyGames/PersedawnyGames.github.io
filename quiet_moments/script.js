class QuietMoments {
    constructor() {
        this.meditationData = [
            {
                date: "2025-08-20T12:00:00.000Z",
                minutes: 21
            },
            {
                date: "2025-08-21T12:00:00.000Z", 
                minutes: 7
            }
        ];
        this.sidebarChart = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initSidebarChart();
    }

    bindEvents() {
        // No navigation events needed since we only have home section
    }

    initSidebarChart() {
        const ctx = document.getElementById('sidebar-meditation-chart');
        if (!ctx) return;
        
        const chartData = this.getChartData(7);

        this.sidebarChart = new Chart(ctx, {
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

}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.quietMoments = new QuietMoments();
});