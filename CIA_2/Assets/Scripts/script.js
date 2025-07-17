document.addEventListener('DOMContentLoaded', () => {
    //Centralized DOM Element Selection
    const elements = {
        feedbackForm: document.getElementById('feedbackForm'),
        userNameInput: document.getElementById('userName'),
        userEmailInput: document.getElementById('userEmail'),
        favoriteCoffeeInput: document.getElementById('favoriteCoffee'),
        nameError: document.getElementById('nameError'),
        emailError: document.getElementById('emailError'),
        coffeeError: document.getElementById('coffeeError'),
        coffeeListDiv: document.getElementById('coffeeList'),
        searchTermInput: document.getElementById('searchTerm'),
        searchButton: document.getElementById('searchButton'),
        sortOrderSelect: document.getElementById('sortOrder'),
        loadingMessage: document.getElementById('loadingMessage'),
        errorMessage: document.getElementById('errorMessage'),
        noResultsMessage: document.getElementById('noResultsMessage'),
        userGreetingSection: document.getElementById('userGreeting'),
        greetingMessage: document.getElementById('greetingMessage'),
        locationDisplay: document.getElementById('locationDisplay'),
        browserInfoSpan: document.getElementById('browserInfo'),
        osInfoSpan: document.getElementById('osInfo')
    };

    let allCoffees = []; // To store the original fetched data

    const toggleError = (inputElement, errorElement, message, show) => {
        if (show) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            inputElement.classList.add('border-red-500');
        } else {
            errorElement.classList.add('hidden');
            inputElement.classList.remove('border-red-500');
        }
    };

    //Task 3: Geolocation and Browser Info on Page Load
    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    elements.locationDisplay.textContent = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                    elements.userGreetingSection.classList.remove('hidden');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    let message = 'Location not available.';
                    switch(error.code) {
                        case error.PERMISSION_DENIED: message = 'Location access denied.'; break;
                        case error.POSITION_UNAVAILABLE: message = 'Location unavailable.'; break;
                        case error.TIMEOUT: message = 'Location request timed out.'; break;
                    }
                    elements.locationDisplay.textContent = `Location: ${message}`;
                    elements.userGreetingSection.classList.remove('hidden');
                }
            );
        } else {
            elements.locationDisplay.textContent = 'Geolocation not supported by this browser.';
            elements.userGreetingSection.classList.remove('hidden');
        }
    };

    const displayBrowserAndOSInfo = () => {
        const ua = navigator.userAgent;
        let browserName = 'Unknown', osName = 'Unknown';

        if (/(firefox)\/([-\.\w]+)/i.test(ua)) browserName = 'Firefox';
        else if (/(edg|edge)\/([-\.\w]+)/i.test(ua)) browserName = 'Microsoft Edge';
        else if (/(chrome)\/([-\.\w]+)/i.test(ua)) browserName = 'Chrome';
        else if (/(safari)\/([-\.\w]+)/i.test(ua)) browserName = 'Safari';
        else if (/(opera|opr)\/([-\.\w]+)/i.test(ua)) browserName = 'Opera';

        if (/windows/i.test(ua)) osName = 'Windows';
        else if (/mac/i.test(ua)) osName = 'macOS';
        else if (/android/i.test(ua)) osName = 'Android';
        else if (/(iphone|ipad)/i.test(ua)) osName = 'iOS';
        else if (/linux/i.test(ua)) osName = 'Linux';

        elements.browserInfoSpan.textContent = browserName;
        elements.osInfoSpan.textContent = osName;
    };

    getUserLocation();
    displayBrowserAndOSInfo();

    //Task 3: Web Storage (Greet User)
    const greetUser = () => {
        const storedName = localStorage.getItem('userName');
        const storedCoffee = localStorage.getItem('favoriteCoffee');

        if (storedName && storedCoffee) {
            const greetingText = `Hello, ${storedName}! You Love ${storedCoffee}.`;
            elements.greetingMessage.textContent = greetingText;
            elements.userGreetingSection.classList.remove('hidden');

            alert(greetingText);
        }
    };
    greetUser();

    //Task 1 & 3: Form Validation and Web Storage on Submit
    if (elements.feedbackForm) {
        elements.feedbackForm.addEventListener('submit', (event) => {
            event.preventDefault();
            let isValid = true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Validate Name
            toggleError(elements.userNameInput, elements.nameError, 'Name cannot be empty.', elements.userNameInput.value.trim() === '');
            if (elements.userNameInput.value.trim() === '') isValid = false;

            // Validate Email
            const isEmailValid = emailRegex.test(elements.userEmailInput.value.trim());
            toggleError(elements.userEmailInput, elements.emailError, 'Please enter a valid email address.', !isEmailValid);
            if (!isEmailValid) isValid = false;

            // Validate Favorite Coffee
            toggleError(elements.favoriteCoffeeInput, elements.coffeeError, 'Favorite Coffee cannot be empty.', elements.favoriteCoffeeInput.value.trim() === '');
            if (elements.favoriteCoffeeInput.value.trim() === '') isValid = false;

            if (isValid) {
                localStorage.setItem('userName', elements.userNameInput.value.trim());
                localStorage.setItem('favoriteCoffee', elements.favoriteCoffeeInput.value.trim());
                alert('Feedback submitted successfully! Your preferences have been saved.');
                elements.feedbackForm.reset();
                greetUser();
            }
        });
    }

    //Task 2: Fetch API and Display Coffee Items
    const fetchCoffeeData = async () => {
        elements.loadingMessage.classList.remove('hidden');
        elements.errorMessage.classList.add('hidden');
        elements.coffeeListDiv.innerHTML = '';
        try {
            const response = await fetch('https://api.sampleapis.com/coffee/hot');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            allCoffees = data.slice(0, 8);
            displayCoffees(allCoffees);
        } catch (error) {
            console.error('Error fetching coffee data:', error);
            elements.errorMessage.classList.remove('hidden');
        } finally {
            elements.loadingMessage.classList.add('hidden');
        }
    };

    const displayCoffees = (coffeesToDisplay) => {
        elements.coffeeListDiv.innerHTML = '';
        elements.noResultsMessage.classList.add('hidden');

        if (coffeesToDisplay.length === 0) {
            elements.noResultsMessage.classList.remove('hidden');
            return;
        }

        const fragment = document.createDocumentFragment();
        coffeesToDisplay.forEach(coffee => {
            const coffeeCard = document.createElement('div');
            coffeeCard.className = 'bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-200';
            const ingredientsList = coffee.ingredients ? coffee.ingredients.join(', ') : 'N/A';

            coffeeCard.innerHTML = `
                <img src="${coffee.image}" alt="${coffee.title}" class="w-full h-48 object-cover object-center">
                <div class="p-4">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${coffee.title}</h3>
                    <p class="text-gray-600 text-sm mb-2">${coffee.description}</p>
                    <p class="text-gray-700 text-xs mt-2"><strong>Ingredients:</strong> ${ingredientsList}</p>
                </div>
            `;
            fragment.appendChild(coffeeCard);
        });
        elements.coffeeListDiv.appendChild(fragment);
    };

    //Task 2: Search and Sort Functionality
    const filterAndSortCoffees = () => {
        const searchTerm = elements.searchTermInput.value.toLowerCase().trim();
        const sortOrder = elements.sortOrderSelect.value;

        let filteredCoffees = allCoffees.filter(coffee =>
            coffee.title.toLowerCase().includes(searchTerm)
        );

        if (sortOrder === 'asc') {
            filteredCoffees.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOrder === 'desc') {
            filteredCoffees.sort((a, b) => b.title.localeCompare(a.title));
        }

        displayCoffees(filteredCoffees);
    };

    elements.searchButton.addEventListener('click', filterAndSortCoffees);
    elements.searchTermInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') filterAndSortCoffees();
    });
    elements.sortOrderSelect.addEventListener('change', filterAndSortCoffees);
    fetchCoffeeData();
});