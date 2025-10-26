// Tasas de conversión (estas deberían actualizarse periódicamente con una API real)
const exchangeRates = {
    DOP: 1,
    USD: 0.0175, // 1 DOP = 0.0175 USD
    EUR: 0.016   // 1 DOP = 0.016 EUR
};

const currencySymbols = {
    DOP: 'RD$',
    USD: '$',
    EUR: '€'
};

// Función para formatear números según la moneda
function formatNumber(number, currency) {
    const options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };
    
    return number.toLocaleString('en-US', options);
}

// Función para actualizar los precios
function updatePrices(currency) {
    const priceElements = document.querySelectorAll('.price');
    
    priceElements.forEach(priceEl => {
        const basePrice = parseFloat(priceEl.dataset.basePrice);
        const convertedPrice = basePrice * exchangeRates[currency];
        
        const currencySymbolEl = priceEl.querySelector('.currency-symbol');
        const priceValueEl = priceEl.querySelector('.price-value');
        
        currencySymbolEl.textContent = currencySymbols[currency];
        priceValueEl.textContent = formatNumber(convertedPrice);
    });
}

// Detectar el país del usuario y establecer la moneda por defecto
async function detectUserCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Mapeo de países a monedas
        const countryCurrencyMap = {
            'DO': 'DOP',
            'US': 'USD',
            // Agregar más países de la UE según sea necesario
            'ES': 'EUR',
            'FR': 'EUR',
            'DE': 'EUR'
        };
        
        const userCurrency = countryCurrencyMap[data.country] || 'DOP';
        const currencySelector = document.querySelector('#currency-selector');
        currencySelector.value = userCurrency;
        updatePrices(userCurrency);
    } catch (error) {
        console.error('Error detectando el país:', error);
        // Usar DOP como moneda por defecto si hay un error
        updatePrices('DOP');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const currencySelector = document.querySelector('#currency-selector');
    
    currencySelector.addEventListener('change', (e) => {
        updatePrices(e.target.value);
    });
    
    // Detectar el país del usuario al cargar la página
    detectUserCountry();
}); 