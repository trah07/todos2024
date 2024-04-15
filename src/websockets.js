import { WebSocketServer } from 'ws';
import ejs from 'ejs';
import { db, getAllTodos, getTodoById } from './db.js';

const connections = new Set();

export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (socket) => {
    connections.add(socket);

    console.log('New connection', connections.size);

    socket.on('close', () => {
      connections.delete(socket);

      console.log('Closed connection', connections.size);
    });
  });
};

export const sendTodoListToAllConnections = async (operation, todoId) => {
  if (operation == 'delete') {
    for (const connection of connections) {
      connection.send(
        JSON.stringify({
          type: 'todoList',
          todoId: todoId,
          html: await ejs.renderFile('views/_todos.ejs', {
            todos: await getAllTodos(),
          }),
          operation: operation,
        })
      );
    }
  } else {
    const todo = await getTodoById(todoId);
    for (const connection of connections) {
      connection.send(
        JSON.stringify({
          type: 'todoList',
          todoId: todo == null ? null : todo.id,
          html: await ejs.renderFile('views/_todos.ejs', {
            todos: await getAllTodos(),
          }),
          detailHtml: todo == null ? null : await ejs.renderFile('views/todo.ejs', { todo }),
          operation: operation
        })
      );
    }
  }    
};

export const sendTodoDetailToAllConnections = async (todoId) => {
  const todo = await getTodoById(todoId);

  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: 'todoDetail',
        todoId: todo.id,
        html: await ejs.renderFile('views/_todos.ejs', {
          todos: await getAllTodos(),
        }),
        detailHtml: await ejs.renderFile('views/todo.ejs', { todo }),
        operation: 'update'
      })
    );
  }
};

export const sendUpdatedTodoDetail = async (todoId) => {
  await sendTodoDetailToAllConnections(todoId);
  
  await sendTodoListToAllConnections('update', todoId);
};

