const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
const NotiSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    Owner: {
        type: String,
        require: true
    },
    falcuty: {
        type: String,
        require: true
    }

})
NotiSchema.plugin(findOrCreate);
const Notifications = mongoose.model('Notifications', NotiSchema)
module.exports = Notifications
