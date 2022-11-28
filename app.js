const express = require('express')

const app = express()

const mongoose = require('mongoose')

const dotenv = require('dotenv')

dotenv.config({path: './config.env'})

const userRoute = require('./routes/userRoutes')

app.use(express.json())

app.use('/api/v1/users', userRoute)




const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DBPASS)


mongoose.connect(DB).then(() => {
    console.log('DB Success');
})



app.listen(process.env.EXPRESS_PORT||3000, ()=> {
    console.log('listening to port 3000');
})