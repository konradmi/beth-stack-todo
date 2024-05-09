import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'
import { eq } from 'drizzle-orm'

import { db } from './db'
import type { Todo } from './db/schema'
import { todos } from './db/schema'

const BaseHtml = (props: Html.PropsWithChildren) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>TODO App</title>
          <script src="https://unpkg.com/htmx.org@1.9.12" integrity="sha384-ujb1lZYygJmzgSwoxRggbCHcjc0rB2XoQrxeTUQyRjrOnlCoYta87iKBWq3EsdM2" crossorigin="anonymous"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
        </head>
        <body class="flex w-full h-screen justify-center items-center">
          {props.children}
        </body>
      </html>
    </>
  );
}

const app = new Elysia()

app.use(html())

app.get('/', () => (
  <BaseHtml>
    <body
      hx-get='/todos'
      hx-trigger='load'
      hx-swap='innerHTML'>
      <button class="text-blue-600" hx-post="/clicked" hx-swap='outerHTML'>Click me</button>
    </body>
  </BaseHtml>
))

app.post('/clicked', () => <div>I'm from the server!!!!</div>)

app.get('/todos', async () => {
  const data = await db.select().from(todos).all()
  return <TodoList todos={data}/>
})

app.post('/todos/toggle/:id', async (req) => {
  const id = req.params.id
  const oldTodo = await db.select().from(todos).where(eq(todos.id, id)).get()
  const newTodo = await db.update(todos).set({ completed: !oldTodo!.completed }).where(eq(todos.id, id)).returning().get()

  
  return <TodoItem {...newTodo} />
}, {
  params: t.Object({
    id: t.Numeric()
  })
})

app.delete('/todos/:id', async (req) => {
  const id = req.params.id
  await db.delete(todos).where(eq(todos.id, id)).run()
}, {
  params: t.Object({
    id: t.Numeric()
  })
})

app.post('/todos', async (req) => {
  const todo = req.body
  const newTodo = await db.insert(todos).values(todo).returning().get()

  return <TodoItem {...newTodo} />
}, {
  body: t.Object({
    content: t.String()
  })
})

app.listen(3000)
console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)

const TodoForm = () => {
  return (
    <form
      hx-post='/todos'
      hx-swap='beforebegin'
      _='on submit target.reset()'>
      <input type="text" name="content" class="mr-2 border-2 border-black"/>
      <button type="submit" class="text-blue-600">Add</button>
    </form>
  )
}

const TodoItem = ({ id, content, completed }: Todo) => {
  return (
    <div class="flex items-center">
      <input
        type="checkbox"
        checked={completed}
        class="mr-2"
        hx-post={`/todos/toggle/${id}`}
        hx-target='closest div'
        hx-swap='outerHTML'
      />
      <span class={completed ? 'line-through' : ''}>{content}</span>
      <button
        class="ml-2 text-red-600"
        hx-delete={`/todos/${id}`}
        hx-swap='outerHTML'
        hx-target='closest div'
      >Delete</button>
    </div>
  ) 
}

const TodoList = ({ todos }: { todos: Todo[]}) => {
  return (
    <div>
      {todos.map(todo => <TodoItem {...todo} />)}
      <TodoForm />
    </div>
  )
}
