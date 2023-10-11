import { Socket } from 'socket.io'
import { FastifyInstance } from 'fastify'
import { prisma } from '../utils/prisma'
import { IGroupMessage } from '../@types/MessageTypes'

export class MessageSocketControllers {
  private app: FastifyInstance

  constructor(app: FastifyInstance) {
    this.app = app
  }

  async index(groupId: string, socket: Socket) {
    socket.join(groupId)

    const messages = await prisma.message.findMany({
      where: {
        groupId,
      },
      select: {
        creator: true,
        text: true,
        id: true,
        createdAt: true,
      },
    })

    socket.emit(groupId, messages)
  }

  async create(message: IGroupMessage, socket: Socket) {
    socket.join(message.groupId)

    const group = await prisma.group.findUnique({
      where: {
        id: message.groupId,
      },
    })

    if (!group) {
      return null
    }

    const newMessage = await prisma.message.create({
      data: {
        text: message.text,
        Group: {
          connect: {
            id: message.groupId,
          },
        },
        creator: {
          connect: {
            email: message.createdBy,
          },
        },
      },
      select: {
        creator: true,
        text: true,
        id: true,
        createdAt: true,
      },
    })

    const updatedGroup = await prisma.group.update({
      where: {
        id: message.groupId,
      },
      data: {
        updatedAt: new Date(),
      },
      select: {
        updatedAt: true,
        id: true,
        createdBy: true,
        name: true,
        members: true,
        image: true,
      },
    })

    socket.emit('send-message-loading', {
      loading: false,
    })
    this.app.io.to(message.groupId).emit('message', newMessage)

    updatedGroup.members.forEach(async (member) => {
      const groups = await prisma.group.findMany({
        where: {
          members: {
            some: {
              email: member.email,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          updatedAt: true,
          id: true,
          createdBy: true,
          name: true,
          image: true,
        },
      })

      this.app.io.emit(member.email, groups)
    })
  }
}
