const mongo = require('mongoose')

const eventsSchema = new mongo.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }

})

const eventsmodel = mongo.model('events', eventsSchema)

module.exports=eventsmodel