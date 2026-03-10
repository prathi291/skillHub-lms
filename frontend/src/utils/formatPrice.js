/**
 * formatPrice – converts a numeric USD course price to a formatted INR string.
 *
 * Strategy:
 *  - Multiply the stored USD price by 83 (approximate USD→INR rate).
 *  - Round to the nearest ₹50 for clean display values.
 *  - Format using the Indian number system (en-IN locale) with ₹ symbol.
 *
 * Examples:
 *   formatPrice(94.99)  →  "₹7,900"
 *   formatPrice(64.99)  →  "₹5,400"
 *   formatPrice(15)     →  "₹1,250"
 *   formatPrice(0)      →  "Free"
 */
const USD_TO_INR = 83;

export const formatPrice = (usdPrice) => {
    if (!usdPrice || usdPrice === 0) return 'Free';

    const inr = Math.round((usdPrice * USD_TO_INR) / 50) * 50; // round to nearest ₹50

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,   // no decimal places (₹7,900 not ₹7,900.00)
        minimumFractionDigits: 0,
    }).format(inr);
};

/**
 * formatOriginalPrice – formats a fixed INR original price (crossed-out MRP).
 * Used for the "was ₹X" display in the enrollment card.
 */
export const formatOriginalPrice = (inrPrice) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(inrPrice);
};
