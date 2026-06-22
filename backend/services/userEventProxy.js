class UserEventProxy {
    constructor(userId, token) {
        this.userId = userId;
        this.cache = null;
        this.cacheTime = null;
    }

    // Proxy method - adds caching behavior
    async getUserEvents() {
        if (this.cache && Date.now() - this.cacheTime < 30000) {
            console.log('Returning cached events');
            return this.cache;
        }
        
        // Delegate to real subject
        const events = await fetchFormattedUserEvents(this.userId);
        this.cache = events;
        this.cacheTime = Date.now();
        return events;
    }
}