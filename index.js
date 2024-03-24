const app = require('./routes/main-route')
const express = require('express')
const server = express()
const cors = require('cors')
const { default: mongoose } = require('mongoose')
require('dotenv').config()
let passport = require('passport')
// let cookieSession=require('cookie-session')
let google = require('passport-google-oauth20')
let session = require('express-session')
let mongostore = require('connect-mongo')
const path=require('path')

const Server_Port = process.env.PORT
const Mongo_url = process.env.DB_URL

const clientid = process.env.Client_Id
const client_secret = process.env.Client_Secret
const google_options = {
    clientID: clientid,
    clientSecret: client_secret,
    callbackURL: '/auth/google/redirect',
    proxy:true
}

server.use(cors({
    origin: `${process.env.Front_End}`,
    credentials: true
}))
server.use(express.json())
// server.use(express.static('public'))


// server.use(cookieSession({ // used for identifying our cookies and setting up our cookies in which we will use to store our cookies session data
//     name: 'Events_Session',
//     maxAge: 60000 * 60 * 24,
//     keys: ['haseebkey', 'sabihkey'],
//     secure: 'auto',
//     sameSite: "none",
//     proxy:true// will have to store these keys in .env later

// }))


server.use(session(
    {
        name: 'google-session',
        secret: 'yessss',
        resave: false,
        saveUninitialized: false,
        proxy:true,
        store: mongostore.create({ mongoUrl: 'mongodb+srv://haseebb-sal:haskybeast123@haseebfirstcluster.1v5tosb.mongodb.net/events-jbscode?retryWrites=true&w=majority' }),
        cookie: {
            maxAge: 60000 * 60 * 24,
            // sameSite: 'strict',
            sameSite:'none',
            secure: "auto"

        }

    }
))
passport.use(new google.Strategy(google_options, (accesstoken, refreshtoken, profile, done) => {
    done(null, { profile ,accesstoken})
}))


passport.serializeUser((user, done) => {
    // console.log('Serializing')
    done(null, { email:user.profile._json.email ,accesstoken:user.accesstoken})
})

passport.deserializeUser((user, done) => {
    // console.log('Deserializing')
    done(null, user)
})

server.use(passport.initialize()) // to set the cookies session data to go by default to req.user

server.use(passport.session()) 

server.post('/upload/to/google-calendar', (req, res) => {
    
    const {data_to_upload}=req.body
    let promise_container = []
    for (let j of data_to_upload) {

        const waiting=fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST', body: JSON.stringify({
                'summary': `${j.title}`,
                'description': `${j.description ? j.description : 'No Description'} , the address is ${j.address} , follow the link for time and price info ${j.link} `,
                'start': {
                    'dateTime': `${j.start}`,
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                'end': {
                    'dateTime': `${j.end}`,
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            }), headers: { 'Authorization': `Bearer ya29.a0Ad52N39F86RyLNS0nWC-Kk0102ePIP6rZNfZwULvpiWjK6LzhV93-kmcCRY_u6fdgbckt4Dr7NVZX6srBEOU1075WhEzZBQF9UMNH6utj_OcNfZz2Z44uL1ZXNVeKinu4wK0lJHON8uVO_NIJ21bB6L6vqMVrbtONW0aCgYKAVYSARISFQHGX2MijBAWadktkzSD2F6lbE0PKA0170` }
        })

       

        promise_container.push(waiting)

    }

    Promise.all(promise_container).then(() => {
        res.json('done')
    })

    
})

server.get('/user', (req, res) => {
    console.log(req.user)
    res.json(req.user)
})

server.get('/logout', (req, res) => {
    req.logout()
    res.json('logged out')
})
server.use('/api', app)



server.get('/auth/google/redirect', passport.authenticate('google', {
    failureRedirect: `${process.env.Front_End}/login`,
    successRedirect: `${process.env.Front_End}`,
}))



server.get('/google-signin', passport.authenticate('google', { scope: ['email', 'https://www.googleapis.com/auth/calendar'] }))

server.get("/", (req, res) => {
    // // console.log(__dirname)
    // console.log(path.join(__dirname, 'public', 'index.html'))
    // res.sendFile(path.join(__dirname,'public', 'index.html'))
    res.send('<p>Events Server</p>')

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

