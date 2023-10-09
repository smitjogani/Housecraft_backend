const app = require('./app')
const config = require('./config')
const mongoose = require('mongoose')


const dburl = `mongodb+srv://${config.DBUSER}:${config.DBPASSWORD}@${config.DBCLUSTER}${config.DBCOLLECTION}?retryWrites=true`

app.listen({port: config.PORT}, () => console.log('server started at: ' + config.PORT))



mongoose.set('strictQuery', false)
mongoose
 .connect(
    dburl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
 ).then(() => console.log('MongoDB connected!!', dburl))
 .catch((err) => console.log('Failed to connect to DB', err))

 mongoose.syncIndexes().then().catch()

 module.exports = mongoose

 