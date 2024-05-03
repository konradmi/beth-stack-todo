import { Elysia } from 'elysia'
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
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}

const app = new Elysia()

app.use(html())

app.get('/', () => (
  <BaseHtml>
    <body>
      <button hx-post="/clicked" hx-swap='outerHTML'>Click me</button>
    </body>
  </BaseHtml>
))

app.post('/clicked', () => <div>I'm from the server!!!!</div>)

app.listen(3000)
console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)
