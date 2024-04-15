import express from 'express'
import { db, getAllTodos, getTodoById } from './src/db.js'
import { createWebSocketServer, sendTodoListToAllConnections } from './src/websockets.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log('Incomming request', req.method, req.url)
  next()
})

app.get('/', async (req, res) => {
  const todos = await getAllTodos()

  res.render('index', {
    title: 'Todos',
    todos,
  })
})

app.get('/todo/:id', async (req, res, next) => {
  const todo = await getTodoById(req.params.id)

  if (!todo) return next()

  res.render('todo', {
    todo,
  })
})

app.post('/add-todo', async (req, res) => {
  const todo = {
    title: req.body.title,
    done: false,
  }

  await db('todos').insert(todo)

  res.redirect('/')
})

app.post('/update-todo/:id', async (req, res, next) => {
  const todo = await getTodoById(req.params.id)

  if (!todo) return next()

  const query = db('todos').where('id', todo.id)

  if (req.body.title) query.update({ title: req.body.title })
  if (req.body.priority) query.update({ priority: req.body.priority })

  await query

  res.redirect('back')
})

app.get('/remove-todo/:id', async (req, res) => {
  const todo = await getTodoById(req.params.id)

  if (!todo) return next()

  await db('todos').delete().where('id', todo.id)

  sendTodoListToAllConnections()

  res.redirect('/')
})

app.get('/toggle-todo/:id', async (req, res, next) => {
  const todo = await getTodoById(req.params.id)

  if (!todo) return next()

  await db('todos').update({ done: !todo.done }).where('id', todo.id)

  sendTodoListToAllConnections()

  res.redirect('back')
})

app.use((req, res) => {
  res.status(404)
  res.send('404 - Stránka nenalezena')
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500)
  res.send('500 - Chyba na straně serveru')
})

app.locals.translatePriority = (priority) => {
  switch (priority) {
    case 'low':
      return 'nízká'
    case 'normal':
      return 'normální'
    case 'high':
      return 'vysoká'
    default:
      return 'neznámá'
  }
}

const server = app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000')
})

createWebSocketServer(server)
