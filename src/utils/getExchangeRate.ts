const API_KEY = "13b6c16dedcf43cc87badf405004ec14";
const BASE_URL = `https://api.currencyfreaks.com/latest?apikey=${API_KEY}`;

export async function getExchangeRate(toCurrency: string): Promise<number> {
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();

    const rate = data.rates[toCurrency.toUpperCase()];
    if (!rate) throw new Error("Currency not supported");
    
    return parseFloat(rate); // returns the number like 13.45
  } catch (error) {
    console.error("Error getting exchange:", error);
    return 1; // just show 1:1 if anything goes wrong
  }
}
