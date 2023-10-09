const mongoose = require('mongoose')
const Schema = mongoose.Schema
const AdminDB = require('../admin.model')


const adminAuthLog = new mongoose.Schema({
    adminId: { type: Schema.Types.ObjectId, required: true},
    ipAddress: { type: String, required: true, ref: AdminDB}
}, { timestamps: true})

module.exports = mongoose.model('AdminAuthLog', adminAuthLog)