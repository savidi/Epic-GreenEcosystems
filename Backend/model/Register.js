const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const regiSchema = new Schema({
    name:{
        type:String, //datatype
        required:true, //validate
    },
    gmail:{
        type:String,
        required:true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
       type: String,
       required: true,
    },
    password:{
        type:String,
        required:true,
    },


});

module.exports = mongoose.model(
    "Register", //filename
    regiSchema //function name
)