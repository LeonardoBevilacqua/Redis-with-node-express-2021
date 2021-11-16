const express = require('express')
const { engine } = require('express-handlebars');
const path = require('path')
const methodOverride = require('method-override')
const redis = require('redis')

// Create Redis Client
let client = redis.createClient()

client.on('connect', () => {
    console.log('Connected to Redis . . . ')
})

// set port
const PORT = 3000

// init app
const app = express()

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// body-parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// methodOverride
app.use(methodOverride('_method'))

// Search page
app.get('/', (req, res, next) => {
    res.render('searchusers')
})

// Search processing
app.post('/user/search', (req, res, next) => {
    let id = req.body.id

    client.hgetall(id, (err, obj) => {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            })
        } else {
            obj.id = id
            res.render('details', {
                user: obj
            })
        }
    })
})

// Add User page
app.get('/user/add', (req, res, next) => {
    res.render('adduser')
})

// Process Add user page
app.post('/user/add', (req, res, next) => {
    let id = req.body.id
    let first_name = req.body.first_name
    let last_name = req.body.last_name
    let email = req.body.email
    let phone = req.body.phone

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], (err, reply) => {
        if (err) {
            console.log(err)
        }

        console.log(reply)

        res.redirect('/')
    })
})

// Delete user
app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id)
    res.redirect('/')
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))