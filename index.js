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
const path = require('path')
const helmet = require('helmet')
const fs = require('fs')
const https=require('https')

const Server_Port = process.env.PORT
const Mongo_url = process.env.DB_URL

const clientid = process.env.Client_Id
const client_secret = process.env.Client_Secret
const google_options = {
    clientID: clientid,
    clientSecret: client_secret,
    callbackURL: `/auth/google`,
    // proxy:true
}

server.use(cors({
    origin: [`${process.env.Front_End}`,`${process.env.Backend}`],
    credentials: true
}))
server.use(helmet())
server.use(express.json())

server.use(session(
    {
        name: 'events_session',
        secret: 'ejfnejnfjkwenjfnwenfnwekfnweknfejwfnk',
        resave: false,
        saveUninitialized: false,
        // proxy:true,
        store: mongostore.create({ mongoUrl: 'mongodb+srv://haseebb-sal:haskybeast123@haseebfirstcluster.1v5tosb.mongodb.net/events-jbscode?retryWrites=true&w=majority' }),
        cookie: {
            maxAge: 60000 * 60 * 24,
            // sameSite: 'strict',
            // sameSite:'none',
            // secure: "auto"

        }

    }
))
passport.use(new google.Strategy(google_options, (accesstoken, refreshtoken, profile, done) => {
    done(null, { profile ,accesstoken})
}))


passport.serializeUser((user, done) => {
    done(null, { email:user.profile._json.email ,accesstoken:user.accesstoken,id:user.profile.id})
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

server.use(passport.initialize()) // to set the cookies session data to go by default to req.user

server.use(passport.session()) 

server.get('/auth/google', passport.authenticate('google', {
    failureRedirect: `${process.env.Front_End}/login`,
    successRedirect: `${process.env.Front_End}`,
    // session:false
}))



server.get('/google-signin', passport.authenticate('google', { scope: ['email'] }))

server.get("/", (req, res) => {
    res.send('<p>Events Server</p>')
});

server.get('/user', (req, res) => {
    console.log('im here')
    console.log(req.user)
    res.json(req.user)
})

server.use((req, res,next) => {
    if (req.user) {
        next()
        return
    }
    res.json({message:'UnAuthorized'}).status(400)
})


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
            }), headers: { 'Authorization': `Bearer ${req.user.accesstoken}` }
        })

       

        promise_container.push(waiting)

    }

    Promise.all(promise_container).then(() => {
        res.json('done')
    })

    
})


server.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return  }
        res.json('done')
    });
    res.json('logged out')
})
server.use('/api', app)


const httpsServer = https.createServer({
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem')
},server)




mongoose.connection.on('connected', () => {
    console.log("Database Connected")
})



async function connect() {
    await mongoose.connect(Mongo_url)
    httpsServer.listen(Server_Port, () => {
        console.log(`server started on port ${Server_Port}`)
    })
}
connect()

