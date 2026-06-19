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
      displayPrice: ["Tickets from: ${event.price}"]
    };
  }
}

module.exports = {
  BaseEventDetails,
  ScheduleDecorator,
  LongDescriptionDecorator,
  PresentationDecorator,
};