import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import prisma from '../lib/prisma.js'

const DEMO_WS_ID = '00000000-0000-0000-0000-000000000001'

const SEED = [
  {
    category: 'working_conditions',
    framing: 'Workers need the ability to adjust their start times within a 2-hour window based on personal obligations, family care, and commute conditions. A rigid 9am start has created unnecessary stress and reduced retention without clear operational benefit.',
    thresholdValue: 40,
    deadlineDays: 14,
    commitCount: 32,
    status: 'active' as const,
  },
  {
    category: 'compensation',
    framing: 'Home office workers should receive a one-time equipment stipend to cover the cost of professional-grade workstations. Remote work has become a permanent arrangement for many, yet the company has provided no support for the associated infrastructure costs.',
    thresholdValue: 35,
    deadlineDays: 21,
    commitCount: 13,
    status: 'active' as const,
  },
  {
    category: 'other',
    framing: 'Leadership should hold a structured monthly briefing open to all staff, with written summaries distributed within 24 hours. Critical decisions affecting day-to-day operations are communicated inconsistently and often after the fact.',
    thresholdValue: 40,
    deadlineDays: 8,
    commitCount: 22,
    status: 'active' as const,
  },
  {
    category: 'working_conditions',
    framing: 'Workers with disabilities or medical conditions should be able to request ergonomic equipment through a streamlined process, without requiring disclosure of specific diagnoses to their direct manager.',
    thresholdValue: 30,
    deadlineDays: -7,
    commitCount: 30,
    status: 'activated' as const,
  },
  {
    category: 'compensation',
    framing: 'The annual performance review cycle should include a structured pay-equity audit comparing salaries across equivalent roles, with findings shared anonymously with all staff within 60 days of completion.',
    thresholdValue: 35,
    deadlineDays: -14,
    commitCount: 24,
    status: 'expired' as const,
  },
]

async function seedOnce() {
  await prisma.workspace.upsert({
    where: { id: DEMO_WS_ID },
    create: { id: DEMO_WS_ID },
    update: {},
  })

  const count = await prisma.proposal.count({ where: { workspaceId: DEMO_WS_ID } })
  if (count > 0) return

  for (let i = 0; i < SEED.length; i++) {
    const s = SEED[i]
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + s.deadlineDays)

    const proposal = await prisma.proposal.create({
      data: {
        workspaceId: DEMO_WS_ID,
        category: s.category,
        templateFields: { framing: s.framing },
        thresholdType: 'count',
        thresholdValue: s.thresholdValue,
        deadline,
        status: s.status,
        activatedAt: s.status === 'activated' ? new Date(Date.now() - 86_400_000) : null,
      },
    })

    await prisma.commitment.createMany({
      data: Array.from({ length: s.commitCount }, (_, j) => ({
        id: randomUUID(),
        proposalId: proposal.id,
        tokenHash: `seed-${i}-${j}`,
      })),
    })
  }
}

export default async function demoRoutes(fastify: FastifyInstance) {
  fastify.get('/demo/workspace', async () => {
    await seedOnce()
    const proposals = await prisma.proposal.findMany({
      where: { workspaceId: DEMO_WS_ID },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { commitments: { where: { withdrawnAt: null } } } } },
    })
    return {
      workspaceId: DEMO_WS_ID,
      memberCount: 47,
      proposals: proposals.map(p => ({ ...p, commitmentCount: p._count.commitments, _count: undefined })),
    }
  })

  fastify.get<{ Params: { id: string } }>('/demo/proposals/:id', async (req, reply) => {
    const session = req.headers['x-session-id'] as string | undefined
    const proposal = await prisma.proposal.findFirst({
      where: { id: req.params.id, workspaceId: DEMO_WS_ID },
      include: { _count: { select: { commitments: { where: { withdrawnAt: null } } } } },
    })
    if (!proposal) return reply.code(404).send({ error: 'Not found' })

    const userCommitment = session
      ? await prisma.commitment.findFirst({ where: { proposalId: proposal.id, tokenHash: session, withdrawnAt: null } })
      : null

    return { ...proposal, commitmentCount: proposal._count.commitments, userCommitted: !!userCommitment, _count: undefined }
  })

  fastify.post<{ Params: { id: string } }>('/demo/proposals/:id/commit', async (req, reply) => {
    const session = req.headers['x-session-id'] as string | undefined
    if (!session) return reply.code(400).send({ error: 'No session' })

    const proposal = await prisma.proposal.findFirst({ where: { id: req.params.id, workspaceId: DEMO_WS_ID } })
    if (!proposal) return reply.code(404).send({ error: 'Not found' })
    if (proposal.status !== 'active') return reply.code(400).send({ error: 'Proposal is not active' })

    const existing = await prisma.commitment.findFirst({ where: { proposalId: proposal.id, tokenHash: session, withdrawnAt: null } })
    if (existing) return reply.code(409).send({ error: 'Already committed' })

    await prisma.commitment.create({ data: { proposalId: proposal.id, tokenHash: session } })

    const total = await prisma.commitment.count({ where: { proposalId: proposal.id, withdrawnAt: null } })
    if (total >= proposal.thresholdValue) {
      await prisma.proposal.update({ where: { id: proposal.id }, data: { status: 'activated', activatedAt: new Date() } })
    }
    return { ok: true }
  })

  fastify.delete<{ Params: { id: string } }>('/demo/proposals/:id/commit', async (req, reply) => {
    const session = req.headers['x-session-id'] as string | undefined
    const proposal = await prisma.proposal.findFirst({ where: { id: req.params.id, workspaceId: DEMO_WS_ID } })
    if (!proposal) return reply.code(404).send({ error: 'Not found' })
    if (proposal.status === 'activated') return reply.code(400).send({ error: 'Cannot withdraw after activation' })

    const commitment = await prisma.commitment.findFirst({ where: { proposalId: proposal.id, tokenHash: session, withdrawnAt: null } })
    if (!commitment) return reply.code(404).send({ error: 'No commitment found' })

    await prisma.commitment.update({ where: { id: commitment.id }, data: { withdrawnAt: new Date() } })
    return { ok: true }
  })
}
