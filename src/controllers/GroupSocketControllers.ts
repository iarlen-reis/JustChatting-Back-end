import { z } from 'zod'
import { Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../utils/prisma'
import { FastifyInstance } from 'fastify'
import { uploadImageToCloudinary } from '../utils/cloudinary'
import { IAddMemberProps, IGroupProps } from '../@types/GroupTypes'

export class GroupSocketControllers {
  private app: FastifyInstance

  constructor(app: FastifyInstance) {
    this.app = app
  }

  async index(userEmail: string, socket: Socket) {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            email: userEmail,
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

    socket.emit(userEmail, groups)
  }

  async create(group: IGroupProps, socket: Socket) {
    const bodySchema = z.object({
      name: z.string(),
      createdBy: z.string(),
      image: z.string(),
    })

    const { name, createdBy, image } = bodySchema.parse(group)

    const user = await prisma.user.findUnique({
      where: { email: createdBy },
    })

    if (!user) {
      return socket.emit('error', 'User not found')
    }

    const uuid = uuidv4()

    const urlImage = await uploadImageToCloudinary(image, uuid)

    await prisma.group.create({
      data: {
        name,
        createdBy: user.email,
        image: urlImage,
        members: {
          connect: { email: user.email },
        },
      },
    })

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            email: user.email,
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

    socket.emit(user.email, groups)
    socket.emit('create-group', {
      loading: false,
    })
  }

  async groupById(groupId: string, socket: Socket) {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        members: true,
        name: true,
        createdBy: true,
        image: true,
      },
    })

    if (!group) {
      return socket.emit('error', 'Group not found')
    }

    socket.emit('group', group)
  }

  async addMember(member: IAddMemberProps, socket: Socket) {
    const memberSchema = z.object({
      groupId: z.string(),
      email: z.string(),
    })

    const { groupId, email } = memberSchema.parse(member)

    const groupExists = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        members: true,
      },
    })

    if (!groupExists) {
      return socket.emit('error', 'Grupo não encontrado.')
    }

    const memberExists = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!memberExists) {
      return socket.emit('error', {
        error: 'Usuário não encontrado.',
        loading: false,
      })
    }

    if (
      groupExists.members.some((member) => member.email === memberExists.email)
    ) {
      return socket.emit('warn', {
        warning: 'Usuário já está no grupo.',
        loading: false,
      })
    }

    const group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        members: {
          connect: { email: memberExists.email },
        },
      },
      select: {
        members: true,
        name: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    })

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            email: memberExists.email,
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

    this.app.io.emit(memberExists.email, groups)
    socket.emit('add-member', {
      loading: false,
    })
    socket.emit('group', group)
  }

  async removeMember(member: IAddMemberProps, socket: Socket) {
    const memberSchema = z.object({
      groupId: z.string(),
      email: z.string(),
    })

    const { groupId, email } = memberSchema.parse(member)

    const groupExists = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    })

    if (!groupExists) {
      return socket.emit('error', 'Grupo não encontrado.')
    }

    const memberExists = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!memberExists) {
      return socket.emit('error', 'Usuário não encontrado.')
    }

    const group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        members: {
          disconnect: { email: memberExists.email },
        },
      },
      select: {
        members: true,
        name: true,
        createdBy: true,
      },
    })

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            email: memberExists.email,
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

    this.app.io.emit(memberExists.email, groups)
    socket.emit('remove-member', {
      loading: false,
    })
    socket.emit('group', group)
  }
}
