import type { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'

interface CreateBody {
  category: string
  templateFields: Record<string, string>
  thresholdType: string
  thresholdValue: number
  deadlineDays: number
}

const proposalRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /proposals/:id
  fastify.get<{ Params: { id: string } }>('/proposals/:id', async (request, reply) => {
    const { id } = request.params
    const sessionId = request.headers['x-session-id'] as string | undefined

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        _count: { select: { commitments: { where: { withdrawnAt: null } } } }
      }
    })
    if (!proposal) return reply.code(404).send({ error: 'Not found' })

    let userCommitted = false
    if (sessionId) {
      const existing = await prisma.commitment.findFirst({
        where: { proposalId: id, tokenHash: sessionId, withdrawnAt: null }
      })
      userCommitted = !!existing
    }

    return {
      id: proposal.id,
      category: proposal.category,
      templateFields: proposal.templateFields,
      thresholdType: proposal.thresholdType,
      thresholdValue: proposal.thresholdValue,
      deadline: proposal.deadline,
      status: proposal.status,
      activatedAt: proposal.activatedAt,
      createdAt: proposal.createdAt,
      commitmentCount: proposal._count.commitments,
      userCommitted,
    }
  })

  // POST /proposals
  fastify.post<{ Body: CreateBody }>('/proposals', async (request) => {
    const { category, templateFields, thresholdType, thresholdValue, deadlineDays } = request.body

    let workspace = await prisma.workspace.findFirst()
    if (!workspace) {
      workspace = await prisma.workspace.create({ data: { domainHash: 'demo' } })
    }

    const deadline = new Date()
    deadline.setDate(deadline.getDate() + deadlineDays)

    const proposal = await prisma.proposal.create({
      data: {
        workspaceId: workspace.id,
        category,
        templateFields,
        thresholdType,
        thresholdValue,
        deadline,
        publishAt: new Date(),
        status: 'active',
      }
    })

    return { id: proposal.id }
  })

  // POST /proposals/:id/commit
  fastify.post<{ Params: { id: string } }>('/proposals/:id/commit', async (request, reply) => {
    const { id } = request.params
    const sessionId = request.headers['x-session-id'] as string | undefined
    if (!sessionId) return reply.code(400).send({ error: 'x-session-id required' })

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) return reply.code(404).send({ error: 'Not found' })
    if (proposal.status === 'expired') return reply.code(400).send({ error: 'Proposal has expired' })
    if (proposal.status === 'activated') return reply.code(400).send({ error: 'Already activated' })

    const existing = await prisma.commitment.findFirst({
      where: { proposalId: id, tokenHash: sessionId, withdrawnAt: null }
    })
    if (existing) return reply.code(409).send({ error: 'Already committed' })

    await prisma.commitment.create({ data: { proposalId: id, tokenHash: sessionId } })

    const count = await prisma.commitment.count({ where: { proposalId: id, withdrawnAt: null } })

    let activated = false
    if (count >= proposal.thresholdValue) {
      await prisma.proposal.update({
        where: { id },
        data: { status: 'activated', activatedAt: new Date() }
      })
      activated = true
    }

    return { committed: true, commitmentCount: count, activated }
  })

  // DELETE /proposals/:id/commit
  fastify.delete<{ Params: { id: string } }>('/proposals/:id/commit', async (request, reply) => {
    const { id } = request.params
    const sessionId = request.headers['x-session-id'] as string | undefined
    if (!sessionId) return reply.code(400).send({ error: 'x-session-id required' })

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) return reply.code(404).send({ error: 'Not found' })
    if (proposal.status === 'activated') return reply.code(400).send({ error: 'Cannot withdraw after activation' })

    const commitment = await prisma.commitment.findFirst({
      where: { proposalId: id, tokenHash: sessionId, withdrawnAt: null }
    })
    if (!commitment) return reply.code(404).send({ error: 'No active commitment' })

    await prisma.commitment.update({
      where: { id: commitment.id },
      data: { withdrawnAt: new Date() }
    })

    const count = await prisma.commitment.count({ where: { proposalId: id, withdrawnAt: null } })
    return { withdrawn: true, commitmentCount: count }
  })
}

export default proposalRoutes
