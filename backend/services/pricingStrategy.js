const UserTransactions = require('../models/UserTransactions');
const Event = require('../models/Event');
const Fun = require('../utils/functions.js');

/**
 * LIFO Refund Price Calculator
 * Processes transactions chronologically to track available slots correctly
 */
const calculateLIFORefundPrices = async (userEventObjRef, qtyToCancel) => {
    const transactions = await UserTransactions.find({ userEventObjRef })
        .sort({ transactiondate: 1 })
        .lean();

    let availableSlots = [];
    
    for (const tx of transactions) {
        if (tx.transactiontype === 'B') {
            const qty = Math.abs(parseInt(tx.transactionqty));
            const price = parseFloat(tx.price);
            for (let i = 0; i < qty; i++) {
                availableSlots.push({ price, date: tx.transactiondate });
            }
        } else if (tx.transactiontype === 'C') {
            const qty = Math.abs(parseInt(tx.transactionqty));
            for (let i = 0; i < qty && availableSlots.length > 0; i++) {
                availableSlots.pop();
            }
        }
    }
    
    const pricesToRefund = [];
    for (let i = 0; i < qtyToCancel && availableSlots.length > 0; i++) {
        pricesToRefund.push(availableSlots.pop().price);
    }
    
    const totalRefund = pricesToRefund.reduce((sum, p) => sum + p, 0);
    return { prices: pricesToRefund, totalRefund };
};

// Strategy Interface (base class)
class PricingStrategy {
    async calculate(context) {
        throw new Error('calculate() must be implemented');
    }
}

// Concrete Strategy: Increase Quantity
class IncreaseAmountStrategy extends PricingStrategy {
    constructor() {
        super();
        this.type = 'increase';
    }

    async calculate({ eventId, qtyDiff }) {
        const eventDet = await Event.findById(eventId);
        const transactionPrice = Fun.numericPrice(eventDet.price);
        
        return {
            transactionPrice,
            transactionType: 'B',
            paymentType: 'default'
        };
    }
}

// Concrete Strategy: Decrease Quantity (LIFO Refund)
class DecreaseAmountStrategy extends PricingStrategy {
    constructor() {
        super();
        this.type = 'decrease';
    }

    async calculate({ userEventObjRef, qtyDiff }) {
        const qtyToCancel = Math.abs(qtyDiff);
        const { totalRefund } = await calculateLIFORefundPrices(userEventObjRef, qtyToCancel);
        const transactionPrice = totalRefund / qtyToCancel;
        
        return {
            transactionPrice,
            transactionType: 'C',
            paymentType: 'NA'
        };
    }
}

// Concrete Strategy: Early Bird Pricing (30% discount applied)
class EarlyBirdPricingStrategy extends PricingStrategy {
    constructor() {
        super();
        this.type = 'earlybird';
        this.discountRate = 0.30; // 30% discount
    }

    async calculate({ eventId, qtyDiff }) {
        const eventDet = await Event.findById(eventId);
        const basePrice = Fun.numericPrice(eventDet.price);
        const transactionPrice = basePrice * (1 - this.discountRate);

        return {
            transactionPrice: parseFloat(transactionPrice.toFixed(2)),
            transactionType: 'B',
            paymentType: 'earlybird'
        };
    }
}

// Concrete Strategy: Last Minute Pricing (20% surcharge applied)
class LastMinutePricingStrategy extends PricingStrategy {
    constructor() {
        super();
        this.type = 'lastminute';
        this.surchargeRate = 0.20; // 20% surcharge
    }

    async calculate({ eventId, qtyDiff }) {
        const eventDet = await Event.findById(eventId);
        const basePrice = Fun.numericPrice(eventDet.price);
        const transactionPrice = basePrice * (1 + this.surchargeRate);

        return {
            transactionPrice: parseFloat(transactionPrice.toFixed(2)),
            transactionType: 'B',
            paymentType: 'lastminute'
        };
    }
}

// Factory to select the correct strategy
class PricingStrategyFactory {
    constructor() {
        this.strategies = {
            increase: new IncreaseAmountStrategy(),
            decrease: new DecreaseAmountStrategy(),
            earlybird: new EarlyBirdPricingStrategy(),
            lastminute: new LastMinutePricingStrategy()
        };
    }

    getStrategy(qtyDiff, pricingType = null) {
        // If a specific pricing type is provided, use it
        if (pricingType && this.strategies[pricingType]) {
            return this.strategies[pricingType];
        }
        // Otherwise fall back to increase/decrease based on quantity
        const type = qtyDiff > 0 ? 'increase' : 'decrease';
        const strategy = this.strategies[type];
        if (!strategy) {
            throw new Error(`Unrecognised update action for qtyDiff: ${qtyDiff}`);
        }
        return strategy;
    }
}

// Singleton instance
const pricingFactory = new PricingStrategyFactory();

module.exports = { 
    pricingFactory,
    PricingStrategyFactory,
    IncreaseAmountStrategy,
    DecreaseAmountStrategy,
    EarlyBirdPricingStrategy,
    LastMinutePricingStrategy
};