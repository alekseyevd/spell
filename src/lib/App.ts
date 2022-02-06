import HttpServer from './http'
import { IContext, IRoute } from './http/interfaces'

export default class App {
  authenticate: Map<string, (ctx: IContext) => void> 
  authorize: Map<string, (ctx: IContext) => boolean> 
  _routes: Array<IRoute>
  _port: number

  constructor(config: any) {
    this.authenticate = new Map()
    this.authorize = new Map()
    this._routes = []
    this._port = config.PORT
  }

  route(route: IRoute) {
    this._routes.push(route)
  }

  routes(routes: Array<IRoute>) {
    this._routes = this._routes.concat(routes)
  }

  start() {
    new HttpServer({
      routes: this._routes,
      port: this._port,
    }).listen(() => {
      console.log(`Server listening on port ${this._port}`)
    })
  }
}
