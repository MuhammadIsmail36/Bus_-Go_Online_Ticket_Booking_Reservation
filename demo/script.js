// ===================================
// MOCK DATA & UTILITIES
// ===================================

// Pre-populated dummy buses
const DUMMY_BUSES = {
    'Karachi-Lahore': [
        {
            id: 'bus-1',
            name: 'Daewoo Express',
            type: 'AC',
            seatType: 'Seater',
            departureTime: '08:00 AM',
            arrivalTime: '06:00 PM',
            duration: '10h 00m',
            price: 2500,
            availableSeats: 15,
            totalSeats: 50,
            bookedSeats: ['A1', 'A2', 'B1', 'C5', 'D3'],
        },
        {
            id: 'bus-2',
            name: 'Hira Travels',
            type: 'AC',
            seatType: 'Sleeper',
            departureTime: '10:00 PM',
            arrivalTime: '08:00 AM',
            duration: '10h 00m',
            price: 3500,
            availableSeats: 20,
            totalSeats: 40,
            bookedSeats: ['A1', 'B2', 'C1'],
        },
        {
            id: 'bus-3',
            name: 'Faisal Movers',
            type: 'Non-AC',
            seatType: 'Seater',
            departureTime: '12:00 PM',
            arrivalTime: '10:00 PM',
            duration: '10h 00m',
            price: 1800,
            availableSeats: 25,
            totalSeats: 50,
            bookedSeats: ['A1', 'A3', 'B1'],
        },
    ],
    'Lahore-Islamabad': [
        {
            id: 'bus-4',
            name: 'City Express',
            type: 'AC',
            seatType: 'Seater',
            departureTime: '06:00 AM',
            arrivalTime: '09:00 AM',
            duration: '3h 00m',
            price: 1500,
            availableSeats: 30,
            totalSeats: 50,
            bookedSeats: ['A1', 'B3'],
        },
        {
            id: 'bus-5',
            name: 'Punjab Coach',
            type: 'AC',
            seatType: 'Seater',
            departureTime: '02:00 PM',
            arrivalTime: '05:00 PM',
            duration: '3h 00m',
            price: 1500,
            availableSeats: 40,
            totalSeats: 50,
            bookedSeats: ['D1'],
        },
    ],
};

const PAKISTAN_CITIES = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Gujranwala'
];

const INDIA_CITIES = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad'
];

const ALL_CITIES = Array.from(new Set([...PAKISTAN_CITIES, ...INDIA_CITIES])).sort();

// ===================================
// PAGE NAVIGATION
// ===================================

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);

        // Initialize page-specific content
        if (page === 'home') initHomePage();
        if (page === 'my-bookings') renderMyBookings();
        if (page === 'admin') initAdminPage();
    }
}

// ===================================
// AUTHENTICATION
// ===================================

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const errorEl = document.getElementById('loginError');
    errorEl.classList.remove('show', 'error', 'success');

    if (!email || !password) {
        errorEl.textContent = 'Please fill in all fields';
        errorEl.classList.add('show', 'error');
        return;
    }

    // Store user info
    localStorage.setItem('user', JSON.stringify({
        email,
        name: email.split('@')[0]
    }));

    errorEl.textContent = 'Login successful! Redirecting...';
    errorEl.classList.add('show', 'success');

    setTimeout(() => navigateTo('home'), 1000);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;

    const errorEl = document.getElementById('registerError');
    errorEl.classList.remove('show', 'error', 'success');

    if (!name || !email || !password || !confirm) {
        errorEl.textContent = 'Please fill in all fields';
        errorEl.classList.add('show', 'error');
        return;
    }

    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match';
        errorEl.classList.add('show', 'error');
        return;
    }

    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        errorEl.classList.add('show', 'error');
        return;
    }

    // Store user info
    localStorage.setItem('user', JSON.stringify({
        name,
        email,
        password
    }));

    errorEl.textContent = 'Registration successful! Logging in...';
    errorEl.classList.add('show', 'success');

    setTimeout(() => navigateTo('home'), 1000);
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    navigateTo('home');
    updateNavBar();
}

function updateNavBar() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    document.getElementById('loginLink').style.display = user ? 'none' : 'block';
    document.getElementById('logoutLink').style.display = user ? 'block' : 'none';
    document.getElementById('adminLink').style.display = isAdmin ? 'block' : 'none';
}

// ===================================
// HOME PAGE
// ===================================

function initHomePage() {
    // Initialize auto-suggestions for city inputs
    initCitySuggestions('searchFrom', 'suggestionsFrom');
    initCitySuggestions('searchTo', 'suggestionsTo');

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('searchDate').value = today;
}

function initCitySuggestions(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);

    input.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        if (value.length < 2) {
            suggestions.style.display = 'none';
            return;
        }

        const filtered = ALL_CITIES.filter(city =>
            city.toLowerCase().includes(value)
        );

        if (filtered.length === 0) {
            suggestions.style.display = 'none';
            return;
        }

        suggestions.innerHTML = filtered.map(city =>
            `<li onclick="selectCity('${inputId}', '${city}')">${city}</li>`
        ).join('');
        suggestions.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input) {
            suggestions.style.display = 'none';
        }
    });
}

function selectCity(inputId, city) {
    document.getElementById(inputId).value = city;
    document.getElementById(inputId === 'searchFrom' ? 'suggestionsFrom' : 'suggestionsTo').style.display = 'none';
}

function handleSearch() {
    const from = document.getElementById('searchFrom').value;
    const to = document.getElementById('searchTo').value;
    const date = document.getElementById('searchDate').value;

    if (!from || !to) {
        alert('Please select both departure and destination cities');
        return;
    }

    // Create route key
    const routeKey = `${from}-${to}`;

    // Get buses for this route or return empty
    const buses = DUMMY_BUSES[routeKey] || [];

    // Store search criteria in sessionStorage
    sessionStorage.setItem('searchCriteria', JSON.stringify({ from, to, date }));
    sessionStorage.setItem('searchResults', JSON.stringify(buses));

    renderSearchResults(from, to, buses);
    navigateTo('search-results');
}

function renderSearchResults(from, to, buses) {
    const title = document.getElementById('resultsTitle');
    title.textContent = `${from} → ${to} (${buses.length} buses found)`;

    const grid = document.getElementById('resultsGrid');

    if (buses.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--muted-foreground);">No buses found for this route</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = buses.map(bus => `
        <div class="bus-card" onclick="selectBus('${bus.id}')">
            <div class="bus-card-header">
                <h3>${bus.name}</h3>
                <span class="bus-type">${bus.type}</span>
            </div>
            <div class="bus-card-body">
                <div class="bus-route">
                    <div class="route-time">
                        <div class="time">${bus.departureTime}</div>
                        <div class="label">Departure</div>
                    </div>
                    <div class="route-arrow">→</div>
                    <div class="route-time">
                        <div class="time">${bus.arrivalTime}</div>
                        <div class="label">Arrival</div>
                    </div>
                </div>
                <div class="bus-details-list">
                    <p>Duration: ${bus.duration}</p>
                    <p>Seats Available: ${bus.availableSeats}/${bus.totalSeats}</p>
                </div>
            </div>
            <div class="bus-card-footer">
                <div class="bus-price">
                    <div class="bus-price-amount">PKR ${bus.price}</div>
                    <div class="bus-price-label">per seat</div>
                </div>
            </div>
        </div>
    `).join('');
}

function selectBus(busId) {
    const results = JSON.parse(sessionStorage.getItem('searchResults') || '[]');
    const bus = results.find(b => b.id === busId);

    if (bus) {
        sessionStorage.setItem('selectedBus', JSON.stringify(bus));
        navigateTo('bus-details');
    }
}

// ===================================
// BUS DETAILS & SEAT SELECTION
// ===================================

function generateSeatLayout(totalSeats) {
    const seats = [];
    const rows = Math.ceil(totalSeats / 4);
    let seatIndex = 0;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < 4 && seatIndex < totalSeats; j++) {
            const seatNumber = String.fromCharCode(65 + i) + (j + 1);
            seats.push(seatNumber);
            seatIndex++;
        }
    }

    return seats;
}

function initBusDetailsPage() {
    const bus = JSON.parse(sessionStorage.getItem('selectedBus') || 'null');

    if (!bus) {
        navigateTo('search-results');
        return;
    }

    const busInfo = document.getElementById('busInfo');
    const criteria = JSON.parse(sessionStorage.getItem('searchCriteria') || '{}');

    busInfo.innerHTML = `
        <div class="bus-info">
            <h3>${bus.name}</h3>
            <div class="info-row">
                <div><span class="info-label">Route</span><span class="info-value">${criteria.from} → ${criteria.to}</span></div>
                <div><span class="info-label">Date</span><span class="info-value">${criteria.date}</span></div>
            </div>
            <div class="info-row">
                <div><span class="info-label">Type</span><span class="info-value">${bus.type} - ${bus.seatType}</span></div>
                <div><span class="info-label">Duration</span><span class="info-value">${bus.duration}</span></div>
            </div>
            <div class="info-row">
                <div><span class="info-label">Departure</span><span class="info-value">${bus.departureTime}</span></div>
                <div><span class="info-label">Arrival</span><span class="info-value">${bus.arrivalTime}</span></div>
            </div>
            <div class="info-row">
                <div><span class="info-label">Price per Seat</span><span class="info-value">PKR ${bus.price}</span></div>
                <div><span class="info-label">Available</span><span class="info-value">${bus.availableSeats}/${bus.totalSeats}</span></div>
            </div>
        </div>
    `;

    // Generate seats
    const seatLayout = generateSeatLayout(bus.totalSeats);
    const seatsGrid = document.getElementById('seatsGrid');

    seatsGrid.innerHTML = seatLayout.map(seat => {
        const isBooked = bus.bookedSeats.includes(seat);
        const isSelected = sessionStorage.getItem('selectedSeats')?.includes(seat);

        return `
            <button class="seat-btn ${isBooked ? 'booked disabled' : isSelected ? 'selected' : ''}"
                    onclick="toggleSeat('${seat}')"
                    ${isBooked ? 'disabled' : ''}>
                ${seat}
            </button>
        `;
    }).join('');

    updateSeatSummary();
}

function toggleSeat(seatNumber) {
    const bus = JSON.parse(sessionStorage.getItem('selectedBus') || 'null');
    if (!bus || bus.bookedSeats.includes(seatNumber)) return;

    let selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats') || '[]');

    if (selectedSeats.includes(seatNumber)) {
        selectedSeats = selectedSeats.filter(s => s !== seatNumber);
    } else {
        if (selectedSeats.length < 6) {
            selectedSeats.push(seatNumber);
        } else {
            alert('Maximum 6 seats can be selected');
            return;
        }
    }

    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    initBusDetailsPage();
}

function updateSeatSummary() {
    const selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats') || '[]');
    const bus = JSON.parse(sessionStorage.getItem('selectedBus') || 'null');

    document.getElementById('selectedSeatsText').textContent = selectedSeats.length > 0
        ? selectedSeats.join(', ')
        : 'None';

    document.getElementById('totalPrice').textContent = selectedSeats.length * bus.price;
}

function handleContinueToPassengers() {
    const selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats') || '[]');

    if (selectedSeats.length === 0) {
        alert('Please select at least one seat');
        return;
    }

    navigateTo('passenger-details');
    renderPassengerForms();
}

// ===================================
// PASSENGER DETAILS
// ===================================

function renderPassengerForms() {
    const selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats') || '[]');
    const container = document.getElementById('passengersForm');

    container.innerHTML = selectedSeats.map((seat, index) => `
        <div class="passenger-form">
            <h4>Passenger ${index + 1} - Seat ${seat}</h4>
            <div class="passenger-form-grid">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="passenger-name" placeholder="Full name" required>
                </div>
                <div class="form-group">
                    <label>Gender</label>
                    <select class="passenger-gender" required>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="number" class="passenger-age" min="1" max="120" placeholder="Age" required>
                </div>
            </div>
        </div>
    `).join('');
}

function handleConfirmBooking() {
    const passengerForms = document.querySelectorAll('.passenger-form');
    const passengers = [];
    const selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats') || '[]');

    let isValid = true;

    passengerForms.forEach((form, index) => {
        const name = form.querySelector('.passenger-name').value;
        const gender = form.querySelector('.passenger-gender').value;
        const age = form.querySelector('.passenger-age').value;

        if (!name || !gender || !age) {
            isValid = false;
            return;
        }

        passengers.push({
            name,
            gender,
            age: parseInt(age),
            seatNumber: selectedSeats[index]
        });
    });

    if (!isValid) {
        alert('Please fill in all passenger details');
        return;
    }

    // Create booking
    const bus = JSON.parse(sessionStorage.getItem('selectedBus') || 'null');
    const criteria = JSON.parse(sessionStorage.getItem('searchCriteria') || '{}');

    const booking = {
        id: Date.now(),
        pnr: 'PNR' + Date.now(),
        from: criteria.from,
        to: criteria.to,
        date: criteria.date,
        busName: bus.name,
        seats: selectedSeats,
        totalFare: selectedSeats.length * bus.price,
        status: 'Confirmed',
        passengers: passengers,
        createdAt: new Date().toLocaleString()
    };

    // Save booking to localStorage
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Update bus booked seats
    bus.bookedSeats = [...bus.bookedSeats, ...selectedSeats];
    bus.availableSeats = bus.totalSeats - bus.bookedSeats.length;

    // Show confirmation
    showBookingConfirmation(booking);
    navigateTo('booking-confirmation');
}

function showBookingConfirmation(booking) {
    document.getElementById('confirmationPNR').textContent = `PNR: ${booking.pnr}`;

    const detailsHtml = `
        <h4>Booking Details</h4>
        <p><strong>Route:</strong> ${booking.from} → ${booking.to}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Bus:</strong> ${booking.busName}</p>
        <p><strong>Seats:</strong> ${booking.seats.join(', ')}</p>
        <p><strong>Total Fare:</strong> PKR ${booking.totalFare}</p>
        <p><strong>Status:</strong> ${booking.status}</p>

        <h4>Passengers</h4>
        ${booking.passengers.map(p => `
            <p>
                <strong>${p.name}</strong> (${p.gender}, Age: ${p.age})
                - Seat: ${p.seatNumber}
            </p>
        `).join('')}
    `;

    document.getElementById('confirmationDetails').innerHTML = detailsHtml;

    // Clear session data
    sessionStorage.removeItem('selectedBus');
    sessionStorage.removeItem('selectedSeats');
    sessionStorage.removeItem('searchCriteria');
    sessionStorage.removeItem('searchResults');
}

// ===================================
// MY BOOKINGS
// ===================================

function renderMyBookings() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        navigateTo('login');
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    const container = document.getElementById('bookingsList');

    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <p style="color: var(--muted-foreground); margin-bottom: 1rem;">No bookings yet</p>
                <button class="btn btn-primary" onclick="navigateTo('home')">Book Now</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bookings-list">
            ${bookings.map(booking => `
                <div class="booking-item">
                    <span class="booking-status ${booking.status.toLowerCase()}">
                        ${booking.status}
                    </span>
                    <h4>${booking.from} → ${booking.to}</h4>
                    <p><strong>Bus:</strong> ${booking.busName}</p>
                    <p><strong>Date:</strong> ${booking.date}</p>
                    <p><strong>PNR:</strong> ${booking.pnr}</p>
                    <p><strong>Total:</strong> PKR ${booking.totalFare}</p>
                    <div class="booking-seats">
                        <strong>Seats:</strong> ${booking.seats.join(', ')}
                    </div>
                    <div class="booking-seats">
                        <strong>Passengers:</strong>
                        ${booking.passengers.map(p => `${p.name} (${p.seatNumber})`).join(', ')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===================================
// CONTACT & FEEDBACK
// ===================================

function handleContactSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const statusEl = document.getElementById('contactStatus');

    if (!name || !email || !message) {
        statusEl.textContent = 'Please fill in all fields';
        statusEl.classList.add('show', 'error');
        return;
    }

    const contact = {
        id: Date.now(),
        name,
        email,
        message,
        status: 'new',
        adminReply: null,
        createdAt: new Date().toLocaleString(),
        repliedAt: null
    };

    let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push(contact);
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    statusEl.textContent = 'Message sent successfully! We will contact you soon.';
    statusEl.classList.add('show', 'success');

    // Reset form
    document.querySelector('#page-home form').reset();

    setTimeout(() => {
        statusEl.classList.remove('show', 'success', 'error');
    }, 5000);
}

function handleFeedbackSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('feedbackName').value.trim();
    const email = document.getElementById('feedbackEmail').value.trim();
    const rating = document.getElementById('feedbackRating').value;
    const comment = document.getElementById('feedbackComment').value.trim();
    const statusEl = document.getElementById('feedbackStatus');

    if (!name || !email || !comment || !rating) {
        statusEl.textContent = 'Please fill in all fields';
        statusEl.classList.add('show', 'error');
        return;
    }

    const feedback = {
        id: Date.now(),
        name,
        email,
        rating: parseInt(rating),
        comment,
        createdAt: new Date().toLocaleString()
    };

    let feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

    statusEl.textContent = 'Thank you for your feedback!';
    statusEl.classList.add('show', 'success');

    // Reset form
    const feedbackForm = document.getElementById('feedbackComment').closest('form');
    feedbackForm.reset();

    setTimeout(() => {
        statusEl.classList.remove('show', 'success', 'error');
    }, 5000);
}

// ===================================
// ADMIN PANEL
// ===================================

function handleAdminLogin(e) {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorEl = document.getElementById('adminError');

    errorEl.classList.remove('show', 'error', 'success');

    // Hardcoded admin credentials
    if (email === 'admin@demo.com' && password === '123') {
        localStorage.setItem('isAdmin', 'true');
        errorEl.textContent = 'Login successful!';
        errorEl.classList.add('show', 'success');
        updateNavBar();

        setTimeout(() => {
            initAdminPage();
        }, 500);
    } else {
        errorEl.textContent = 'Invalid credentials. Use admin@demo.com / 123';
        errorEl.classList.add('show', 'error');
    }
}

function handleAdminLogout() {
    localStorage.removeItem('isAdmin');
    navigateTo('home');
    updateNavBar();
}

function initAdminPage() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (isAdmin) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        renderAdminBookings();
        renderAdminContacts();
        renderAdminFeedback();
    } else {
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
    }
}

function renderAdminBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const container = document.getElementById('adminBookingsList');

    if (bookings.length === 0) {
        container.innerHTML = '<p style="color: var(--muted-foreground);">No bookings yet</p>';
        return;
    }

    container.innerHTML = bookings.map(booking => `
        <div class="admin-message">
            <h5>PNR: ${booking.pnr}</h5>
            <div class="message-field"><strong>Route:</strong> ${booking.from} → ${booking.to}</div>
            <div class="message-field"><strong>Bus:</strong> ${booking.busName}</div>
            <div class="message-field"><strong>Date:</strong> ${booking.date}</div>
            <div class="message-field"><strong>Seats:</strong> ${booking.seats.join(', ')}</div>
            <div class="message-field"><strong>Total:</strong> PKR ${booking.totalFare}</div>
            <div class="message-field"><strong>Status:</strong> ${booking.status}</div>
            <div class="message-field"><strong>Booked:</strong> ${booking.createdAt}</div>
        </div>
    `).join('');
}

function renderAdminContacts() {
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const container = document.getElementById('adminContactList');

    if (messages.length === 0) {
        container.innerHTML = '<p style="color: var(--muted-foreground);">No contact messages</p>';
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="admin-message">
            <h5>${msg.name}</h5>
            <div class="message-field"><strong>Email:</strong> ${msg.email}</div>
            <div class="message-field"><strong>Status:</strong> ${msg.status}</div>
            <div class="message-content">${msg.message}</div>
            ${msg.adminReply ? `
                <div class="message-field"><strong>Reply:</strong></div>
                <div class="message-content">${msg.adminReply}</div>
            ` : ''}
        </div>
    `).join('');
}

function renderAdminFeedback() {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const container = document.getElementById('adminFeedbackList');

    if (feedbacks.length === 0) {
        container.innerHTML = '<p style="color: var(--muted-foreground);">No feedback yet</p>';
        return;
    }

    const avgRating = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1);

    container.innerHTML = `
        <div style="margin-bottom: 2rem; padding: 1rem; background-color: var(--card); border-radius: var(--radius);">
            <p><strong>Average Rating:</strong> ${avgRating}/5 ⭐</p>
            <p><strong>Total Feedback:</strong> ${feedbacks.length}</p>
        </div>
        ${feedbacks.map(feedback => `
            <div class="admin-message">
                <h5>${feedback.name}</h5>
                <div class="message-field"><strong>Email:</strong> ${feedback.email}</div>
                <div class="message-field"><strong>Rating:</strong> ${'⭐'.repeat(feedback.rating)}</div>
                <div class="message-content">${feedback.comment}</div>
                <div class="message-field"><small>${feedback.createdAt}</small></div>
            </div>
        `).join('')}
    `;
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab-content').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(`admin${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    updateNavBar();

    // Listen for page changes that require init
    document.addEventListener('click', (e) => {
        if (e.target.id === 'seatsGrid' || e.target.closest('.page.active')?.id === 'page-bus-details') {
            initBusDetailsPage();
        }
    });

    // Set up page nav listeners
    window.addEventListener('hashchange', () => {
        const page = window.location.hash.slice(1) || 'home';
        navigateTo(page);
    });
});

// Initialize bus details when navigating
const pageContainer = document.querySelector('.pages-container');
if (pageContainer) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const activePage = document.querySelector('.page.active');
                if (activePage?.id === 'page-bus-details') {
                    setTimeout(initBusDetailsPage, 100);
                }
            }
        });
    });

    observer.observe(pageContainer, { attributes: true, subtree: true });
}
