import { UserControllers } from '../controllers/UserControllers'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export class UserRoutes {
  app: FastifyInstance
  userControllers: UserControllers

  constructor(app: FastifyInstance) {
    this.app = app
    this.userControllers = new UserControllers(this.app)
  }

  async createUser() {
    this.app.post('/users', (request: FastifyRequest, reply: FastifyReply) => {
      this.userControllers.create(request, reply)
    })
  }

  allRoutes() {
    this.createUser()
  }
}
