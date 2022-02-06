import { IContext } from './http/interfaces'
import { IRoute } from './http/interfaces'
import app from '../app'

export default class Route implements IRoute {
  private _method: string
  private _path: string
  private _validate: any
  private _options: any
  private _use: { authenticate?: string, accessControl?: Array<string> }

  constructor(params: any) {
    this._method = params.method
    this._path = params.path
    this._validate = params.validate
    this._options = params.options
    this._use = params.use || {}
    if (params.handler) {
      this._handler = params.handler
    }
  }

  async _handler(ctx: IContext): Promise<any> {
    throw new Error('handler is not defuned')
  }

  private async validate(ctx: IContext): Promise<Array<string>> {
    const validateBody = this._validate?.body
    const validateQuery = this._validate?.query
    const validateParams = this._validate?.params
    const validateHeaders = this._validate?.headers

    if (validateBody) {
      const { body } = await ctx.parseBody()
      
      const { errors } = validateBody(body)
      if (errors) return errors
    }

    if (validateQuery) {
      const query = ctx.query
      const { errors } = validateQuery(query)
      if (errors) return errors
    }

    if (validateParams) {
      const params = ctx.params
      const { errors } = validateParams(params)
      if (errors) return errors
    }

    if (validateHeaders) {
      const headers = ctx.headers
      const { errors } = validateHeaders(headers)
      if (errors) return errors
    }
    return []
  }

  private async handleRequest(ctx: IContext) {
    if (!this._handler) throw new Error('handler is not defined')
    
    if (this._method && this._method !== ctx.method) throw new Error('method not allowed')

    const authenticate = app.authenticate.get(this._use?.authenticate || 'default')
    if (authenticate) authenticate(ctx)

    let authorized = false
    if (!this._use.accessControl) {
      const accessControl = app.authorize.get('default')
      authorized = accessControl ? accessControl(ctx) : true
    } else {
      for (const key of this._use.accessControl) {
        const accessControl = app.authorize.get(key)
        authorized = accessControl ? accessControl(ctx) : false
        if (authorized) break
      }
    }
    if (!authorized) throw new Error('unauthorized')


    const errors = await this.validate(ctx)
    if (errors.length) throw new Error(errors.join(', '))
  
    return this._handler(ctx)
  }

  get method() {
    return this._method
  }

  get path() {
    return this._path
  }

  get options() {
    return this._options
  }

  get action() {
    return this.handleRequest.bind(this)
  }
}
