// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile menu if open
            document.getElementById('nav').classList.remove('active');
        }
    });
});

// Mobile menu toggle
function toggleMenu() {
    const nav = document.getElementById('nav');
    nav.classList.toggle('active');
}

// Console easter egg
console.log(`
╔══════════════════════════════════════╗
║     Welcome to Persedawny.dev!       ║
║                                      ║
║        Indie Game Developer          ║
║                                      ║
║        Thanks for visiting!          ║
╚══════════════════════════════════════╝
`);
