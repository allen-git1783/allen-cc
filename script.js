document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = this.querySelector('input[type="text"]').value;
    alert(`Thank you ${name} for your message! We will get back to you shortly.`);
    this.reset();
});

const navbar = document.querySelector('.navbar');
let navScrolled = false;
window.addEventListener('scroll', function() {
    const scrolled = window.scrollY > 50;
    if (scrolled === navScrolled) return;
    navScrolled = scrolled;
    navbar.style.boxShadow = scrolled
        ? '0 4px 15px rgba(0, 0, 0, 0.15)'
        : '0 2px 10px rgba(0, 0, 0, 0.1)';
});

document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease-in';
setTimeout(() => { document.body.style.opacity = '1'; }, 100);
