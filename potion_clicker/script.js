// Custom encryption class
class GameCrypto {
    constructor() {
        this.scramblePattern = [3, 1, 4, 1, 5, 9, 2, 6];
    }

    xorEncrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode ^ keyChar);
        }
        return result;
    }

    customBase64Encode(str) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const customAlphabet = 'ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210-_';
        
        let result = btoa(str);
        let encoded = '';
        
        for (let i = 0; i < result.length; i++) {
            const index = alphabet.indexOf(result[i]);
            encoded += index !== -1 ? customAlphabet[index] : result[i];
        }
        return encoded;
    }

    customBase64Decode(str) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const customAlphabet = 'ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210-_';
        
        let decoded = '';
        for (let i = 0; i < str.length; i++) {
            const index = customAlphabet.indexOf(str[i]);
            decoded += index !== -1 ? alphabet[index] : str[i];
        }
        return atob(decoded);
    }

    encrypt(data) {
        try {
            let jsonString = JSON.stringify(data);
            const checksum = this.generateChecksum(jsonString);
            jsonString = checksum + '|' + jsonString;
            
            const secretKey = 'PotionMaster2024!';
            let encrypted = this.xorEncrypt(jsonString, secretKey);
            encrypted = this.customBase64Encode(encrypted);
            
            return 'v1.' + encrypted;
        } catch (error) {
            console.error('Encryption failed:', error);
            return null;
        }
    }

    decrypt(encryptedData) {
        try {
            if (!encryptedData.startsWith('v1.')) {
                throw new Error('Invalid save version');
            }
            let encrypted = encryptedData.substring(3);
            
            encrypted = this.customBase64Decode(encrypted);
            
            const secretKey = 'PotionMaster2024!';
            let decrypted = this.xorEncrypt(encrypted, secretKey);
            
            const parts = decrypted.split('|');
            if (parts.length !== 2) {
                throw new Error('Invalid save format');
            }
            
            const [checksum, jsonString] = parts;
            const calculatedChecksum = this.generateChecksum(jsonString);
            
            if (checksum !== calculatedChecksum) {
                throw new Error('Save data corrupted');
            }
            
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    generateChecksum(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
}

// Achievement system
class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = this.defineAchievements();
        this.unlockedAchievements = new Set();
        this.clickCounter = 0;
        this.clickTimer = 0;
        this.speedTimer = 0;
        this.adsWatched = 0;
        this.init();
    }

    defineAchievements() {
        return {
            brewing: [
                { id: 'novice_brewer', name: 'Novice Brewer', description: 'Brew 100 potions', tier: 'bronze', target: 100, reward: 'gold', value: 500, icon: '🧪' },
                { id: 'apprentice_alchemist', name: 'Apprentice Alchemist', description: 'Brew 1,000 potions', tier: 'silver', target: 1000, reward: 'gold', value: 2500, icon: '⚗️' },
                { id: 'master_brewer', name: 'Master Brewer', description: 'Brew 10,000 potions', tier: 'gold', target: 10000, reward: 'multiplier', value: 1.1, icon: '🏆' },
                { id: 'legendary_alchemist', name: 'Legendary Alchemist', description: 'Brew 100,000 potions', tier: 'platinum', target: 100000, reward: 'gold', value: 50000, icon: '💎' },
                { id: 'cosmic_brewmaster', name: 'Cosmic Brewmaster', description: 'Brew 1,000,000 potions', tier: 'diamond', target: 1000000, reward: 'multiplier', value: 1.5, icon: '🌟' }
            ],
            automation: [
                { id: 'first_assistant', name: 'First Assistant', description: 'Purchase first automation upgrade', tier: 'bronze', target: 1, reward: 'gold', value: 250, icon: '🤖' },
                { id: 'assembly_line', name: 'Assembly Line', description: 'Own 5 different automation upgrades', tier: 'silver', target: 5, reward: 'gold', value: 1000, icon: '🏭' },
                { id: 'industrial_complex', name: 'Industrial Complex', description: 'Generate 1M gold via automation', tier: 'gold', target: 1000000, reward: 'multiplier', value: 1.2, icon: '⚙️' },
                { id: 'automated_empire', name: 'Automated Empire', description: 'Reach 1000 gold/second', tier: 'platinum', target: 1000, reward: 'gold', value: 100000, icon: '🏰' },
                { id: 'transcendent_factory', name: 'Transcendent Factory', description: 'Own max automation', tier: 'diamond', target: 999, reward: 'multiplier', value: 2.0, icon: '🚀' }
            ],
            resources: [
                { id: 'herb_gatherer', name: 'Herb Gatherer', description: 'Collect 100 herbs', tier: 'bronze', target: 100, reward: 'herbs', value: 50, icon: '🌿' },
                { id: 'crystal_seeker', name: 'Crystal Seeker', description: 'Collect 50 crystals', tier: 'silver', target: 50, reward: 'crystals', value: 25, icon: '💎' },
                { id: 'essence_hunter', name: 'Essence Hunter', description: 'Collect 25 essence', tier: 'gold', target: 25, reward: 'essence', value: 15, icon: '⭐' },
                { id: 'resource_hoarder', name: 'Resource Hoarder', description: 'Have 1000 of each resource', tier: 'platinum', target: 1000, reward: 'multiplier', value: 1.3, icon: '📦' },
                { id: 'infinity_collector', name: 'Infinity Collector', description: 'Collect 10,000 of each resource', tier: 'diamond', target: 10000, reward: 'multiplier', value: 1.8, icon: '♾️' }
            ],
            mastery: [
                { id: 'first_ascension', name: 'First Ascension', description: 'Reach mastery level 2', tier: 'bronze', target: 2, reward: 'gold', value: 1000, icon: '✨' },
                { id: 'dimensional_traveler', name: 'Dimensional Traveler', description: 'Reach mastery level 5', tier: 'silver', target: 5, reward: 'gold', value: 5000, icon: '🌌' },
                { id: 'planar_master', name: 'Planar Master', description: 'Reach mastery level 10', tier: 'gold', target: 10, reward: 'multiplier', value: 1.25, icon: '🔮' },
                { id: 'reality_shaper', name: 'Reality Shaper', description: 'Reach mastery level 25', tier: 'platinum', target: 25, reward: 'multiplier', value: 1.5, icon: '🌠' },
                { id: 'cosmic_transcendence', name: 'Cosmic Transcendence', description: 'Reach mastery level 50', tier: 'diamond', target: 50, reward: 'multiplier', value: 2.5, icon: '💫' }
            ],
            special: [
                { id: 'speed_demon', name: 'Speed Demon', description: 'Earn 1M gold in under 10 minutes', tier: 'silver', target: 1000000, reward: 'gold', value: 25000, icon: '⚡' },
                { id: 'clicker_god', name: 'Clicker God', description: 'Achieve 100 clicks in 10 seconds', tier: 'gold', target: 100, reward: 'multiplier', value: 1.15, icon: '👆' },
                { id: 'ad_enthusiast', name: 'Ad Enthusiast', description: 'Watch 50 advertisements', tier: 'bronze', target: 50, reward: 'gold', value: 10000, icon: '📺' },
                { id: 'perfectionist', name: 'Perfectionist', description: 'Complete all other achievements', tier: 'platinum', target: 1, reward: 'multiplier', value: 3.0, icon: '🎯' }
            ]
        };
    }

    init() {
        this.loadAchievements();
        this.createAchievementUI();
        this.bindEvents();
        // Don't check achievements on initialization to prevent rewards on fresh start
    }

    checkAchievements() {
        Object.entries(this.achievements).forEach(([category, achievements]) => {
            achievements.forEach(achievement => {
                if (!this.unlockedAchievements.has(achievement.id)) {
                    if (this.checkAchievementCondition(achievement)) {
                        this.unlockAchievement(achievement);
                    }
                }
            });
        });
        
        // Update UI to show current progress
        this.updateAchievementUI();
    }

    checkAchievementCondition(achievement) {
        switch(achievement.id) {
            case 'novice_brewer':
            case 'apprentice_alchemist':
            case 'master_brewer':
            case 'legendary_alchemist':
            case 'cosmic_brewmaster':
                return this.game.totalBrewed >= achievement.target;
            
            case 'first_assistant':
                return this.game.upgrades.automation.some(upgrade => upgrade.owned > 0);
            
            case 'assembly_line':
                return this.game.upgrades.automation.filter(upgrade => upgrade.owned > 0).length >= achievement.target;
            
            case 'industrial_complex':
                return this.game.automationEarned >= achievement.target;
            
            case 'automated_empire':
                return this.game.goldPerSecond >= achievement.target;
            
            case 'transcendent_factory':
                return this.game.upgrades.automation.every(upgrade => upgrade.owned >= 10);
            
            case 'herb_gatherer':
                return this.game.herbs >= achievement.target;
            
            case 'crystal_seeker':
                return this.game.crystals >= achievement.target;
            
            case 'essence_hunter':
                return this.game.essence >= achievement.target;
            
            case 'resource_hoarder':
                return this.game.herbs >= achievement.target && this.game.crystals >= achievement.target && this.game.essence >= achievement.target;
            
            case 'infinity_collector':
                return this.game.herbs >= achievement.target && this.game.crystals >= achievement.target && this.game.essence >= achievement.target;
            
            case 'first_ascension':
            case 'dimensional_traveler':
            case 'planar_master':
            case 'reality_shaper':
            case 'cosmic_transcendence':
                return this.game.masteryLevel >= achievement.target;
            
            case 'speed_demon':
                return this.game.totalBrewed >= achievement.target && (Date.now() - this.speedTimer) <= 600000;
            
            case 'clicker_god':
                return this.clickCounter >= achievement.target;
            
            case 'ad_enthusiast':
                return this.adsWatched >= achievement.target;
            
            case 'perfectionist':
                const totalAchievements = Object.values(this.achievements).flat().length - 1;
                return this.unlockedAchievements.size >= totalAchievements;
            
            default:
                return false;
        }
    }

    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        this.grantReward(achievement);
        this.showNotification(achievement);
        this.updateAchievementUI();
        this.saveAchievements();
    }

    grantReward(achievement) {
        switch(achievement.reward) {
            case 'gold':
                this.game.gold += achievement.value;
                break;
            case 'herbs':
                this.game.herbs += achievement.value;
                break;
            case 'crystals':
                this.game.crystals += achievement.value;
                break;
            case 'essence':
                this.game.essence += achievement.value;
                break;
            case 'multiplier':
                this.game.achievementMultiplier = (this.game.achievementMultiplier || 1) * achievement.value;
                break;
        }
    }

    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    createAchievementUI() {
        // Achievement UI is now created in the HTML as part of the tab system
        this.updateAchievementUI();
    }

    updateAchievementUI() {
        Object.entries(this.achievements).forEach(([category, achievements]) => {
            const container = document.getElementById(`${category}-achievements`);
            if (container) {
                container.innerHTML = '';
                achievements.forEach(achievement => {
                    const isUnlocked = this.unlockedAchievements.has(achievement.id);
                    const progress = this.getAchievementProgress(achievement);
                    
                    const achievementEl = document.createElement('div');
                    achievementEl.className = `achievement-item ${isUnlocked ? 'unlocked' : ''} tier-${achievement.tier}`;
                    achievementEl.innerHTML = `
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <div class="achievement-name">${achievement.name}</div>
                            <div class="achievement-description">${achievement.description}</div>
                            <div class="achievement-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                                </div>
                                <div class="progress-text">${this.formatProgress(achievement, progress)}</div>
                            </div>
                            ${isUnlocked ? '<div class="achievement-completed">✓ COMPLETED</div>' : ''}
                        </div>
                    `;
                    container.appendChild(achievementEl);
                });
            }
        });

        this.updateAchievementStats();
    }

    getAchievementProgress(achievement) {
        let current = 0;
        
        switch(achievement.id) {
            case 'novice_brewer':
            case 'apprentice_alchemist':
            case 'master_brewer':
            case 'legendary_alchemist':
            case 'cosmic_brewmaster':
                current = this.game.totalBrewed;
                break;
            
            case 'first_assistant':
                current = this.game.upgrades.automation.some(upgrade => upgrade.owned > 0) ? 1 : 0;
                break;
            
            case 'assembly_line':
                current = this.game.upgrades.automation.filter(upgrade => upgrade.owned > 0).length;
                break;
            
            case 'industrial_complex':
                current = this.game.automationEarned || 0;
                break;
            
            case 'automated_empire':
                current = this.game.goldPerSecond;
                break;
            
            case 'transcendent_factory':
                current = this.game.upgrades.automation.filter(upgrade => upgrade.owned >= 10).length;
                break;
            
            case 'herb_gatherer':
                current = this.game.herbs;
                break;
            
            case 'crystal_seeker':
                current = this.game.crystals;
                break;
            
            case 'essence_hunter':
                current = this.game.essence;
                break;
            
            case 'resource_hoarder':
            case 'infinity_collector':
                current = Math.min(this.game.herbs, this.game.crystals, this.game.essence);
                break;
            
            case 'first_ascension':
            case 'dimensional_traveler':
            case 'planar_master':
            case 'reality_shaper':
            case 'cosmic_transcendence':
                current = this.game.masteryLevel;
                break;
            
            case 'speed_demon':
                current = (Date.now() - this.speedTimer) <= 600000 ? this.game.totalBrewed : 0;
                break;
            
            case 'clicker_god':
                current = this.clickCounter;
                break;
            
            case 'ad_enthusiast':
                current = this.adsWatched;
                break;
            
            case 'perfectionist':
                current = this.unlockedAchievements.size;
                break;
        }
        
        return (current / achievement.target) * 100;
    }

    formatProgress(achievement, progress) {
        const current = Math.floor((progress / 100) * achievement.target);
        return `${this.game.formatNumber(current)} / ${this.game.formatNumber(achievement.target)}`;
    }

    updateAchievementStats() {
        const total = Object.values(this.achievements).flat().length;
        const completed = this.unlockedAchievements.size;
        const percentage = Math.floor((completed / total) * 100);
        
        document.getElementById('achievementCount').textContent = completed;
        document.getElementById('totalAchievements').textContent = total;
        document.getElementById('achievementPercentage').textContent = percentage + '%';
    }

    bindEvents() {
        const originalBrewPotion = this.game.brewPotion.bind(this.game);
        this.game.brewPotion = (e) => {
            this.trackClick();
            originalBrewPotion(e);
            // Don't check achievements here - they're already checked in the brewPotion method
        };

        // Ad watching tracking - DISABLED: Ads not implemented yet
        /*
        const originalWatchAd = this.game.watchAd.bind(this.game);
        this.game.watchAd = (adType) => {
            this.adsWatched++;
            originalWatchAd(adType);
        };
        */
    }

    trackClick() {
        const now = Date.now();
        
        if (now - this.clickTimer > 10000) {
            this.clickCounter = 0;
            this.clickTimer = now;
        }
        
        this.clickCounter++;
    }

    startSpeedTimer() {
        this.speedTimer = Date.now();
    }

    saveAchievements() {
        const achievementData = {
            unlockedAchievements: Array.from(this.unlockedAchievements),
            adsWatched: this.adsWatched,
            speedTimer: this.speedTimer
        };
        localStorage.setItem('achievementData', JSON.stringify(achievementData));
    }

    loadAchievements() {
        const data = localStorage.getItem('achievementData');
        if (data) {
            try {
                const achievementData = JSON.parse(data);
                this.unlockedAchievements = new Set(achievementData.unlockedAchievements || []);
                this.adsWatched = achievementData.adsWatched || 0;
                this.speedTimer = achievementData.speedTimer || Date.now();
            } catch (error) {
                console.error('Failed to load achievements:', error);
            }
        }
    }
}

// Main game class
class PotionBrewingGame {
    constructor() {
        // Game state
        this.gold = 0;
        this.herbs = 0;
        this.crystals = 0;
        this.essence = 0;
        this.totalBrewed = 0;
        this.brewPower = 1;
        this.goldPerSecond = 0;
        this.masteryLevel = 1;
        this.masteryBonus = 0;
        this.achievementMultiplier = 1;
        this.automationEarned = 0;
        this.resourceChanceBonus = 0;
        this.ascensionCost = 10000000;

        // Save system
        this.crypto = new GameCrypto();
        this.saveKey = 'potionBrewingSave';
        this.autoSaveInterval = 30000;

        // Ad system - DISABLED: Ads not implemented yet (keeping variables to prevent errors)
        this.adCooldowns = {
            gold: 0,
            resource: 0,
            click: 0
        };
        this.clickFrenzyActive = false;
        this.clickFrenzyEnd = 0;

        // Upgrade definitions
        this.upgrades = {
            manual: [
                { name: "Silver Spoon", cost: { gold: 25 }, owned: 0, effect: 1, description: "Brewing power +1 per click" },
                { name: "Crystal Stirrer", cost: { gold: 150 }, owned: 0, effect: 2, description: "Brewing power +2 per click" },
                { name: "Mithril Ladle", cost: { gold: 1500, herbs: 100 }, owned: 0, effect: 5, description: "Brewing power +5 per click" },
                { name: "Phoenix Feather Wand", cost: { gold: 25000, crystals: 200 }, owned: 0, effect: 15, description: "Brewing power +15 per click" },
                { name: "Dragon Scale Catalyst", cost: { gold: 500000, essence: 50 }, owned: 0, effect: 50, description: "Brewing power +50 per click" }
            ],
            automation: [
                { name: "Apprentice Helper", cost: { gold: 50 }, owned: 0, effect: 2, description: "Generates 2 gold/sec" },
                { name: "Brewing Familiar", cost: { gold: 400, herbs: 25 }, owned: 0, effect: 6, description: "Generates 6 gold/sec" },
                { name: "Enchanted Cauldron", cost: { gold: 4000, crystals: 40 }, owned: 0, effect: 25, description: "Generates 25 gold/sec" },
                { name: "Alchemical Golem", cost: { gold: 50000, essence: 15 }, owned: 0, effect: 100, description: "Generates 100 gold/sec" },
                { name: "Arcane Laboratory", cost: { gold: 750000, essence: 100 }, owned: 0, effect: 500, description: "Generates 500 gold/sec" },
                { name: "Dimensional Brewery", cost: { gold: 12000000, essence: 500 }, owned: 0, effect: 2500, description: "Generates 2500 gold/sec" }
            ],
            arcane: [
                { name: "Essence Harvester", cost: { gold: 75 }, owned: 0, effect: 0.01, description: "+1% resource chance per click" },
                { name: "Herb Transmutation", cost: { gold: 500, herbs: 25 }, owned: 0, effect: 0.05, description: "+5% to all production" },
                { name: "Crystal Amplification", cost: { gold: 5000, crystals: 50 }, owned: 0, effect: 0.1, description: "+10% to all production" },
                { name: "Essence Manipulation", cost: { gold: 50000, essence: 15 }, owned: 0, effect: 0.15, description: "+15% to all production" },
                { name: "Reality Distortion", cost: { gold: 750000, essence: 100 }, owned: 0, effect: 0.25, description: "+25% to all production" },
                { name: "Cosmic Convergence", cost: { gold: 10000000, essence: 500 }, owned: 0, effect: 0.5, description: "+50% to all production" }
            ]
        };

        this.init();
    }

    init() {
        // Event listeners
        document.getElementById('cauldron').addEventListener('click', (e) => this.brewPotion(e));
        document.getElementById('ascensionBtn').addEventListener('click', () => this.ascend());
        
        // Ad button event listeners - DISABLED: Ads not implemented yet
        /*
        document.getElementById('goldAdBtn').addEventListener('click', () => this.watchAd('gold'));
        document.getElementById('resourceAdBtn').addEventListener('click', () => this.watchAd('resource'));
        document.getElementById('clickAdBtn').addEventListener('click', () => this.watchAd('click'));
        */
        
        // Initialize game
        this.loadGame();
        this.calculateStats();
        this.updateDisplay();
        this.renderUpgrades();
        this.gameLoop();

        // Initialize achievement system (but don't check achievements on startup)
        this.achievementSystem = new AchievementSystem(this);
        this.achievementSystem.startSpeedTimer();

        // Auto-save setup
        setInterval(() => this.saveGame(), this.autoSaveInterval);
        window.addEventListener('beforeunload', () => this.saveGame());
        
        // Initialize upgrade tabs
        this.initializeUpgradeTabs();
        
        // Initialize mystical orb - DISABLED: Ads not implemented yet
        // this.initializeMysticalOrb();
    }

    brewPotion(e) {
        let effectiveBrewPower = Math.floor(this.brewPower * (1 + this.masteryBonus / 100));
        
        // Apply click frenzy - DISABLED: Ads not implemented yet
        // (Click frenzy functionality removed since ads aren't working)
        
        this.gold += effectiveBrewPower;
        this.totalBrewed += effectiveBrewPower;

        // Generate secondary resources with bonus chance
        const herbChance = Math.min(0.05 + this.resourceChanceBonus, 0.5);
        const crystalChance = Math.min(0.02 + this.resourceChanceBonus * 0.4, 0.3);
        const essenceChance = Math.min(0.008 + this.resourceChanceBonus * 0.16, 0.15);
        
        if (Math.random() < herbChance) this.herbs += Math.floor(effectiveBrewPower / 10) || 1;
        if (Math.random() < crystalChance) this.crystals += Math.floor(effectiveBrewPower / 25) || 1;
        if (Math.random() < essenceChance) this.essence += Math.floor(effectiveBrewPower / 50) || 1;

        this.showClickEffect(e, effectiveBrewPower);
        this.updateDisplay();
        this.updateUpgradeAffordability();
        
        // Check achievements after each click
        if (this.achievementSystem) {
            this.achievementSystem.checkAchievements();
        }
    }

    showClickEffect(e, amount) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.textContent = `+${this.formatNumber(amount)}`;
        effect.style.left = e.clientX + 'px';
        effect.style.top = e.clientY + 'px';
        effect.style.position = 'fixed';
        document.body.appendChild(effect);

        setTimeout(() => effect.remove(), 1000);
    }

    buyUpgrade(category, index) {
        const upgrade = this.upgrades[category][index];
        const cost = this.getUpgradeCost(upgrade);

        if (this.canAfford(cost)) {
            this.payResources(cost);
            upgrade.owned++;
            this.calculateStats();
            this.updateDisplay();
            this.renderUpgrades();
            
            // Check achievements after upgrade purchase
            if (this.achievementSystem) {
                this.achievementSystem.checkAchievements();
            }
        }
    }

    canAfford(cost) {
        if (cost.gold && this.gold < cost.gold) return false;
        if (cost.herbs && this.herbs < cost.herbs) return false;
        if (cost.crystals && this.crystals < cost.crystals) return false;
        if (cost.essence && this.essence < cost.essence) return false;
        return true;
    }

    payResources(cost) {
        if (cost.gold) this.gold -= cost.gold;
        if (cost.herbs) this.herbs -= cost.herbs;
        if (cost.crystals) this.crystals -= cost.crystals;
        if (cost.essence) this.essence -= cost.essence;
    }

    getUpgradeCost(upgrade) {
        const multiplier = Math.pow(1.25, upgrade.owned);
        const cost = {};
        if (upgrade.cost.gold) cost.gold = Math.floor(upgrade.cost.gold * multiplier);
        if (upgrade.cost.herbs) cost.herbs = Math.floor(upgrade.cost.herbs * multiplier);
        if (upgrade.cost.crystals) cost.crystals = Math.floor(upgrade.cost.crystals * multiplier);
        if (upgrade.cost.essence) cost.essence = Math.floor(upgrade.cost.essence * multiplier);
        return cost;
    }

    calculateStats() {
        // Calculate manual brewing power
        this.brewPower = 1;
        this.resourceChanceBonus = 0;
        this.upgrades.manual.forEach(upgrade => {
            this.brewPower += upgrade.owned * upgrade.effect;
        });

        // Calculate automation
        this.goldPerSecond = 0;
        this.upgrades.automation.forEach(upgrade => {
            this.goldPerSecond += upgrade.owned * upgrade.effect;
        });

        // Apply arcane bonuses
        let multiplier = 1;
        this.upgrades.arcane.forEach(upgrade => {
            if (upgrade.name === "Essence Harvester") {
                this.resourceChanceBonus += upgrade.owned * upgrade.effect;
            } else {
                multiplier += upgrade.owned * upgrade.effect;
            }
        });

        this.brewPower = Math.floor(this.brewPower * multiplier);
        this.goldPerSecond = Math.floor(this.goldPerSecond * multiplier);

        // Apply mastery bonus
        this.brewPower = Math.floor(this.brewPower * (1 + this.masteryBonus / 100));
        this.goldPerSecond = Math.floor(this.goldPerSecond * (1 + this.masteryBonus / 100));

        // Apply achievement multiplier
        this.brewPower = Math.floor(this.brewPower * this.achievementMultiplier);
        this.goldPerSecond = Math.floor(this.goldPerSecond * this.achievementMultiplier);

        // Show automation info
        const automationInfo = document.getElementById('automationInfo');
        if (this.goldPerSecond > 0) {
            automationInfo.style.display = 'block';
            document.getElementById('cauldron').classList.add('automated');
        } else {
            automationInfo.style.display = 'none';
            document.getElementById('cauldron').classList.remove('automated');
        }
    }

    updateDisplay() {
        document.getElementById('gold').textContent = this.formatNumber(this.gold);
        document.getElementById('herbs').textContent = this.formatNumber(this.herbs);
        document.getElementById('crystals').textContent = this.formatNumber(this.crystals);
        document.getElementById('essence').textContent = this.formatNumber(this.essence);
        document.getElementById('brewPower').textContent = this.formatNumber(this.brewPower);
        document.getElementById('goldPerSecond').textContent = this.formatNumber(this.goldPerSecond);
        document.getElementById('masteryLevel').textContent = this.masteryLevel;
        document.getElementById('totalBrewed').textContent = this.formatNumber(this.totalBrewed);

        // Update ascension info
        const ascensionBonus = this.masteryLevel * 25;
        document.getElementById('ascensionBonus').textContent = ascensionBonus;
        
        const ascensionBtn = document.getElementById('ascensionBtn');
        if (this.totalBrewed >= this.ascensionCost) {
            ascensionBtn.disabled = false;
            ascensionBtn.textContent = `Ascend to Mastery ${this.masteryLevel + 1} (+${ascensionBonus}% bonus!)`;
        } else {
            ascensionBtn.disabled = true;
            const needed = this.formatNumber(this.ascensionCost - this.totalBrewed);
            ascensionBtn.textContent = `Need ${needed} more gold to ascend`;
        }
    }

    renderUpgrades() {
        this.renderUpgradeCategory('manual', 'manualUpgrades');
        this.renderUpgradeCategory('automation', 'automationUpgrades');
        this.renderUpgradeCategory('arcane', 'arcaneUpgrades');
    }

    renderUpgradeCategory(category, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        this.upgrades[category].forEach((upgrade, index) => {
            const cost = this.getUpgradeCost(upgrade);
            const canAfford = this.canAfford(cost);

            const upgradeEl = document.createElement('div');
            upgradeEl.className = `upgrade ${canAfford ? 'affordable' : ''}`;
            upgradeEl.onclick = () => this.buyUpgrade(category, index);

            const costText = Object.entries(cost).map(([resource, amount]) => {
                return `${this.formatNumber(amount)} ${resource}`;
            }).join(', ');

            upgradeEl.innerHTML = `
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-cost">Cost: ${costText}</div>
                <div class="upgrade-owned">Owned: ${upgrade.owned}</div>
            `;

            container.appendChild(upgradeEl);
        });
    }

    updateUpgradeAffordability() {
        ['manual', 'automation', 'arcane'].forEach(category => {
            const containerId = category + 'Upgrades';
            const container = document.getElementById(containerId);
            const upgradeElements = container.querySelectorAll('.upgrade');
            
            this.upgrades[category].forEach((upgrade, index) => {
                const cost = this.getUpgradeCost(upgrade);
                const canAfford = this.canAfford(cost);
                const upgradeEl = upgradeElements[index];
                
                if (upgradeEl) {
                    if (canAfford) {
                        upgradeEl.classList.add('affordable');
                    } else {
                        upgradeEl.classList.remove('affordable');
                    }
                }
            });
        });
    }

    // Ad watching function - DISABLED: Ads not implemented yet
    /*
    watchAd(adType) {
        const currentTime = Date.now();
        
        if (this.adCooldowns[adType] > currentTime) {
            return;
        }
        
        const button = document.getElementById(adType + 'AdBtn');
        button.disabled = true;
        button.style.opacity = '0.5';
        
        const cooldownEl = document.getElementById(adType + 'AdCooldown');
        cooldownEl.textContent = 'Watching...';
        
        setTimeout(() => {
            this.grantAdReward(adType);
            
            const cooldownTimes = { gold: 10 * 60 * 1000, resource: 20 * 60 * 1000, click: 30 * 60 * 1000 };
            this.adCooldowns[adType] = currentTime + cooldownTimes[adType];
            
            button.disabled = false;
            button.style.opacity = '1';
            this.updateDisplay();
        }, 2000);
    }
    */

    // Ad reward granting function - DISABLED: Ads not implemented yet
    /*
    grantAdReward(adType) {
        switch(adType) {
            case 'gold':
                const goldBonus = this.goldPerSecond * 1 * 60 * 60;
                this.gold += goldBonus;
                this.totalBrewed += goldBonus;
                this.showAdReward(`+${this.formatNumber(goldBonus)} Gold!`);
                break;
                
            case 'resource':
                const herbBonus = Math.max(20, this.goldPerSecond * 3);
                const crystalBonus = Math.max(8, this.goldPerSecond * 1.5);
                const essenceBonus = Math.max(3, this.goldPerSecond * 0.5);
                
                this.herbs += herbBonus;
                this.crystals += crystalBonus;
                this.essence += essenceBonus;
                
                this.showAdReward(`Resources Pack Received!`);
                break;
                
            case 'click':
                this.clickFrenzyActive = true;
                this.clickFrenzyEnd = Date.now() + 20000;
                document.getElementById('cauldron').classList.add('click-frenzy');
                this.showAdReward(`Click Frenzy Activated!`);
                break;
        }
    }
    */

    // Ad reward notification function - DISABLED: Ads not implemented yet
    /*
    showAdReward(message) {
        const reward = document.createElement('div');
        reward.style.position = 'fixed';
        reward.style.top = '50%';
        reward.style.left = '50%';
        reward.style.transform = 'translate(-50%, -50%)';
        reward.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
        reward.style.color = 'white';
        reward.style.padding = '20px 30px';
        reward.style.borderRadius = '15px';
        reward.style.fontSize = '1.5em';
        reward.style.fontWeight = 'bold';
        reward.style.zIndex = '1000';
        reward.style.boxShadow = '0 0 30px rgba(52, 152, 219, 0.6)';
        reward.textContent = message;
        
        document.body.appendChild(reward);
        setTimeout(() => reward.remove(), 3000);
    }
    */

    ascend() {
        if (this.totalBrewed >= this.ascensionCost) {
            this.masteryLevel++;
            this.masteryBonus = (this.masteryLevel - 1) * 25;
            
            // Scale ascension cost exponentially
            this.ascensionCost = Math.floor(this.ascensionCost * 1.2);
            
            this.gold = 0;
            this.herbs = 0;
            this.crystals = 0;
            this.essence = 0;
            this.totalBrewed = 0;
            
            Object.values(this.upgrades).forEach(category => {
                category.forEach(upgrade => upgrade.owned = 0);
            });

            this.calculateStats();
            this.updateDisplay();
            this.renderUpgrades();
            
            // Check achievements after ascension
            if (this.achievementSystem) {
                this.achievementSystem.checkAchievements();
            }
        }
    }

    gameLoop() {
        const currentTime = Date.now();
        
        if (this.goldPerSecond > 0) {
            const goldEarned = this.goldPerSecond / 10;
            this.gold += goldEarned;
            this.totalBrewed += goldEarned;
            this.automationEarned += goldEarned;
            
            if (Math.random() < 0.01) this.herbs += Math.floor(this.goldPerSecond / 50) || 1;
            if (Math.random() < 0.005) this.crystals += Math.floor(this.goldPerSecond / 100) || 1;
            if (Math.random() < 0.002) this.essence += Math.floor(this.goldPerSecond / 200) || 1;
            
            this.updateDisplay();
            this.updateUpgradeAffordability();
        }

        // Check achievements
        if (this.achievementSystem) {
            this.achievementSystem.checkAchievements();
        }
        
        // Ad cooldown updates and click frenzy - DISABLED: Ads not implemented yet
        // (Ad functionality removed since ads aren't working)
        
        setTimeout(() => this.gameLoop(), 100);
    }

    // Ad cooldown update function - DISABLED: Ads not implemented yet
    /*
    updateAdCooldowns(currentTime) {
        Object.keys(this.adCooldowns).forEach(adType => {
            const button = document.getElementById(adType + 'AdBtn');
            const cooldownEl = document.getElementById(adType + 'AdCooldown');
            
            if (this.adCooldowns[adType] > currentTime) {
                const remaining = Math.ceil((this.adCooldowns[adType] - currentTime) / 1000);
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                cooldownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                button.disabled = true;
            } else {
                cooldownEl.textContent = 'Ready!';
                button.disabled = false;
            }
        });
    }
    */

    saveGame() {
        try {
            const saveData = {
                gold: this.gold,
                herbs: this.herbs,
                crystals: this.crystals,
                essence: this.essence,
                totalBrewed: this.totalBrewed,
                masteryLevel: this.masteryLevel,
                masteryBonus: this.masteryBonus,
                upgrades: this.upgrades,
                achievementMultiplier: this.achievementMultiplier,
                automationEarned: this.automationEarned,
                resourceChanceBonus: this.resourceChanceBonus,
                ascensionCost: this.ascensionCost,
                timestamp: Date.now(),
                version: '1.0'
            };

            const encrypted = this.crypto.encrypt(saveData);
            if (encrypted) {
                localStorage.setItem(this.saveKey, encrypted);
            }
        } catch (error) {
            console.error('Save failed:', error);
            this.showSaveNotification('Save Failed!', true);
        }
    }

    loadGame() {
        try {
            const encryptedSave = localStorage.getItem(this.saveKey);
            if (!encryptedSave) {
                return;
            }

            const saveData = this.crypto.decrypt(encryptedSave);
            if (!saveData) {
                return;
            }

            this.gold = saveData.gold || 0;
            this.herbs = saveData.herbs || 0;
            this.crystals = saveData.crystals || 0;
            this.essence = saveData.essence || 0;
            this.totalBrewed = saveData.totalBrewed || 0;
            this.masteryLevel = saveData.masteryLevel || 1;
            this.masteryBonus = saveData.masteryBonus || 0;
            this.achievementMultiplier = saveData.achievementMultiplier || 1;
            this.automationEarned = saveData.automationEarned || 0;
            this.resourceChanceBonus = saveData.resourceChanceBonus || 0;
            this.ascensionCost = saveData.ascensionCost || 10000000;

            if (saveData.upgrades) {
                Object.keys(saveData.upgrades).forEach(category => {
                    if (this.upgrades[category]) {
                        saveData.upgrades[category].forEach((upgrade, index) => {
                            if (this.upgrades[category][index]) {
                                this.upgrades[category][index].owned = upgrade.owned || 0;
                            }
                        });
                    }
                });
            }

            this.showSaveNotification('Game Loaded!');
        } catch (error) {
            console.error('Load failed:', error);
        }
    }

    exportSave() {
        const saveData = {
            gold: this.gold,
            herbs: this.herbs,
            crystals: this.crystals,
            essence: this.essence,
            totalBrewed: this.totalBrewed,
            masteryLevel: this.masteryLevel,
            masteryBonus: this.masteryBonus,
            upgrades: this.upgrades,
            timestamp: Date.now(),
            version: '1.0'
        };

        const encrypted = this.crypto.encrypt(saveData);
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(encrypted).then(() => {
                this.showSaveNotification('Save copied to clipboard!');
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = encrypted;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSaveNotification('Save copied to clipboard!');
        }

        return encrypted;
    }

    importSave(saveString) {
        try {
            const saveData = this.crypto.decrypt(saveString.trim());
            if (!saveData) {
                this.showSaveNotification('Invalid save data!', true);
                return false;
            }

            if (confirm('This will overwrite your current progress. Continue?')) {
                this.gold = saveData.gold || 0;
                this.herbs = saveData.herbs || 0;
                this.crystals = saveData.crystals || 0;
                this.essence = saveData.essence || 0;
                this.totalBrewed = saveData.totalBrewed || 0;
                this.masteryLevel = saveData.masteryLevel || 1;
                this.masteryBonus = saveData.masteryBonus || 0;

                Object.values(this.upgrades).forEach(category => {
                    category.forEach(upgrade => upgrade.owned = 0);
                });

                if (saveData.upgrades) {
                    Object.keys(saveData.upgrades).forEach(category => {
                        if (this.upgrades[category]) {
                            saveData.upgrades[category].forEach((upgrade, index) => {
                                if (this.upgrades[category][index]) {
                                    this.upgrades[category][index].owned = upgrade.owned || 0;
                                }
                            });
                        }
                    });
                }

                this.calculateStats();
                this.updateDisplay();
                this.renderUpgrades();
                this.saveGame();
                
                // Check achievements after import
                if (this.achievementSystem) {
                    this.achievementSystem.checkAchievements();
                }

                this.showSaveNotification('Save imported successfully!');
                return true;
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.showSaveNotification('Import failed!', true);
        }
        return false;
    }

    deleteSave() {
        if (confirm('Are you sure you want to delete your save? This cannot be undone!')) {
            // Clear all localStorage data
            localStorage.removeItem(this.saveKey);
            localStorage.removeItem('achievementData');
            
            // Reset all game variables to initial state
            this.gold = 0;
            this.herbs = 0;
            this.crystals = 0;
            this.essence = 0;
            this.totalBrewed = 0;
            this.brewPower = 1;
            this.goldPerSecond = 0;
            this.masteryLevel = 1;
            this.masteryBonus = 0;
            this.achievementMultiplier = 1;
            this.automationEarned = 0;
            this.resourceChanceBonus = 0;
            this.ascensionCost = 10000000;
            
            // Reset all upgrades
            Object.values(this.upgrades).forEach(category => {
                category.forEach(upgrade => upgrade.owned = 0);
            });
            
            // Reset achievement system
            if (this.achievementSystem) {
                this.achievementSystem.unlockedAchievements.clear();
                this.achievementSystem.adsWatched = 0;
                this.achievementSystem.clickCounter = 0;
                this.achievementSystem.speedTimer = Date.now();
                this.achievementSystem.updateAchievementUI();
            }
            
            // Recalculate and update display
            this.calculateStats();
            this.updateDisplay();
            this.renderUpgrades();
            
            this.showSaveNotification('Save deleted and game reset!');
        }
    }

    showSaveNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = isError ? '#e74c3c' : '#27ae60';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1001';
        notification.style.fontSize = '14px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
        if (num < 1000000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num < 1000000000000000) return (num / 1000000000000).toFixed(2) + 'T';
        if (num < 1000000000000000000) return (num / 1000000000000000).toFixed(2) + 'Q';
        return (num / 1000000000000000000).toFixed(2) + 'Qi';
    }

    initializeUpgradeTabs() {
        const tabs = document.querySelectorAll('.upgrade-tab');
        const categories = document.querySelectorAll('.upgrade-category');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and categories
                tabs.forEach(t => t.classList.remove('active'));
                categories.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding category
                const targetCategory = tab.dataset.tab;
                const targetElement = document.querySelector(`[data-category="${targetCategory}"]`);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            });
        });
    }

    // Mystical orb initialization - DISABLED: Ads not implemented yet
    /*
    initializeMysticalOrb() {
        const orb = document.getElementById('mysticalOrb');
        const orbMenu = document.getElementById('orbMenu');
        let isMenuOpen = false;
        
        orb.addEventListener('click', (e) => {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                orbMenu.classList.add('show');
            } else {
                orbMenu.classList.remove('show');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!orbMenu.contains(e.target) && !orb.contains(e.target)) {
                isMenuOpen = false;
                orbMenu.classList.remove('show');
            }
        });
        
        // Prevent menu from closing when clicking inside it
        orbMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    */
}

// Global functions for buttons
function importSavePrompt() {
    const saveString = prompt('Paste your save string here:');
    if (saveString) {
        game.importSave(saveString);
    }
}

// Start the game
const game = new PotionBrewingGame();