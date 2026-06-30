// Strategy Interface (base class)
class PaymentStrategy {
    async process(context) {
        throw new Error('process() must be implemented');
    }
}

// Concrete Strategy: Card Payment
class CardPaymentStrategy extends PaymentStrategy {
    constructor() {
        super();
        this.type = 'card';
    }
    async process({ price }) {
        // Mock processing - simulate a successful card payment
        return {
            success: true,
            paymentType: this.type,
            transactionPrice: price
        };
    }
}


// Concrete Strategy: PayPal Payment
class PayPalPaymentStrategy extends PaymentStrategy {
    constructor() {
        super();
        this.type = 'paypal';
    }
    async process({ price }) {
        // Mock processing - simulate a successful PayPal payment
        return {
            success: true,
            paymentType: this.type,
            transactionPrice: price
        };
    }
}


// Factory to select the correct payment strategy
class PaymentStrategyFactory {
    constructor() {
        this.strategies = {
            card: new CardPaymentStrategy(),
            paypal: new PayPalPaymentStrategy()
        };
    }
    getStrategy(paymentType) {
        const strategy = this.strategies[paymentType];
        if (!strategy) {
            throw new Error(`Unsupported payment type: ${paymentType}`);
        }
        return strategy;
    }
}

// Singleton instance
const paymentFactory = new PaymentStrategyFactory();

module.exports = {
    paymentFactory,
    PaymentStrategyFactory,
    CardPaymentStrategy,
    PayPalPaymentStrategy
};