const exchangeRates = {
    DOP: 1,
    USD: 0.017,
    EUR: 0.016
};

function formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(amount);
}

function updatePrices(currency) {
    const priceElements = document.querySelectorAll('.price');
    
    priceElements.forEach(priceElement => {
        const basePrice = parseFloat(priceElement.dataset.basePrice);
        const convertedPrice = basePrice * exchangeRates[currency];
        
        const currencySymbolElement = priceElement.querySelector('.currency-symbol');
        const priceValueElement = priceElement.querySelector('.price-value');
        
        const formattedPrice = formatCurrency(convertedPrice, currency);
        const [symbol, value] = formattedPrice.split(/\s*(\d)/);
        
        currencySymbolElement.textContent = symbol;
        priceValueElement.textContent = value;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const currencySelector = document.querySelector('.currency-selector');
    if (currencySelector) {
        currencySelector.addEventListener('change', (e) => {
            updatePrices(e.target.value);
        });
        
        // Inicializar con la moneda por defecto (DOP)
        updatePrices('DOP');
    }
}); 