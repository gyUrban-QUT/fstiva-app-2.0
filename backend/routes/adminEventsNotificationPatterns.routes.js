/**
 * adminEventsNotificationPatterns.routes.js
 *
 * Purpose:
 * This route file connects backend/services/adminEventsNotificationPatterns.js
 * to the Express application.
 *
 * It provides safe endpoints that demonstrate the Observer Pattern and
 * Proxy Pattern without requiring project-specific models at server startup.
 *
 * This avoids CI/CD failures caused by model or middleware filename differences.
 */

const express = require("express");
const router = express.Router();

const {
  UserNotificationObserver,
  EventNotificationSubject,
  detectNotificationRelevantChanges,
  AdminEventSecurityProxy,
} = require("../services/adminEventsNotificationPatterns");

/**
 * Health endpoint.
 * Confirms the Observer and Proxy pattern module is connected to Express.
 */
router.get("/patterns/observer-proxy", (req, res) => {
  return res.status(200).json({
    message: "Observer and Proxy pattern module loaded successfully",
    connectedService: "backend/services/adminEventsNotificationPatterns.js",
    patterns: [
      "Observer Pattern for user notification",
      "Proxy Pattern for admin event security check",
    ],
  });
});

/**
 * Observer Pattern demonstration endpoint.
 *
 * This simulates a booked user being notified when an event changes.
 */
router.post("/patterns/observer-demo", async (req, res) => {
  try {
    const notificationService = {
      async createNotification(notificationData) {
        return {
          saved: true,
          ...notificationData,
        };
      },
    };

    const eventId = req.body.eventId || "demo-event-id";
    const userId = req.body.userId || "demo-user-id";

    const oldEvent = {
      date: "2026-08-01",
      location: "Old location",
      description: "Old description",
    };

    const updatedEvent = {
      date: req.body.date || "2026-08-10",
      location: req.body.location || "Updated location",
      description: req.body.description || "Updated description",
    };

    const changes = detectNotificationRelevantChanges(oldEvent, updatedEvent);

    const subject = new EventNotificationSubject(eventId);
    const observer = new UserNotificationObserver(userId, notificationService);

    subject.subscribe(observer);

    const notifications = await subject.notify(changes);

    return res.status(200).json({
      message: "Observer Pattern demo executed successfully",
      eventId,
      userId,
      changes,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Observer Pattern demo failed",
      error: error.message,
    });
  }
});

/**
 * Proxy Pattern demonstration endpoint.
 *
 * This simulates an admin-only event operation being protected by a proxy.
 */
router.post("/patterns/proxy-demo", async (req, res) => {
  try {
    const realAdminEventService = {
      async createEvent(eventData) {
        return {
          created: true,
          eventData,
        };
      },
    };

    const proxy = new AdminEventSecurityProxy(realAdminEventService);

    const user = req.body.user || {
      id: "demo-admin-id",
      role: "admin",
    };

    const eventData = req.body.eventData || {
      title: "Demo Festival",
      date: "2026-08-01",
      location: "Brisbane",
      description: "Demo event created through Proxy Pattern",
    };

    const result = await proxy.createEvent(user, eventData);

    return res.status(200).json({
      message: "Proxy Pattern demo executed successfully",
      result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: "Proxy Pattern demo failed",
      error: error.message,
    });
  }
});

module.exports = router;
