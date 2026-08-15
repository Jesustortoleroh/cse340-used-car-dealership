import { createNotification } from './notifications.js';

/**
 * Notify user when a vehicle they favorited drops in price
 */
const notifyPriceDrop = async (userId, vehicleId, vehicleName, oldPrice, newPrice) => {
    await createNotification(
        userId,
        'price_drop',
        `💰 Price Drop: ${vehicleName}`,
        `The price of ${vehicleName} has dropped from $${oldPrice.toLocaleString()} to $${newPrice.toLocaleString()}!`,
        `/vehicles/${vehicleId}`
    );
};

/**
 * Notify user when their service request status changes
 */
const notifyServiceUpdate = async (userId, requestId, status, vehicleName) => {
    await createNotification(
        userId,
        'service_update',
        `🔧 Service Update: ${vehicleName}`,
        `Your service request for ${vehicleName} is now "${status}".`,
        `/service-requests/${requestId}`
    );
};

/**
 * Notify user when a new vehicle is added to their favorite category
 */
const notifyNewVehicleInCategory = async (userId, vehicleId, vehicleName, categoryName) => {
    await createNotification(
        userId,
        'new_vehicle',
        `🚗 New Vehicle: ${vehicleName}`,
        `A new ${categoryName} has been added to our inventory: ${vehicleName}`,
        `/vehicles/${vehicleId}`
    );
};

/**
 * Notify user when they receive a response to their inquiry
 */
const notifyInquiryResponse = async (userId, inquiryId, subject) => {
    await createNotification(
        userId,
        'inquiry_response',
        `📧 Inquiry Update: ${subject}`,
        `Your inquiry about "${subject}" has received a response from our team.`,
        `/contact/${inquiryId}`
    );
};

/**
 * Welcome notification for new users
 */
const notifyWelcome = async (userId, name) => {
    await createNotification(
        userId,
        'system',
        `👋 Welcome to the Dealership!`,
        `Welcome ${name}! Start browsing our vehicles and save your favorites.`,
        '/vehicles'
    );
};

/**
 * Notify user when a review gets a helpful vote
 */
const notifyReviewHelpful = async (userId, reviewId, vehicleName) => {
    await createNotification(
        userId,
        'review_helpful',
        `👍 Your review was helpful!`,
        `Someone found your review of ${vehicleName} helpful.`,
        `/vehicles/${reviewId}`
    );
};

export {
    notifyPriceDrop,
    notifyServiceUpdate,
    notifyNewVehicleInCategory,
    notifyInquiryResponse,
    notifyWelcome,
    notifyReviewHelpful
};