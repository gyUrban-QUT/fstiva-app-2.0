class BaseEventDetails {
  constructor(event) {
    this.event = event;
  }

  build() {
    return {
      id: this.event._id,
      title: this.event.title,
      date: this.event.date,
      location: this.event.location,
      description: this.event.description,
      price: this.event.price,
      imagekey: this.event.imagekey,
    };
  }
}

class EventDetailsDecorator {
  constructor(component) {
    this.component = component;
  }

  build() {
    return this.component.build();
  }
}

class ScheduleDecorator extends EventDetailsDecorator {
  constructor(component, eventDetail) {
    super(component);
    this.eventDetail = eventDetail;
  }

  build() {
    return {
      ...super.build(),
      schedule: this.eventDetail?.schedule || 'Schedule not available',
    };
  }
}

class LongDescriptionDecorator extends EventDetailsDecorator {
  constructor(component, eventDetail) {
    super(component);
    this.eventDetail = eventDetail;
  }

  build() {
    return {
      ...super.build(),
      descriptionDetail:
        this.eventDetail?.descriptionDetail || 'No extra details available',
    };
  }
}

class PresentationDecorator extends EventDetailsDecorator {
  build() {
    const event = super.build();

    return {
      ...event,
      imageUrl: `/images/${event.imagekey}.png`,
      displayPrice: ["Tickets from: "+ event.price]
    };
  }
}

// FA2-11: check if user has event booked
class BookingStatusDecorator extends EventDetailsDecorator {
  constructor(component, bookedEventIds) {
    super(component);
    // Pass a Set of IDs for O(1) fast lookups
    this.bookedEventIds = bookedEventIds || new Set(); 
  }

  build() {
    const event = super.build();
    
    return {
      ...event,
      // Convert ID to string to ensure matching works seamlessly
      isBooked: this.bookedEventIds.has(event.id.toString()), 
    };
  }
}

module.exports = {
  BaseEventDetails,
  ScheduleDecorator,
  LongDescriptionDecorator,
  PresentationDecorator,
  BookingStatusDecorator,
};