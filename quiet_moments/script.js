class MentalHealthBlog {
    constructor() {
        this.posts = this.loadPosts();
        this.quotes = [
            "The present moment is the only time over which we have dominion. - Thich Nhat Hanh",
            "Peace comes from within. Do not seek it without. - Buddha",
            "Mindfulness is a way of befriending ourselves and our experience. - Jon Kabat-Zinn",
            "The best way to take care of the future is to take care of the present moment. - Thich Nhat Hanh",
            "Meditation is not evasion; it is a serene encounter with reality. - Thich Nhat Hanh",
            "You have been assigned this mountain to show others it can be moved. - Mel Robbins",
            "Healing takes time, and asking for help is a courageous step. - Mariska Hargitay",
            "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
            "Progress, not perfection. - Anonymous",
            "It's okay to not be okay. It's not okay to stay that way. - Anonymous"
        ];
        this.init();
    }

    init() {
        this.bindEvents();
        this.displayPosts();
        this.displayRandomQuote();
    }

    bindEvents() {
        const form = document.getElementById('post-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const mood = document.getElementById('mood-select').value;
        
        if (!title || !content) {
            alert('Please fill in both title and content fields.');
            return;
        }
        
        const post = {
            id: Date.now(),
            title: title,
            content: content,
            mood: mood,
            date: new Date().toISOString()
        };
        
        this.addPost(post);
        this.clearForm();
    }

    addPost(post) {
        this.posts.unshift(post);
        this.savePosts();
        this.displayPosts();
    }

    deletePost(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.posts = this.posts.filter(post => post.id !== id);
            this.savePosts();
            this.displayPosts();
        }
    }

    clearForm() {
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('mood-select').value = '';
    }

    displayPosts() {
        const container = document.getElementById('posts-container');
        
        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="no-posts">
                    <p>Start your journey by sharing your first entry above.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.posts.map(post => this.createPostHTML(post)).join('');
        
        // Bind delete events
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.dataset.postId);
                this.deletePost(postId);
            });
        });
    }

    createPostHTML(post) {
        const date = new Date(post.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const moodDisplay = post.mood ? this.getMoodDisplay(post.mood) : '';
        
        return `
            <article class="post">
                <div class="post-header">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                    <div class="post-meta">
                        <span class="post-date">${formattedDate}</span>
                        ${moodDisplay ? `<span class="mood-badge">${moodDisplay}</span>` : ''}
                    </div>
                </div>
                <div class="post-content">${this.escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button class="delete-btn" data-post-id="${post.id}">Delete</button>
                </div>
            </article>
        `;
    }

    getMoodDisplay(mood) {
        const moods = {
            'peaceful': '😌 Peaceful',
            'grateful': '🙏 Grateful',
            'anxious': '😰 Anxious',
            'hopeful': '🌟 Hopeful',
            'reflective': '🤔 Reflective',
            'centered': '🎯 Centered'
        };
        return moods[mood] || mood;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    displayRandomQuote() {
        const quoteElement = document.getElementById('daily-quote');
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        quoteElement.textContent = `"${randomQuote}"`;
    }

    savePosts() {
        try {
            localStorage.setItem('mentalHealthPosts', JSON.stringify(this.posts));
        } catch (error) {
            console.error('Failed to save posts to localStorage:', error);
        }
    }

    loadPosts() {
        try {
            const saved = localStorage.getItem('mentalHealthPosts');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load posts from localStorage:', error);
            return [];
        }
    }
}

// Initialize the blog when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MentalHealthBlog();
});