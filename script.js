// ===================================
// BIG DADDY D & THE DYNAMITES
// Enhanced Interactive Experience
// ===================================

// Mobile Navigation Toggle
const navBurger = document.querySelector('.nav-burger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (navBurger) {
    navBurger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate burger
        const spans = navBurger.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(8px, -8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = navBurger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.show-card, .media-frame, .reason-item, .badge-item').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.8s ease ${index * 0.1}s`;
    observer.observe(el);
});

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 800);
    }
});

// Form Handling - Booking Form (Email Launcher)
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const eventType = document.getElementById('eventType').value;
        const eventDate = document.getElementById('eventDate').value;
        const location = document.getElementById('location').value;
        const message = document.getElementById('message').value;
        
        // Build email body - simplified format that works in all email clients
        let emailBody = 'BOOKING REQUEST FOR BIG DADDY D & THE DYNAMITES\n\n';
        emailBody += '• Event Type: ' + (eventType || 'Not specified') + '\n';
        emailBody += '• Event Date: ' + (eventDate || 'Not specified') + '\n';
        emailBody += '• Location: ' + (location || 'Not specified') + '\n';
        if (message) emailBody += '• Details: ' + message + '\n';
        emailBody += '\n';
        emailBody += 'CONTACT INFO:\n';
        emailBody += '• Name: ' + name + '\n';
        emailBody += '• Email: ' + email + '\n';
        if (phone) emailBody += '• Phone: ' + phone + '\n';
        
        // Build mailto link
        const mailtoLink = 'mailto:darrylporras@hotmail.com' +
            '?subject=' + encodeURIComponent('Booking Request - Big Daddy D & The Dynamites') +
            '&body=' + encodeURIComponent(emailBody);
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Reset form after a short delay
        setTimeout(() => {
            bookingForm.reset();
        }, 1000);
    });
}

// Form Handling - Newsletter Form (Buttondown)
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value;
        const btn = newsletterForm.querySelector('.btn-neon');
        const originalHTML = btn.innerHTML;
        
        // Show loading state
        btn.innerHTML = '<span>SUBSCRIBING...</span>';
        btn.disabled = true;
        
        try {
            // Submit to Buttondown
            const formData = new FormData();
            formData.append('email', email);
            
            await fetch('https://buttondown.email/api/emails/embed-subscribe/bigdaddyd', {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });
            
            // Show success message
            btn.innerHTML = '<span>✓ SUBSCRIBED!</span>';
            btn.style.background = 'linear-gradient(135deg, #00FF00, #00CC00)';
            
            // Clear email input
            emailInput.value = '';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
            
        } catch (error) {
            btn.innerHTML = '<span>ERROR - TRY AGAIN</span>';
            btn.disabled = false;
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 3000);
        }
    });
}

// Custom Cursor Effect (Desktop Only)
if (window.innerWidth > 968) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--neon-blue);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transition: all 0.15s ease;
        box-shadow: 0 0 20px var(--glow-blue);
        opacity: 0;
    `;
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = '1';
    });
    
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .play-icon');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.borderColor = 'var(--neon-gold)';
            cursor.style.boxShadow = '0 0 30px var(--glow-gold)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.borderColor = 'var(--neon-blue)';
            cursor.style.boxShadow = '0 0 20px var(--glow-blue)';
        });
    });
}

// Vinyl Record Interaction
const vinylDisc = document.querySelector('.vinyl-disc');
if (vinylDisc) {
    vinylDisc.addEventListener('click', () => {
        vinylDisc.style.animationPlayState = 
            vinylDisc.style.animationPlayState === 'paused' ? 'running' : 'paused';
    });
}

// Neon Flicker Effect on Hover
const neonElements = document.querySelectorAll('.nav-brand, .hero-title, .section-title');
neonElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        el.style.animation = 'neonFlicker 0.5s ease-in-out 3';
    });
});

// Dynamic Year in Footer
const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    footerYear.textContent = `© ${currentYear} Big Daddy D & The Dynamites. All Rights Reserved.`;
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // H key - Go to home
    if (e.key === 'h' && !e.target.matches('input, textarea')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // B key - Go to booking
    if (e.key === 'b' && !e.target.matches('input, textarea')) {
        const booking = document.getElementById('booking');
        if (booking) {
            booking.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Loading Animation Complete
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    
    // Trigger animations
    setTimeout(() => {
        const elements = document.querySelectorAll('.show-card, .media-frame, .reason-item');
        elements.forEach(el => observer.observe(el));
    }, 100);
});

// Easter Egg Console Message
console.log('%c🎸 BIG DADDY D & THE DYNAMITES 🎸', 
    'font-size: 24px; font-weight: bold; color: #FFD700; text-shadow: 0 0 10px #FFD700;');
console.log('%c25 Years of House-Rockin\' Blues!', 
    'font-size: 16px; color: #00D9FF; text-shadow: 0 0 10px #00D9FF;');
console.log('%cBook us at: darrylporras@hotmail.com', 
    'font-size: 12px; color: #FFFFFF;');

// Performance Optimization - Lazy Load Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Scroll Progress Indicator
const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--neon-blue), var(--neon-gold));
    box-shadow: 0 0 20px var(--glow-blue);
    z-index: 10000;
    transition: width 0.1s ease;
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
});

// ===================================
// PHOTO GALLERY
// ===================================

// Load photos on page load — reads from manifest.json generated by sync script
document.addEventListener('DOMContentLoaded', () => {
    loadPhotoGallery();
    setupGalleryFilters();
    setupLightbox();
});

async function loadPhotoGallery() {
    const gallery = document.getElementById('photoGallery');
    if (!gallery) {
        console.error('Photo gallery container not found!');
        return;
    }

    let photoData;
    try {
        const res = await fetch('photos/manifest.json');
        photoData = await res.json();
    } catch (e) {
        console.error('Could not load photo manifest:', e);
        return;
    }

    console.log('Loading photo gallery from manifest...');

    Object.keys(photoData).forEach(category => {
        photoData[category].forEach((photoPath, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item hidden';
            photoItem.dataset.category = category;
            photoItem.dataset.index = index;
            photoItem.dataset.path = photoPath;

            const img = document.createElement('img');
            img.src = photoPath;
            img.alt = `${category} photo`;
            img.loading = 'lazy';

            photoItem.appendChild(img);
            photoItem.addEventListener('click', () => openLightbox(photoPath, category));

            gallery.appendChild(photoItem);
        });
    });
}

function setupGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            const isActive = btn.classList.contains('active');
            // Query photo items dynamically so new photos are included
            const photoItems = document.querySelectorAll('.photo-item');
            
            // If clicking the same button, toggle it off
            if (isActive) {
                btn.classList.remove('active');
                // Hide all photos
                photoItems.forEach(item => {
                    item.classList.add('hidden');
                });
            } else {
                // Remove active from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter photos
                photoItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            }
        });
    });
}

function setupLightbox() {
    // Create lightbox if it doesn't exist
    if (document.querySelector('.lightbox')) return;
    
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-nav lightbox-prev">&#8249;</button>
            <img src="" alt="Gallery photo">
            <button class="lightbox-nav lightbox-next">&#8250;</button>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Close lightbox
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    // Navigation
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigateLightbox(1));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

let currentLightboxPhoto = null;
let currentCategory = null;

function openLightbox(photoPath, category) {
    const lightbox = document.querySelector('.lightbox');
    const img = lightbox.querySelector('img');
    
    img.src = photoPath;
    currentLightboxPhoto = photoPath;
    currentCategory = category;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    if (!currentCategory || !currentLightboxPhoto) return;
    
    const photos = photoData[currentCategory];
    const currentIndex = photos.indexOf(currentLightboxPhoto);
    let newIndex = currentIndex + direction;
    
    // Wrap around
    if (newIndex < 0) newIndex = photos.length - 1;
    if (newIndex >= photos.length) newIndex = 0;
    
    const lightbox = document.querySelector('.lightbox');
    const img = lightbox.querySelector('img');
    
    currentLightboxPhoto = photos[newIndex];
    img.src = currentLightboxPhoto;
}
