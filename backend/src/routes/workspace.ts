import type { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'

const workspaceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/workspace', async () => {
    let workspace = await prisma.workspace.findFirst()
    if (!workspace) {
      workspace = await prisma.workspace.create({ data: { domainHash: 'demo' } })
    }

    const [proposals, memberCount] = await Promise.all([
      prisma.proposal.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { commitments: { where: { withdrawnAt: null } } } }
        }
      }),
      prisma.workspaceToken.count({ where: { workspaceId: workspace.id } })
    ])

    return {
      workspaceId: workspace.id,
      memberCount,
      proposals: proposals.map(p => ({
        id: p.id,
        category: p.category,
        templateFields: p.templateFields,
        thresholdType: p.thresholdType,
        thresholdValue: p.thresholdValue,
        deadline: p.deadline,
        status: p.status,
        activatedAt: p.activatedAt,
        createdAt: p.createdAt,
        commitmentCount: p._count.commitments,
      }))
    }
  })
}

export default workspaceRoutes
