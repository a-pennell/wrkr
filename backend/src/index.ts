import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import workspaceRoutes from './routes/workspace.js'
import proposalRoutes from './routes/proposals.js'
import demoRoutes from './routes/demo.js'

const fastify = Fastify({ logger: true })
const PORT = Number(process.env.PORT) || 3000

fastify.register(cors, { origin: true })

fastify.get('/health', async () => ({ status: 'ok' }))
fastify.register(workspaceRoutes)
fastify.register(proposalRoutes)
fastify.register(demoRoutes)

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
