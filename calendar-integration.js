// Google Calendar Integration for Big Daddy D & The Dynamites
// This script fetches upcoming shows from Google Calendar and displays them

const CALENDAR_CONFIG = {
    apiKey: 'AIzaSyDQmO4yLOy8yVjrotQ69f5W5YQGVyiXWNI',
    calendarId: 'bdd10311999@gmail.com',
    maxResults: 10,
    daysAhead: 365
};

class CalendarIntegration {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.calendarId = config.calendarId;
        this.maxResults = config.maxResults || 10;
        this.daysAhead = config.daysAhead || 365;
        this.showsContainer = document.getElementById('shows-grid');
        this.loadingIndicator = document.getElementById('shows-loading');
        this.noShowsMessage = document.getElementById('no-shows');
    }

    async init() {
        try {
            await this.fetchAndDisplayEvents();
        } catch (error) {
            console.error('Error loading calendar:', error);
            this.loadingIndicator.style.display = 'none';
            this.noShowsMessage.style.display = 'block';
        }
    }

    async fetchAndDisplayEvents() {
        const now = new Date();
        const timeMin = now.toISOString();
        const futureDate = new Date(now.getTime() + (this.daysAhead * 24 * 60 * 60 * 1000));
        const timeMax = futureDate.toISOString();

        const url = 'https://www.googleapis.com/calendar/v3/calendars/' + 
            encodeURIComponent(this.calendarId) + '/events?' +
            'key=' + this.apiKey + '&' +
            'timeMin=' + timeMin + '&' +
            'timeMax=' + timeMax + '&' +
            'maxResults=' + this.maxResults + '&' +
            'singleEvents=true&' +
            'orderBy=startTime';

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('API error: ' + response.status);
        }

        const data = await response.json();
        this.displayEvents(data.items || []);
    }

    displayEvents(events) {
        this.loadingIndicator.style.display = 'none';

        if (events.length === 0) {
            this.noShowsMessage.style.display = 'block';
            return;
        }

        this.showsContainer.innerHTML = '';

        events.forEach((event, index) => {
            const showCard = this.createShowCard(event, index === 0);
            this.showsContainer.appendChild(showCard);
        });

        this.animateCards();
    }

    createShowCard(event, isFeatured) {
        const card = document.createElement('div');
        card.className = isFeatured ? 'show-card featured' : 'show-card';

        const startDate = new Date(event.start.dateTime || event.start.date);
        const endDate = new Date(event.end.dateTime || event.end.date);

        const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const day = startDate.getDate();
        
        const isAllDay = !event.start.dateTime;
        let timeString;
        
        if (isAllDay) {
            timeString = 'All Day Event';
        } else {
            const startTime = startDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            const endTime = endDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            timeString = startTime + ' - ' + endTime;
        }

        const eventTitle = event.summary || 'Show';
        const eventLocation = event.location || '';

        const locationHtml = eventLocation ? '<p class="show-location">' + this.escapeHtml(eventLocation) + '</p>' : '';
        const featuredBadge = isFeatured ? '<div class="show-badge">Featured</div>' : '';

        card.innerHTML = 
            '<div class="show-date">' +
                '<span class="month">' + month + '</span>' +
                '<span class="day">' + day + '</span>' +
            '</div>' +
            '<div class="show-details">' +
                '<h3 class="show-venue">' + this.escapeHtml(eventTitle) + '</h3>' +
                locationHtml +
                '<p class="show-time">' + timeString + '</p>' +
                '<button class="show-link show-details-btn">View Details →</button>' +
            '</div>' +
            featuredBadge;

        // Add click handler for modal
        const detailsBtn = card.querySelector('.show-details-btn');
        const self = this;
        detailsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            self.showEventModal(event, startDate, endDate, timeString);
        });

        return card;
    }

    showEventModal(event, startDate, endDate, timeString) {
        const modal = document.createElement('div');
        modal.className = 'event-modal-overlay';
        
        const eventTitle = event.summary || 'Show';
        const eventLocation = event.location || 'Location TBA';
        const eventDescription = event.description || '';
        
        const dateString = startDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const descriptionHtml = eventDescription ? 
            '<div class="modal-info-item">' +
                '<span class="info-icon">ℹ️</span>' +
                '<div class="info-content">' +
                    '<strong>Details</strong>' +
                    '<p>' + this.escapeHtml(eventDescription) + '</p>' +
                '</div>' +
            '</div>' : '';
        
        modal.innerHTML = 
            '<div class="event-modal">' +
                '<button class="modal-close" aria-label="Close">&times;</button>' +
                '<div class="modal-header">' +
                    '<h2>' + this.escapeHtml(eventTitle) + '</h2>' +
                    '<div class="modal-date">' + dateString + '</div>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<div class="modal-info-item">' +
                        '<span class="info-icon">📍</span>' +
                        '<div class="info-content">' +
                            '<strong>Location</strong>' +
                            '<p>' + this.escapeHtml(eventLocation) + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-info-item">' +
                        '<span class="info-icon">🕐</span>' +
                        '<div class="info-content">' +
                            '<strong>Time</strong>' +
                            '<p>' + timeString + '</p>' +
                        '</div>' +
                    '</div>' +
                    descriptionHtml +
                '</div>' +
                '<div class="modal-footer">' +
                    '<a href="#booking" class="btn-neon btn-primary modal-btn">Book Us for Your Event</a>' +
                '</div>' +
            '</div>';
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        const self = this;
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', function() {
            self.closeModal(modal);
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                self.closeModal(modal);
            }
        });
        
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                self.closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        setTimeout(function() {
            modal.classList.add('active');
        }, 10);
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(function() {
            modal.remove();
        }, 300);
    }

    animateCards() {
        const cards = this.showsContainer.querySelectorAll('.show-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease ' + (index * 0.1) + 's';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new CalendarIntegration(CALENDAR_CONFIG);
    calendar.init();
});
