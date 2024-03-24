const express = require('express')
const Events_Model = require('../models/events')
const country_city_Model = require('../models/country-city')
let passport = require('passport')
let cookieSession = require('cookie-session')
let google = require('passport-google-oauth20')

const app = express.Router()




app.post('/new/event', (req, res) => {
    // console.log(req.body)

    const data = req.body.map(async (e) => {
        if (e._id) {
            
            return await Events_Model.updateOne({_id:e._id},{name:e.name},{upsert:true})
        }
        return await Events_Model.updateOne({ name: e.name }, { name: e.name }, { upsert: true })
    })

    Promise.all(data).then((e) => { res.json(data) })
})



app.post('/delete/event/:id', async (req, res) => {
    const { id } = req.params
    // console.log('id',id)
    const data = await Events_Model.deleteOne({ _id: id })
    // console.log('deleted',data)
    res.json(data)
})

app.get('/events', async (req, res) => {

    const data = await Events_Model.find()
    // console.log('data',data)

    res.json(data)
})

app.post('/countryandcity', async (req, res) => {
    let { city, country, _id } = req.body
    // console.log(city,country,_id)
    let data;
    if (!_id) {
        data=await country_city_Model.updateOne({ country: country }, { country: country,city:city }, { upsert: true })
        
    }
    data = await country_city_Model.updateOne({ _id: _id }, { country: country,city:city })

    res.json(data)
    
})


app.get('/countryandcity', async (req, res) => {
    let data = await country_city_Model.findOne()
    // console.log(data)
    res.json(data)
})

module.exports=app