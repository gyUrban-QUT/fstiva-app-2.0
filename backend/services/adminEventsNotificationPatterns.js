/**
 *
 * This file provides backend implementation evidence for:
 *   g. Observer Pattern for user notification
 *   h. Proxy Pattern for security check on admin events
 *
 * The implementation is intentionally dependency-injected so it can be connected
 * to the existing Fstiva backend models without changing the current folder
 * structure. It is designed for a Node.js / Express / Mongoose-style backend.
 */

// -----------------------------------------------------------------------------
// Utility: detect notification-relevant event changes
// -----------------------------------------------------------------------------

function detectNotificationRelevantChanges(oldEvent, updatedEvent) {
  const trackedFields = ["date", "location", "description"];

  return trackedFields
    .filter((field) => String(oldEvent?.[field] ?? "") !== String(updatedEvent?.[field] ?? ""))
    .map((field) => ({
      field,
      oldValue: oldEvent?.[field],
      newValue: updatedEvent?.[field],
    }));
}

function buildEventUpdatedMessage(changeDetails) {
  if (!changeDetails || changeDetails.length === 0) {
    return "An event you booked has been updated.";
  }

  const fieldList = changeDetails.map((change) => change.field).join(", ");
  return `An event you booked has been updated. Changed field(s): ${fieldList}.`;
}

// -----------------------------------------------------------------------------
// g. Observer Pattern for user notification
// -----------------------------------------------------------------------------

class NotificationObserver {
  async update(_eventId, _changeDetails) {
    throw new Error("update() must be implemented by a concrete observer");
  }
}

class UserNotificationObserver extends NotificationObserver {
  constructor(userId, notificationService) {
    super();
    this.userId = userId;
    this.notificationService = notificationService;
  }

  async update(eventId, changeDetails) {
    return this.notificationService.createNotification({
      userId: this.userId,
      eventId,
      type: "EVENT_UPDATED",
      title: "Booked event updated",
      message: buildEventUpdatedMessage(changeDetails),
      changes: changeDetails,
      isRead: false,
      isHidden: false,
      createdAt: new Date(),
    });
  }
}

class EventNotificationSubject {
  constructor(eventId) {
    this.eventId = eventId;
    this.observers = [];
  }

  subscribe(observer) {
    const alreadySubscribed = this.observers.some(
      (existingObserver) => String(existingObserver.userId) === String(observer.userId)
    );

    if (!alreadySubscribed) {
      this.observers.push(observer);
    }
  }

  unsubscribe(userId) {
    this.observers = this.observers.filter(
      (observer) => String(observer.userId) !== String(userId)
    );
  }

  async notify(changeDetails) {
    return Promise.all(
      this.observers.map((observer) => observer.update(this.eventId, changeDetails))
    );
  }
}

class EventNotificationCoordinator {
  constructor({ bookingRepository, notificationService }) {
    this.bookingRepository = bookingRepository;
    this.notificationService = notificationService;
  }

  async notifyBookedUsers(eventId, changeDetails) {
    if (!changeDetails || changeDetails.length === 0) {
      return [];
    }

    const activeBookings = await this.bookingRepository.findActiveBookingsByEventId(eventId);
    const subject = new EventNotificationSubject(eventId);

    activeBookings.forEach((booking) => {
      subject.subscribe(
        new UserNotificationObserver(booking.userId, this.notificationService)
      );
    });

    return subject.notify(changeDetails);
  }

  async notifyBookedUsersOfCancellation(eventId) {
    const activeBookings = await this.bookingRepository.findActiveBookingsByEventId(eventId);

    return Promise.all(
      activeBookings.map((booking) =>
        this.notificationService.createNotification({
          userId: booking.userId,
          eventId,
          type: "EVENT_CANCELLED",
          title: "Booked event cancelled",
          message:
            "An event you booked has been cancelled and your booking has been automatically cancelled.",
          isRead: false,
          isHidden: false,
          createdAt: new Date(),
        })
      )
    );
  }
}

// -----------------------------------------------------------------------------
// Notification service supporting frontend UX
// -----------------------------------------------------------------------------

class BuiltInNotificationService {
  constructor(NotificationModel) {
    this.NotificationModel = NotificationModel;
  }

  async createNotification(notificationData) {
    return this.NotificationModel.create(notificationData);
  }

  async getVisibleNotificationsForUser(userId) {
    return this.NotificationModel.find({ userId, isHidden: false }).sort({ createdAt: -1 });
  }

  async getUnreadCountForUser(userId) {
    return this.NotificationModel.countDocuments({
      userId,
      isRead: false,
      isHidden: false,
    });
  }

  async markAsRead(notificationId, userId) {
    return this.NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  async hideNotification(notificationId, userId) {
    return this.NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isHidden: true, isRead: true },
      { new: true }
    );
  }
}

// -----------------------------------------------------------------------------
// h. Proxy Pattern for security check on admin events
// -----------------------------------------------------------------------------

class AdminEventService {
  constructor({ eventRepository, bookingRepository, notificationCoordinator }) {
    this.eventRepository = eventRepository;
    this.bookingRepository = bookingRepository;
    this.notificationCoordinator = notificationCoordinator;
  }

  async createEvent(eventData) {
    return this.eventRepository.create(eventData);
  }

  async updateEvent(eventId, updatedData) {
    const oldEvent = await this.eventRepository.findById(eventId);

    if (!oldEvent) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    const updatedEvent = await this.eventRepository.updateById(eventId, updatedData);
    const changes = detectNotificationRelevantChanges(oldEvent, updatedEvent);

    if (changes.length > 0) {
      await this.notificationCoordinator.notifyBookedUsers(eventId, changes);
    }

    return updatedEvent;
  }

  async cancelEvent(eventId) {
    const existingEvent = await this.eventRepository.findById(eventId);

    if (!existingEvent) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    const cancelledEvent = await this.eventRepository.updateById(eventId, {
      status: "cancelled",
    });

    await this.notificationCoordinator.notifyBookedUsersOfCancellation(eventId);
    await this.bookingRepository.cancelActiveBookingsForEvent(eventId);

    return cancelledEvent;
  }
}

class AdminEventSecurityProxy {
  constructor(realAdminEventService) {
    this.realAdminEventService = realAdminEventService;
  }

  assertAdminAccess(user) {
    if (!user) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    if (user.role !== "admin") {
      const error = new Error("Access denied. Admin privileges required.");
      error.statusCode = 403;
      throw error;
    }
  }

  async createEvent(user, eventData) {
    this.assertAdminAccess(user);
    return this.realAdminEventService.createEvent(eventData);
  }

  async updateEvent(user, eventId, updatedData) {
    this.assertAdminAccess(user);
    return this.realAdminEventService.updateEvent(eventId, updatedData);
  }

  async cancelEvent(user, eventId) {
    this.assertAdminAccess(user);
    return this.realAdminEventService.cancelEvent(eventId);
  }
}

// -----------------------------------------------------------------------------
// Mongoose-style repository adapters
// -----------------------------------------------------------------------------

function createEventRepository(EventModel) {
  return {
    create: (eventData) => EventModel.create(eventData),
    findById: (eventId) => EventModel.findById(eventId),
    updateById: (eventId, updatedData) =>
      EventModel.findByIdAndUpdate(eventId, updatedData, { new: true }),
  };
}

function createBookingRepository(BookingModel) {
  return {
    findActiveBookingsByEventId: (eventId) =>
      BookingModel.find({ eventId, status: "active" }),
    cancelActiveBookingsForEvent: (eventId) =>
      BookingModel.updateMany({ eventId, status: "active" }, { status: "cancelled" }),
  };
}

// -----------------------------------------------------------------------------
// Optional Express controller factories
// -----------------------------------------------------------------------------

function createAdminEventController(adminEventProxy) {
  return {
    async createEvent(req, res) {
      try {
        const event = await adminEventProxy.createEvent(req.user, req.body);
        return res.status(201).json({ message: "Event created successfully", event });
      } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
      }
    },

    async updateEvent(req, res) {
      try {
        const event = await adminEventProxy.updateEvent(req.user, req.params.id, req.body);
        return res.status(200).json({ message: "Event updated successfully", event });
      } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
      }
    },

    async cancelEvent(req, res) {
      try {
        const event = await adminEventProxy.cancelEvent(req.user, req.params.id);
        return res.status(200).json({ message: "Event cancelled successfully", event });
      } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
      }
    },
  };
}

function createNotificationController(notificationService) {
  return {
    async getNotifications(req, res) {
      try {
        const userId = req.user.id || req.user._id;
        const notifications = await notificationService.getVisibleNotificationsForUser(userId);
        const unreadCount = await notificationService.getUnreadCountForUser(userId);
        return res.status(200).json({ unreadCount, notifications });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    },

    async markAsRead(req, res) {
      try {
        const userId = req.user.id || req.user._id;
        const notification = await notificationService.markAsRead(req.params.id, userId);
        return res.status(200).json(notification);
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    },

    async hideNotification(req, res) {
      try {
        const userId = req.user.id || req.user._id;
        const notification = await notificationService.hideNotification(req.params.id, userId);
        return res.status(200).json(notification);
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    },
  };
}

// -----------------------------------------------------------------------------
// Composition helper
// -----------------------------------------------------------------------------

function buildAdminEventPatternModule({ EventModel, BookingModel, NotificationModel }) {
  const eventRepository = createEventRepository(EventModel);
  const bookingRepository = createBookingRepository(BookingModel);
  const notificationService = new BuiltInNotificationService(NotificationModel);

  const notificationCoordinator = new EventNotificationCoordinator({
    bookingRepository,
    notificationService,
  });

  const adminEventService = new AdminEventService({
    eventRepository,
    bookingRepository,
    notificationCoordinator,
  });

  const adminEventProxy = new AdminEventSecurityProxy(adminEventService);

  return {
    adminEventProxy,
    notificationService,
    adminEventController: createAdminEventController(adminEventProxy),
    notificationController: createNotificationController(notificationService),
  };
}

module.exports = {
  NotificationObserver,
  UserNotificationObserver,
  EventNotificationSubject,
  EventNotificationCoordinator,
  BuiltInNotificationService,
  detectNotificationRelevantChanges,
  AdminEventService,
  AdminEventSecurityProxy,
  createEventRepository,
  createBookingRepository,
  createAdminEventController,
  createNotificationController,
  buildAdminEventPatternModule,
};
