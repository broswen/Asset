const Event = require("../models/Event");
const User = require("../models/User");

class EventService {

    constructor() { }

    async createEvent(eventType, objectType, objectId) {
        const e = new Event({ date: new Date(), eventType, objectType, objectId })
        //insert into mongodb
        const newEvent = await e.save();
        //return user with id
        return newEvent;
    }

    async getEvents(page, amount = 25, eventType, objectType, startDate, endDate) {
        let filter = {};
        if (eventType) filter.eventType = eventType;
        if (objectType) filter.objectType = objectType;
        if (startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            filter.date = { $gte: startDate };
        } else if (endDate) {
            filter.date = { $lte: endDate };
        }

        const events = await Event.find(filter)
            .sort({ date: 'desc' })
            .skip(page * amount)
            .limit(amount).exec();
        return events;
    }
}

module.exports = EventService;