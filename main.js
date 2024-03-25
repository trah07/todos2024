import express from 'express'
import knex from 'knex'
import knexfile from './knexfile.js'

const app = express()
const db = knex(knexfile)

/** let todos = [
  {
    id: 1,
    title: 'Uvařit si na zítra',
    done: true,
  },
  {
    id: 2,
    title: 'Udělat domácí úkoly',
    done: false,
  },
]
**/

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log('Incomming request', req.method, req.url)
  next()
})

app.get('/', async (req, res) => {
  const todos = await db().select('*').from('todos')

  res.render('index', {
    title: 'Todos',
    todos,
  })
})


app.get('/todo/:id', async (req, res) => {
  const todo = await db('todos').select('*').where('id', req.params.id).first()
  if (!todo) return next()
  res.render('todoDetail', {
    todo,
  })
})


app.post('/priority-todo/:id', async (req, res) => {
  const { priority } = req.body
  const todoId = req.params.id

  await db('todos').update({ priority }).where('id', todoId)

  res.redirect(`/todo/${todoId}`)
})

app.post('/add-todo', async (req, res) => {
  const todo = {
    title: req.body.title,
    done: false,
  }

  await db('todos').insert(todo)

  res.redirect('/')
})

app.post('/edit-todo/:id', async (req, res) => {
  const todo = await db('todos').select('*').where('id', req.params.id).first()
  if (!todo) return next()

  await db('todos').update({ title: req.body.title }).where('id', todo.id)

  res.redirect('back')
})

app.get('/remove-todo/:id', async (req, res) => {
  const todo = await db('todos').select('*').where('id', req.params.id).first()
  if (!todo) return next()

  await db('todos').delete().where('id', todo.id)

  res.redirect('/')
})

app.get('/toggle-todo/:id', async (req, res) => {
  const todo = await db('todos').select('*').where('id', req.params.id).first()

  if (!todo) return next()

  await db('todos').update({ done: !todo.done }).where('id', todo.id)

  res.redirect('back')
})

app.use((req, res) => {
  res.status(404)
  res.send('404 - Page not found')
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500)
  res.send('500 - Server error')
})

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000')
})
