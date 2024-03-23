const mongo = require('mongoose')

const event_schema = new mongo.Schema({
    name: {
        type: String,
        required: true,
        unique:true
    }
})

const events_model=mongo.model('events',event_schema)

module.exports=events_model