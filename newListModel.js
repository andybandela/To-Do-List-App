const mongoose = require('mongoose');
const listM = require('./listModel');

const newList = new mongoose.Schema({
    name: String,
    tasks: [listM.schema]
});

module.exports = mongoose.model("Other",newList);