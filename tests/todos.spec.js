import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import { db } from "../src/db.js"

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial("it renders a list of todos", async (t) => {
  const response = await supertest.agent(app).get("/")

  t.assert(response.text.includes("<h1>Todos</h1>"))
})

test.serial("create new todo", async (t) => {
  await db("todos").insert({
    title: "Moje todo",
  })

  const response = await supertest.agent(app).get("/")

  t.assert(response.text.includes("Moje todo"))
})

test.serial("create new todo via form", async (t) => {
  const response = await supertest
    .agent(app)
    .post("/add-todo")
    .type("form")
    .send({ title: "Nějaký název" })
    .redirects(1)

  t.assert(response.text.includes("Nějaký název"))
})

// **************************************** DOMÁCÍ ÚKOL č.8 ****************************************

test.serial("check if todo is done", async (t) => {
  let response = await supertest(app)
    .post("/add-todo")
    .type("form")
    .send({ title: "Nějaký název" })
    .redirects(1);

  t.assert(response.text.includes("Nějaký název"));

  const todos = await db("todos").select('id', 'done').where({ title: "Nějaký název" });
  
  const newTodoId = todos[0].id;

  response = await supertest(app)
    .get(`/toggle-todo/${newTodoId}`);

  const toggledTodo = await db("todos").where("id", newTodoId).first();
  t.true(toggledTodo.done === true || toggledTodo.done === 1, "Todo by mělo být 'hotovo'");
  response = await supertest(app).get(`/`);
  t.assert(response.text.includes("hotovo"), "Todo úkol by měl být hotový");
});

test.serial('update todo details', async (t) => {
  const [todoIdObj] = await db('todos').insert({
    title: 'test todo detailu',
    priority: 'normal',
    done: false
  }).returning('id');
  
  const todoId = todoIdObj.id;
  await supertest(app)
    .post(`/update-todo/${todoId}`)
    .type('form')
    .send({
      title: 'updated test todo detailu',
      priority: 'high'
    })
    .redirects(1);
  const updatedTodo = await db('todos').where('id', todoId).first();
  t.is(updatedTodo.title, 'updated test todo detailu', 'Todo title by měl být aktualizovaný');
  t.is(updatedTodo.priority, 'high', 'Todo priorita by měla být aktualizovaná');
});

test.serial('create and delete todo item', async (t) => {
  let response = await supertest(app)
    .post("/add-todo")
    .type("form")
    .send({ title: "todo na smazani" })
    .redirects(1);

  t.assert(response.text.includes("todo na smazani"), "todo by mělo být přidaný na seznamu");

  const todos = await db("todos").select('id', 'done').where({ title: "todo na smazani" });
  const newTodoId = todos[0].id;

  response = await supertest(app)
    .get(`/remove-todo/${newTodoId}`)
    .redirects(1);

  const deletedTodo = await db("todos").where('id', newTodoId).first();
  t.is(deletedTodo, undefined, "Todo by mělo být smazaný z db");

  response = await supertest(app).get("/");
  t.assert(!response.text.includes("todo na smazani"), "smazaný todo by neměl být na seznamu");
});

test.serial('view todo details', async (t) => {
  let response = await supertest(app)
    .post("/add-todo")
    .type("form")
    .send({ title: "details todo", priority: "normal" })
    .redirects(1);

  t.assert(response.text.includes("details todo"), "todo by mělo být přidaný na seznamu");

  const todo = await db("todos").select('id').where({ title: "details todo" }).first();
  const todoId = todo.id;

  response = await supertest(app)
    .get(`/todo/${todoId}`);
  
  t.assert(response.text.includes("details todo"), "detail todočka by měla obsahovat stejný název");
  t.assert(response.text.includes("normal"), "detail todočka by měla mít stejnou prioritu");
});

test.serial('error handling for non-existent todo', async (t) => {
  let response = await supertest(app)
    .get("/todo/9999");

  t.is(response.status, 404, "mělo by vracet 404 pro nenalezený todočko");
  t.assert(response.text.includes("404 - Stránka nenalezena"), "měl by se objevit text '404 - Stránka nenalezena'");
});