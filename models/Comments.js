const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
const CommentsSchema = new mongoose.Schema({
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
    PostId: {
        type: String,
        require: true
    }
})
CommentsSchema.plugin(findOrCreate);
const Comments = mongoose.model('Comments', CommentsSchema)
module.exports = Comments
