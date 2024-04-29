const app = require('./routes/main-route')
const express = require('express')
const server = express()
const cors = require('cors')
const { default: mongoose } = require('mongoose')
require('dotenv').config()
// let passport = require('passport')
// let cookieSession=require('cookie-session')
// let google = require('passport-google-oauth20')
// let session = require('express-session')
// let mongostore = require('connect-mongo')
const path = require('path')
const helmet = require('helmet')
const eventsmodel = require('./models/events')
const axios=require('axios')
// const { Readable } = require('stream')


const Server_Port = process.env.PORT
const Mongo_url = process.env.DB_URL

// const clientid = process.env.Client_Id
// const client_secret = process.env.Client_Secret
// const google_options = {
//     clientID: clientid,
//     clientSecret: client_secret,
//     callbackURL: '/auth/google',
//     proxy:true
// }
// https://event-server-five.vercel.app/auth/google
// server.enable('trust proxy')
server.use(cors({

    origin:'*'
}
))
// const moesif = require('moesif-nodejs');

// 2. Set the options, the only required field is applicationId
// const moesifMiddleware = moesif({
//     applicationId: 'eyJhcHAiOiI0OTM6NTgxIiwidmVyIjoiMi4xIiwib3JnIjoiNTczOjQ1MyIsImlhdCI6MTcxMTkyOTYwMH0.NaA3l2u6o1FLAMoqzy9DbQV5RGvhuImLvKh14acj7HI',

//     // Optional hook to link API calls to users
//     identifyUser: function (req, res) {
//         return req.user ? req.user.id : undefined;
//     },
// });

// 3. Enable the Moesif middleware to start logging incoming API Calls

server.use(helmet(
    {
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'", "kit.fontawesome.com", "'unsafe-inline'", "'unsafe-eval'","https://*"],
                // "style-src": null,
                "base-uri":["'self'","https://*"],
                "default-src": ["kit.fontawesome.com", "'self'", 'ka-f.fontawesome.com', 'https://*'],
                "img-src": ['s3.amazonaws.com', "'self'", 'https://*','data:']
            },
        },
    }
))
server.use(express.json())

// console.log(process.env.front_end)

// server.use(cookieSession({ // used for identifying our cookies and setting up our cookies in which we will use to store our cookies session data
//     name: 'cookie_events_session',
//     maxAge: 60000 * 60 * 24,
//     sameSite: 'none',
//     // secure: "auto",
//     secure:true,
//     keys:['hawdwdwdsddwwdbdwdwddkdedywdwdwdwdwdwdww'] // will have to store these keys in .env later

// }))
// server.use(session(
//     {
//         name: 'events_session',
//         secret: 'ejfnejnfjkwenjfnwenfnwekfnweknfejwfnk',
//         resave: false,
//         saveUninitialized: false,
//         proxy: true,
//         store: mongostore.create({ mongoUrl: 'mongodb+srv://haseebb-sal:haskybeast123@haseebfirstcluster.1v5tosb.mongodb.net/events-jbscode?retryWrites=true&w=majority' }),
//         cookie: {
//             maxAge: 60000 * 60 * 24,
//             // sameSite: 'strict',
//             // sameSite:'none',
//             secure: "auto"

//         }

//     }
// ))
// server.use(moesifMiddleware);
// passport.use(new google.Strategy(google_options, (accesstoken, refreshtoken, profile, done) => {
//     done(null, { profile ,accesstoken})
// }))


// passport.serializeUser((user, done) => {
//     done(null, { email:user.profile._json.email ,accesstoken:user.accesstoken,id:user.profile.id})
// })

// passport.deserializeUser((user, done) => {
//     done(null, user)
// })

// server.use(passport.initialize()) // to set the cookies session data to go by default to req.user

// server.use(passport.session()) 

// server.get('/auth/google', passport.authenticate('google', {
//     failureRedirect: `http://localhost:3003/login`,
//     successRedirect: `http://localhost:3003`,
//     // session:false
// }))



// server.get('/google-signin', passport.authenticate('google', {
//     scope: ['email', 'https://www.googleapis.com/auth/calendar'], accessType: 'offline', approvalPrompt: 'force'}))

server.get("/", (req, res) => {
    // console.log(req.query.url)
    res.send(`<p>Events Server</p>`)
});


server.get('/user', (req, res) => {
    // console.log('im here')
    console.log(req.user)
    res.json(req.user)
})

// server.use((req, res,next) => {
//     if (req.user) {
//         next()
//         return
//     }
//     res.json({message:'UnAuthorized'}).status(400)
// })

server.post('/scrap/events', async (req, res) => {
    // const session = await getServerSession(authOptions)
    // console.log(session)
    const { location_data, latitude, longitude,id } = req.body
    // const id = session.user.id
    // console.log('scrape events', id)
    // await mongoose.connect(process.env.MONGO_URL)
    // const countryAndCityData = await countryAndcitymodel.findOne({ id })
    const eventsData = await eventsmodel.find({ id })
    let data_to_upload = []
    const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    async function checkDataCorrect(data, url, count = 0) {
        if (data.rows.length == 0) {
            if (count == 4) {
                return null
            }
            const checkAgain = await axios.get(url)
            return await checkDataCorrect(checkAgain.data, url, count + 1)
        }
        return data
    }
    const fetchingEventsPromise = new Promise(async (resolve, reject) => {
        const runLoopData = eventsData.length == 0 ? [{ name: '' }] : eventsData
        for (let j of location_data) {
            for (let x of runLoopData) {

                const options = {
                    method: 'GET',
                    url: 'https://api.scrape-it.cloud/scrape/google/events',
                    params: { q: `${x.name} Events in ${j}`, location: `${j}`, gl: 'us', hl: 'en' },
                    headers: { 'x-api-key': `${process.env.SCRAPEIT_API_KEY}` }
                }

                let actualData;
                try {
                    const { data } = await axios.request(options)
                    actualData = data
                }
                catch (e) {
                    continue
                }

                if (!actualData.eventsResults) {
                    continue
                }
                else {

                    for (let j of actualData.eventsResults) {
                        let duration= ''
                        let distance= ''
                        const checkIfAlreadyExist = data_to_upload.find((uploaded) => uploaded.title == j.title)
                        if (checkIfAlreadyExist) {
                            continue
                        }
                        const addressDestination = j.address.join(' ').replaceAll(' ', '%20')
                        const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${addressDestination}&origins=${latitude}%2C${longitude}&key=${process.env.GOOGLE_API_KEY}`
                        let checkingDistance = await axios.get(distanceUrl)
                        checkingDistance = await checkDataCorrect(checkingDistance.data, distanceUrl)
                        if (!checkingDistance) {
                            continue
                        }
                        const durationParent = checkingDistance.rows[0].elements[0]
                        if (durationParent.status == 'OK') {
                            const time_in_minutes = (durationParent.duration.value) / 60
                            if (time_in_minutes > 30) {
                                continue
                            }
                            duration = durationParent.duration.text
                            distance = durationParent.distance.text
                        }
                        else {
                            continue
                        }

                        const e = j.date.when
                        const datesFound = []
                        const currentYear = new Date().getFullYear()
                        const splittedData = e.split(' ')
                        for (let u = 0; u < splittedData.length; u++) {
                            for (let p of Months) {
                                if (splittedData[u] == p) {
                                    datesFound.push(splittedData[u])
                                    datesFound.push(splittedData[u + 1].replaceAll(',', ''))
                                }
                            }
                        }
                        let endDateYear = currentYear;
                        let endMonth = Months.indexOf(datesFound[0])
                        let endDay = parseInt(datesFound[1])
                        const indexOfStartMonth = Months.indexOf(datesFound[0])
                        const indexOfStartDay = parseInt(datesFound[1])

                        if (datesFound.length > 2) {
                            const indexOfEndMonth = Months.indexOf(datesFound[2])
                            endMonth = indexOfEndMonth
                            endDay = datesFound[3]
                            endDateYear = indexOfEndMonth < indexOfStartMonth ? currentYear + 1 : currentYear

                        }
                        const startDate = new Date(currentYear, indexOfStartMonth, indexOfStartDay).toISOString()
                        const endDate = new Date(endDateYear, endMonth, endDay).toISOString()
                        data_to_upload.push({ title: j.title, description: j.description, address: j.address.join(' '), start: startDate, end: endDate, link: j.link, duration, distance })
                    }

                }
            }
        }
        console.log(data_to_upload)
        if (data_to_upload.length == 0) {
            reject('reject')
        }
        else {
            resolve('done')
        }
    }
    );

    try {
        await Promise.all([fetchingEventsPromise])
        res.json({ msg: 'Events Exists', data: data_to_upload })
    }
    catch (e) {
        console.log(e)
        res.json({ msg: 'No Events Exists' })
    }
})


server.post('/upload/calendar', async (req, res) => {
    // req.b
    // const token = await getToken({ req })
    // const { accessToken } = token!
    const { data_to_upload,accessToken } = req.body
    // console.log('from calendar',data_to_upload)
    let promise_container = []
    for (let j of data_to_upload) {

        const waiting = fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST', body: JSON.stringify({
                'summary': `${j.title}`,
                'location': `${j.address}`,
                'source': { 'title': `${j.title}`, 'url': `${j.link}` },
                'description': `${j.description ? j.description : 'No Description'} , the distance is ${j.distance} and duration is ${j.duration}`,
                'start': {
                    'dateTime': `${j.start}`,
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                'end': {
                    'dateTime': `${j.end}`,
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            }), headers: { 'Authorization': `Bearer ${accessToken}` }
        })

        promise_container.push(waiting)

    }
    try {
        const uploadingToCalendar = await Promise.all(promise_container)
        console.log('done uploading to calendar')
        res.json({ msg: 'Done Uploading', accessToken })

    }
    catch (e) {
        console.log(e)
        console.log('failed to upload')
        res.json({ msg: 'failed to upload', accessToken })
    }
    
})


// server.get('/logout', (req, res) => {
//     req.logout(function (err) {
//         if (err) { return  }
//         res.json('done')
//     });
//     res.json('logged out')
// })
// server.use('/api', app)


// const httpsServer = https.createServer(server)




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

