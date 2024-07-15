const express = require('express')
const router = express.Router()
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')


const User = require('../models/User')

const loginValidator = require('./validators/loginValidator')
const registerValidator = require('./validators/registerValidator')
const { session } = require('passport')

router.get('/', (req, res) => {
    res.render('login')
})
router.get('/register', (req, res) => {
    res.render('admin',{name: '', email: '', password: ''})
})

//LOGIN HANDLE

router.post('/', loginValidator, (req, res) => {
    let result = validationResult(req)
    let errors = []
    //console.log(result)
    if(result.errors.length === 0) {
        let {email, password} = req.body
        let user = undefined
        let role = undefined

        User.findOne({email: email})
        .then(u => {
            if(!u) {
                errors.push({ msg: 'Email không tồn tại'})
            }
            role = u.role
            user = u
            //console.log(user._id)
            return bcrypt.compare(password, u.password)
        })
        .then(passwordMatch => {
            if(!passwordMatch) {
                //return res.status(401).json({code: 3, message: })
                errors.push({ msg: 'Mật khẩu không đúng'})
                return res.render('login',{errors: errors})
            }
            req.session._id = user._id
            req.session.role = user.role
            req.session.name = user.name
            console.log(req.session.email)
            res.redirect('/newfeed')
        })
        .catch(e => {
            //return res.status(401).json({code: 2, message: 'Login thất bại' + e.message})
            return res.render('login',{errors: 'Login thất bại' + e.message})
        })
    }else {
        let messages = result.mapped()
        let message = ''
        for(m in messages) {
            message = messages[m].msg
            break
        }
        errors.push({ msg: message})
        //console.log(errors)
        return res.render('login',{errors: errors})
        //return res.json({code: 1, message: message})
    }
})

//REGISTER HANDLE

router.post('/register', registerValidator, (req, res) => {
    let result = validationResult(req)
    let errors = []
    let {email, password, name, role, falcuty} = req.body
    if(!falcuty) {
        errors.push({msg: 'Please select at least 1 falcuty'})
        return res.render('admin',({errors: errors, name: name, email: email, password: password}))
    }
    else if(!role) {
        errors.push({msg: 'Please select role'})
        return res.render('admin',({errors: errors, name: name, email: email, password: password}))
    }
    tempfalcuty = falcuty.toString()
    console.log(tempfalcuty)
    if (result.errors.length === 0) {
        User.findOne({email: email})
        .then(acc => {
            if (acc) {
                errors.push({msg: 'Tài khoản này đã tồn tại'})
                return res.render('admin',{errors: errors, name: name, email: email, password: password})
            }
        })
        .then(() => bcrypt.hash(password, 10))
        .then(hashed => {

            let user = new User({
                email: email,
                password: hashed,
                name: name,
                falcuty: tempfalcuty,
                role: role
            })
            req.session._id = user._id
            req.session.role = user.role
            req.session.name = user.name
            return user.save();
        })
        .then(() => {
            // không cần trả về chi tiết tài khoản nữa
            //console.log('OKEEE')
            return res.render('admin',{success: 'ok', name: '', email: '', password: ''})
        })
        .catch(e => {
            errors.push({msg: 'Đăng ký tài khoản thất bại: ' + e.message})
            return res.render('admin',{errors: errors, name: name, email: email, password: password})
        })
    }
    else {
        let messages = result.mapped()
        let message = ''
        for (m in messages) {
            message = messages[m].msg
            break
        }
        errors.push({msg: message})
        res.render('admin',{errors: errors, name: name, email: email, password: password})
    }
})
router.get('/logout', (req, res) => {
    req.session.destroy
    return res.redirect('/login')
})
module.exports = router