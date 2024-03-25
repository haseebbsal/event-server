const express = require('express')
const Events_Model = require('../models/events')
const country_city_Model = require('../models/country-city')
let passport = require('passport')
let cookieSession = require('cookie-session')
let google = require('passport-google-oauth20')

const app = express.Router()




app.post('/new/event', (req, res) => {
    const { dataToUpload ,id} =req.body

    const data = dataToUpload.map(async (e) => {
        if (e._id) {
            
            return await Events_Model.updateOne({_id:e._id,id:id},{name:e.name},{upsert:true})
        }
        return await Events_Model.updateOne({ name:e.name}, { name: e.name,id:id }, { upsert: true })
    })

    Promise.all(data).then((e) => { res.json(data) })
})



app.post('/delete/event/:id/:userid', async (req, res) => {
    const { id ,userid} = req.params
    // console.log('id',id)
    const data = await Events_Model.deleteOne({ _id: id ,id:userid})
    // console.log('deleted',data)
    res.json(data)
})

app.post('/events', async (req, res) => {

    const {id}=req.body

    const data = await Events_Model.find({id:id})
    // console.log('data',data)

    res.json(data)
})

app.post('/countryandcity/upload', async (req, res) => {
    let { city, country, _id, id } = req.body
    console.log(city,country,_id,id)
    // console.log(city,country,_id)
    let data;
    if (!_id) {
        data=await country_city_Model.updateOne({ id:id }, { country: country,city:city }, { upsert: true })
        
    }
    data = await country_city_Model.updateOne({ id:id }, { country: country,city:city })

    res.json(data)
    
})


app.post('/countryandcity', async (req, res) => {
    const {id}=req.body
    let data = await country_city_Model.findOne({id:id})
    // console.log(data)
    res.json(data)
})

module.exports=app