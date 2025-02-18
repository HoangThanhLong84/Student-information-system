const express = require('express')
const { Result } = require('express-validator')
const { isValidObjectId } = require('mongoose')
const bcrypt = require('bcrypt')
const router = express.Router()

const Posts = require('../models/Posts')
const User = require('../models/User')
const Comments = require('../models/Comments')
const Notifications = require('../models/Notifications')
const { response } = require('express')



router.get('/', (req, res) => {
    if(!req.session._id) {
        res.redirect('/login')
    }
    else{
        post = undefined
        comment = undefined
        user = undefined
        Posts.find((err, data) => {
            if(err) console.log(err)
            post = data
        })
        Comments.find((err, data) => {
            if(err) console.log(err)
            comment = data
        })
        User.findOne({_id: req.session._id})
        .then(u => {
            user = u
            //console.log(user)
        })
        Notifications.find()
        .then(data => {
            return res.render('newfeed',{user: user, posts: post, comments: comment, notifs: data})
        })
        
        .catch(e => console.log(e))
    }
})
router.get('/timeline/:name', (req, res) => {
    if(!req.session._id) {
        return res.redirect('/login')
    }
    if(!req.params.name) {
        return res.json({code: 1, message: 'Invalid name'})
    }
    console.log(req.params)
    let post = undefined
    let user = undefined
    let comment = undefined
    let notif = undefined
    Posts.find((err, data) => {
        if(err) console.log(err)
        post = data
    })
    Comments.find((err, data) => {
        if(err) console.log(err)
        comment = data
    })
    Notifications.find((err, data) => {
        if(err) console.log(err)
        notif = data
    })
    User.findOne({_id: req.session._id})
    .then(data => {
        user = data
    })
    User.findOne({name: req.params.name})
    .then(data => {
        return res.render('targetpost',{posts: post, target: data, user: user, comments: comment, notifs: notif})
    })
})
router.get('/allNotif', (req, res) => {
    if(!req.session._id) {
        res.redirect('/login')
    }
    let user = undefined
    User.findOne({_id: req.session._id})
    .then(u => {
        Notifications.find()
        .then(data => {
            res.render('tatcathongbao',{user: u, notifs: data})
        })
    })
    .catch(e => console.log(e))
})
router.get('/allNotif/:id', (req, res) => {
    if(!req.params.id) {
        return res.json({code: 1, message: 'Invalid ID'})
    }
    if(!req.session._id) {
        return res.redirect('/login')
    }
    let user = undefined
    User.findOne({_id: req.session._id})
    .then(data => {user = data})
    Notifications.findOne({_id: req.params.id})
    .then(data => {
        return res.render('chitietthongbao',{Notif: data, user: user})
    })
    .catch(e => {
        return res.json({code: 1, message: e.message})
    })
})
router.post('/create', (req, res) => {
    if(!req.body.postcontent) {
        res.send('Write something u noob')
    }
    else{
        const post = new Posts({
            content: req.body.postcontent,
            Owner: req.session.name
        })
        post.save()
            .then(data => {
                //res.json(data)
                res.send(data)
            })
            .catch(err => {
                res.json({message: err})
            })
        }
})
router.post('/updateAccount', (req, res) => {
    if(!req.session._id) {
        return res.redirect('login')
    }
    let name = req.body.name
    let lop = req.body.class
    let falcuty = req.body.falcuty
    let avatar = req.body.avatar
    //console.log(req.body)
    User.findByIdAndUpdate({_id: req.session._id}, {$set: {
        name: name,
        class: lop,
        falcuty: falcuty,
        avatar: avatar
    }})
    .then(data => console.log(data))
    return res.json({code: 0, message: 'Updated'})
})
router.post('/postComment', (req, res) => {
    if(req.session._id) {
        if(!req.body.comment || !req.body.postId) {
            return res.render('newfeed',{errors: 'Input comment first', user: u, posts: post, comments: comment, notifs: notif})
        }
        let comment = req.body.comment
        let postId = req.body.postId
        // let user = undefined
        // console.log(req.body)
        User.findOne({_id: req.session._id})
        .then(u => {
            user = u
        })
        //console.log(user)
        Posts.findOne({_id: postId})
        .then(p => {
            if(!p) res.send('PostID NOT Valid')
            let comment = new Comments({
                content: req.body.comment,
                Owner: user.name,
                PostId: postId
            })
            return comment.save();
        })
        .then(data => {
            return res.send(data)
        })
    } else {
        return res.redirect('/login')
    }
})
router.post('/createNotification', (req, res) => {
    if(req.session._id) {
        if(!req.body.title || !req.body.content) {
            return res.render('newfeed',{errors: 'Input comment first', user: u, posts: post, comments: comment, notifs: notif})
        }
        let user = undefined
        User.findOne({_id: req.session._id})
        .then(u => {user = u})
        .then(() => {
            let Noti = new Notifications({
                falcuty: req.body.falcuty,
                title: req.body.title,
                content: req.body.content,
                Owner: user.name
                }
            )
            return Noti.save()
        })
        .catch(e => res.json({code: 1, message: e}))
    } else {
        res.redirect('/login')
    }
})
router.post('/delete/:id', (req, res) => {
    if(!req.session._id) {
        return res.redirect('login')
    }
    if(!req.params.id) {
        return res.json({code: 1, message: 'Invalid ID'})
    }
    Posts.findOneAndDelete({_id: req.params.id})
    .then(data => {
        res.send(data)
        Comments.find({PostId: data._id})
        .then(data =>console.log(data))
    })
})
router.post('/update/:id', (req, res) => {
    if(!req.session._id) {
        return res.redirect('login')
    }
    if(!req.params.id) {
        return res.json({code: 1, message: 'Invalid ID'})
    }
    let content = req.body.updatecontent
    let current = new Date().getTime()
    //console.log(req.body)
    // Posts.findOne({_id: req.params.id})
    // .then(data => {
    //     data.overwrite({content: content, createAt: current})
    // })
    Posts.findByIdAndUpdate({_id: req.params.id}, {$set: {
        content: content,
        createAt: current
    }})
    .then(data => {
        return res.send(data)
    })
})
router.post('/commentdelete/:id', (req, res) => {
    if(!req.params.id) {
        return res.json({code: 1, message: 'Invalid ID'})
    }
    console.log(req.params.id)
    Comments.findOneAndDelete({_id: req.params.id})
    .then(data => {
        console.log(data)
    })
    return res.json({code: 0, message: 'OK'})
})
router.post('/allNotif/:id/delete', (req, res) => {
    if(!req.session._id) {
        return res.redirect('login')
    }
    if(!req.params.id) {
        return res.json({code: 1, message: 'Invalid ID'})
    }
    Notifications.findOneAndDelete({_id: req.params.id})
    .then(data => {
        console.log(data)
    })
    return res.json({code: 0, message: 'OK'})
})
router.post('/allNotif/:id/update', (req, res) => {
    if(!req.session._id) {
        return res.redirect('login')
    }
    let {id, content, title, falcuty} = req.body
    console.log(req.body)
    if(!id || !content || !title || !falcuty) {
        return res.json({code: 1, message: 'Nothing was commit'})
    }
    //console.log(req.body)
    Notifications.findByIdAndUpdate({_id: id}, {$set: {
        title: title,
        content: content,
        falcuty: falcuty
    }})
    .then(data => {
        return res.send(req.body)
    })
})
router.post('/falcutyUpdate', (req, res) => {
    if(!req.session._id) {
        return res.redirect('login')
    }
    let {password, newpassword} = req.body
    let user = undefined
    let role = undefined
    //console.log(req.body)
    User.findOne({_id: req.session._id})
    .then(data => {
        return bcrypt.compare(password, data.password)
    })
    .then(passwordMatch => {
        if(passwordMatch != true) {
            res.redirect('/login')
        }
        return bcrypt.hash(newpassword, 10)
    })
    .then(hashed => {
        //console.log(hashed)
        User.findByIdAndUpdate({_id: req.session._id}, {$set: {
            password: hashed
        }})
        .then(data => {
            //console.log(data)
            return res.json({code: 0, message: 'Updated ' + data})
        })
    })
})
module.exports = router