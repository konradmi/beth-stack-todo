import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import * as elements from 'typed-html'

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Elysia</title>
  </head>
  ${children}
</html>
`

const app = new Elysia()

app.use(html())

app.get('/', () => (
  <BaseHtml>
    <body>
      <h1>Hello, Elysia!!!!!!</h1>
    </body>
  </BaseHtml>
))

app.listen(3000)
console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)
