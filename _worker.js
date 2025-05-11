import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { serveStatic } from 'hono/cloudflare-pages'
import { app } from './app'

const hono = new Hono()

// Serve static files
hono.use('/static/*', serveStatic({ root: './' }))

// Handle all other routes through Flask
hono.all('*', async (c) => {
  const response = await app.handle(c.req.raw)
  return response
})

export default handle(hono) 