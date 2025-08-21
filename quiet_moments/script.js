/**
 * QuietMoments - Main application class
 * Uses the MeditationWidget component for sidebar display
 */
class QuietMoments {
    constructor() {
        this.meditationWidget = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.initMeditationWidget();
    }

    /**
     * Bind event handlers (placeholder for future functionality)
     */
    bindEvents() {
        // No navigation events needed since we only have home section
    }

    /**
     * Initialize the meditation widget in the sidebar
     */
    initMeditationWidget() {
        this.meditationWidget = new MeditationWidget('sidebar-meditation-widget', {
            showChart: true,
            showStats: true,
            chartDays: 7
        });
    }
}

/**
 * Initialize the application when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    window.quietMoments = new QuietMoments();
});