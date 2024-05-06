import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'

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

app.get('/todos', () => <TodoList todos={db}/>)

app.post('/todos/toggle/:id', (req) => {
  const id = req.params.id
  const todo = db.find(todo => todo.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
  return <TodoList todos={db}/>
}, {
  params: t.Object({
    id: t.Numeric()
  })
})

app.delete('/todos/:id', (req) => {
  const id = req.params.id
  db = db.filter(todo => todo.id !== id)
  return <TodoList todos={db}/>
}, {
  params: t.Object({
    id: t.Numeric()
  })
})

app.post('/todos', (req) => {
  const todo = req.body
  db.push({ id: db.length + 1, ...todo, completed: false })
  return <TodoList todos={db}/>
}, {
  body: t.Object({
    content: t.String()
  })
})

app.listen(3000)
console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)

type Todo = {
  id: number
  content: string
  completed: boolean
}

let db = [
  { id: 1, content: 'Buy some milk', completed: false },
  { id: 2, content: 'Go to the gym', completed: true },
  { id: 3, content: 'Learn Elysia', completed: false },
]

const TodoForm = () => {
  return (
    <form
      hx-post='/todos'
      hx-swap='outerHTML'
      hx-target='#TodoList'>
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
        hx-target='#TodoList'
        hx-swap='outerHTML'
      />
      <span class={completed ? 'line-through' : ''}>{content}</span>
      <button
        class="ml-2 text-red-600"
        hx-delete={`/todos/${id}`}
        hx-swap='outerHTML'
        hx-target='#TodoList'
      >Delete</button>
    </div>
  ) 
}

const TodoList = ({ todos }: { todos: Todo[]}) => {
  return (
    <div id='TodoList'>
      {todos.map(todo => <TodoItem {...todo} />)}
      <TodoForm />
    </div>
  )
}
