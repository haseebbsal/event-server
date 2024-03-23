const app = require('./routes/main-route')
const express = require('express')
const server = express()
const cors = require('cors')
const { default: mongoose } = require('mongoose')
require('dotenv').config()
let passport = require('passport')
let cookieSession=require('cookie-session')
let google = require('passport-google-oauth20')
const path=require('path')

const Server_Port = process.env.PORT
const Mongo_url = process.env.DB_URL

const clientid = process.env.Client_Id
const client_secret = process.env.Client_Secret
const google_options = {
    clientID: clientid,
    clientSecret: client_secret,
    callbackURL: 'http://localhost:4080/auth/google/redirect'
}

server.use(cors())
server.use(express.json())
server.use(express.static('public'))


server.use(cookieSession({ // used for identifying our cookies and setting up our cookies in which we will use to store our cookies session data
    name: 'Events_Session',
    maxAge: 60000 * 60 * 24,
    keys:['haseebkey','sabihkey'] // will have to store these keys in .env later

}))

passport.use(new google.Strategy(google_options, (accesstoken, refreshtoken, profile, done) => {
    done(null, { profile ,accesstoken})
}))


passport.serializeUser((user, done) => {
    console.log('Serializing')
    done(null, { email:user.profile._json.email ,accesstoken:user.accesstoken})
})

passport.deserializeUser((user, done) => {
    console.log('Deserializing')
    done(null, user)
})

server.use(passport.initialize()) // to set the cookies session data to go by default to req.user

server.use(passport.session()) 



server.get('/user',(req, res) => {
    res.json(req.user)
})

server.get('/logout', (req, res) => {
    req.session=null
    res.json('logged out')
})
server.use('/api', app)


// server.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))

// });

server.get('/auth/google/redirect', passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/',
}))





server.get('/logout', (req, res) => {
    req.logOut()
    res.send('<p>Logout Page</p>')
})

server.get('/google-signin', passport.authenticate('google', { scope: ['email'] }))

server.get("/*", (req, res) => {
    // console.log(__dirname)
    console.log(path.join(__dirname, 'public', 'index.html'))
    res.sendFile(path.join(__dirname,'public', 'index.html'))

});






mongoose.connection.on('connected', () => {
    console.log("Database Connected")
})


async function connect() {
    await mongoose.connect(Mongo_url)
    server.listen(Server_Port, () => {
        console.log(`server started on port ${Server_Port}`)
    })
}

connect()

