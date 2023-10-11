import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export class UserControllers {
  app: FastifyInstance

  constructor(app: FastifyInstance) {
    this.app = app
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
      name: z.string(),
      email: z.string(),
      image: z.string(),
    })

    const { name, email, image } = bodySchema.parse(request.body)

    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (userExists) {
      return reply.status(200).send()
    }

    await prisma.user.create({
      data: {
        name,
        email,
        image,
      },
    })

    reply.status(201).send()
  }
}
