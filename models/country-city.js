const mongo = require('mongoose')

const event_schema = new mongo.Schema({
    country: {
        type: Object,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required:true
        
    }
})

const country_city_model = mongo.model('country_city', event_schema)

module.exports = country_city_model