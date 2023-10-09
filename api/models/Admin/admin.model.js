const mongoose =  require('mongoose')
const { FLAG } = require('../../helper/enums')

const AdminSchema = new mongoose.Schema(
    {
        name: {type: String, require:true},
        email: {type: String, require: true},
        password: {type: String, require:true},
        flag: {type: Number, enum: FLAG.value, default: FLAG.default},
        type: { type: String, default: 'Admin'},
    },
    { timestamps: true}
)

AdminSchema.index({email: -1})
module.exports =  mongoose.model('Admin', AdminSchema)

