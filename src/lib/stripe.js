// frontend/src/lib/stripe.js
import 'server-only';
import Stripe from 'stripe';

// ✅ Use a getter function to ensure the library loads correctly in Server Components
export const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set');
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Export a default instance for client-side consistency if needed
export const stripe = getStripe();

export const PLAN_PRICE_ID = {
    'seeker_pro': 'price_1TqtFkRxtr6U9N3znjQM7cMk',
    'seeker_premium': 'price_1TqtGPRxtr6U9N3zAF36sDXF',
    'recruiter_growth': 'price_1TqtHTRxtr6U9N3zeqsfffJb',
    'recruiter_enterprise': 'price_1TqtHtRxtr6U9N3z6iBww92u',
};