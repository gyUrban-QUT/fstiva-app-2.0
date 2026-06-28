/**
 * adminEventsNotificationPatterns.routes.js
 *
 * Upload this file to:
 *   backend/routes/adminEventsNotificationPatterns.routes.js
 *
 * Purpose:
 *   This route file makes backend/services/adminEventsNotificationPatterns.js
 *   ACTUALLY CALLED by the Express application.
 *
 * It wires the Observer Pattern and Proxy Pattern module into API endpoints:
 *   - admin event create/update/cancel flows pass through AdminEventSecurityProxy
 *   - event updates trigger Observer-based notifications for booked users
 *   - frontend can read unread notification count and hide/read notifications
 *
 * IMPORTANT:
 *   This file assumes Mongoose-style models and an auth middleware that sets req.user.
 *   If your model filenames differ, update the requireModel() candidate lists below.
 */

const express = require("express");
const router = express.Router();

const {
  buildAdminEventPatternModule,
} = require("../services/adminEventsNotificationPatterns");

function requireFirstAvailable(paths, label) {
  for (const modelPath of paths) {
    try {
      return require(modelPath);
    } catch (error) {
      // Try the next candidate path.
    }
  }

  throw new Error(
    `${label} could not be loaded. Update backend/routes/adminEventsNotificationPatterns.routes.js with the correct model path.`
  );
}

const authMiddleware = requireFirstAvailable(
  [
    "../middleware/authMiddleware",
    "../middleware/auth",
    "../middleware/authenticate",
    "../middleware/verifyToken",
  ],
  "Authentication middleware"
);

const EventModel = requireFirstAvailable(
  [
    "../models/Event",
    "../models/event",
    "../models/events",
    "../models/eventModel",
    "../models/EventModel",
  ],
  "Event model"
);

// Your project may call bookings UserEvent, userEvent, Booking, etc.
const BookingModel = requireFirstAvailable(
  [
    "../models/Booking",
    "../models/booking",
    "../models/UserEvent",
    "../models/userEvent",
    "../models/userEvents",
    "../models/UserEvents",
    "../models/userEventModel",
    "../models/UserEventModel",
  ],
  "Booking/UserEvent model"
);

const NotificationModel = requireFirstAvailable(
  [
    "../models/Notification",
    "../models/notification",
    "../models/notifications",
    "../models/NotificationModel",
    "../models/notificationModel",
  ],
  "Notification model"
);

const { adminEventController, notificationController } =
  buildAdminEventPatternModule({
    EventModel,
    BookingModel,
    NotificationModel,
  });

// -----------------------------------------------------------------------------
// Admin event routes using Proxy Pattern
// -----------------------------------------------------------------------------

router.post(
  "/pattern-admin/events",
  authMiddleware,
  adminEventController.createEvent
);

router.put(
  "/pattern-admin/events/:id",
  authMiddleware,
  adminEventController.updateEvent
);

router.delete(
  "/pattern-admin/events/:id",
  authMiddleware,
  adminEventController.cancelEvent
);

// -----------------------------------------------------------------------------
// User notification routes using Observer-generated notifications
// -----------------------------------------------------------------------------

router.get(
  "/notifications",
  authMiddleware,
  notificationController.getNotifications
);

router.patch(
  "/notifications/:id/read",
  authMiddleware,
  notificationController.markAsRead
);

router.patch(
  "/notifications/:id/hide",
  authMiddleware,
  notificationController.hideNotification
);

module.exports = router;
