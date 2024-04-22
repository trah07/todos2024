import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { db } from '../src/db.js'

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test('it renders a list of todos', async (t) => {
    const response = await supertest(app).get('/')

    t.assert(response.text.includes('<h1>Todos</h1>'))
})


test.serial('create new todo', async (t) => {
    const text = 'test todo'

    await db('todos').insert({ title: text })

    const response = await supertest(app).get('/')
    
    t.assert(response.text.includes(text))
})

test.serial('create new todo', async (t) => {
    const response = await supertest(app)
    .post('/add-todo')
    .type('form')
    .send({ title: "Název"})
    .redirects(1)

    t.assert(response.text.includes('Název'))
})