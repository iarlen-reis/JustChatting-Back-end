import 'dotenv/config'
import './services/cloudinary'
import { env } from './utils/env'
import socket from 'fastify-socket.io'
import { fastifyCors } from '@fastify/cors'
import { UserRoutes } from './routes/UserRoutes'
import fastify, { FastifyInstance } from 'fastify'
import { IGroupMessage } from './@types/MessageTypes'
import { IAddMemberProps, IGroupProps } from './@types/GroupTypes'
import { GroupSocketControllers } from './controllers/GroupSocketControllers'
import { MessageSocketControllers } from './controllers/MessageSocketControllers'

const PORT = env.PORT || 3333

class Server {
  private app: FastifyInstance
  private userRoutes: UserRoutes
  private groupSocketControllers: GroupSocketControllers
  private messageSocketControllers: MessageSocketControllers

  constructor() {
    this.app = fastify()
    this.app.register(fastifyCors, {
      origin: ['https://justchatting.iarlenreis.com.br'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    })
    this.app.register(socket, {
      cors: {
        origin: ['https://justchatting.iarlenreis.com.br'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
    })
    this.userRoutes = new UserRoutes(this.app)
    this.groupSocketControllers = new GroupSocketControllers(this.app)
    this.messageSocketControllers = new MessageSocketControllers(this.app)
  }

  routes() {
    this.userRoutes.allRoutes()
  }

  socket() {
    this.app.ready(() => {
      this.app.io.on('connection', (socket) => {
        console.log('Client connected', socket.id)

        socket.on('join-group', (groupId: string) => {
          this.messageSocketControllers.index(groupId, socket)
        })

        socket.on('message', (message: IGroupMessage) => {
          this.messageSocketControllers.create(message, socket)
        })

        socket.on('groups', (userEmail: string) => {
          this.groupSocketControllers.index(userEmail, socket)
        })

        socket.on('create-group', (group: IGroupProps) => {
          this.groupSocketControllers.create(group, socket)
        })

        socket.on('members-group', (groupId: string) => {
          this.groupSocketControllers.groupById(groupId, socket)
        })

        socket.on('add-member', (member: IAddMemberProps) => {
          this.groupSocketControllers.addMember(member, socket)
        })

        socket.on('remove-member', (member: IAddMemberProps) => {
          this.groupSocketControllers.removeMember(member, socket)
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected', socket.id)
        })
      })
    })
  }

  start() {
    this.routes()
    this.socket()

    this.app.listen({ port: PORT as number }, () => {
      console.log(`Server running on port ${PORT}`)
    })
  }
}

const server = new Server()

server.start()
