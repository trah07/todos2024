import express from 'express'

const app = express()

let todos = [
  {
    id: 1,
    title: 'Zajít na pivo',
    done: true,
  },
  {
    id: 2,
    title: 'Vrátit se z hospody',
    done: false,
  },
]

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log('Incomming request', req.method, req.url)
  next()
})

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Todos',
    todos,
  })
})

app.get('/todo/:id', (req, res, next) => {
  const todo = todos.find((todo) => {
    return todo.id === Number(req.params.id)
  })

  if (!todo) return next()

  res.render('todo', {
    todo,
  })
})

app.post('/add-todo', (req, res) => {
  const todo = {
    id: todos.length + 1,
    title: req.body.title,
    done: false,
  }

  todos.push(todo)

  res.redirect('/')
})

app.post('/update-todo/:id', (req, res, next) => {
  const todo = todos.find((todo) => {
    return todo.id === Number(req.params.id)
  })

  if (!todo) return next()

  todo.title = req.body.title

  res.redirect('back')
})

app.get('/remove-todo/:id', (req, res) => {
  todos = todos.filter((todo) => {
    return todo.id !== Number(req.params.id)
  })

  res.redirect('/')
})

app.get('/toggle-todo/:id', (req, res, next) => {
  const todo = todos.find((todo) => {
    return todo.id === Number(req.params.id)
  })

  if (!todo) return next()

  todo.done = !todo.done

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

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000')
})
