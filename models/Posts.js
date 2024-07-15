const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
const PostsSchema = new mongoose.Schema({
    content: {
        type: String,
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    Likes: {
        type: String,
        default: 0
    },
    Owner: {
        type: String,
        require: true
    }
})
PostsSchema.plugin(findOrCreate);
const Posts = mongoose.model('Posts', PostsSchema)
module.exports = Posts
