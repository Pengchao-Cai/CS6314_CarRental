var mongoose = require('mongoose'),
Schema = mongoose.Schema,
passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    isAdmin: {type: Boolean, default: false},

    cars:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'cars'
        }
    }
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);