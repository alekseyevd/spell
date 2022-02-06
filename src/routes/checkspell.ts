import YaSpellTransform from '../lib/CheckSpell'
import { IContext } from '../lib/http/interfaces'
import { Schema } from '../lib/validate'
import Route from '../lib/Route'

export default new Route({
  path: '/checkspell',
  method: 'post',
  handler: async (ctx: IContext) => {
    ctx.res.setHeader('Content-Disposition', `attachment; filename=${ctx.headers.filename}`)
    return ctx.req
      .pipe(new YaSpellTransform())
      .on('error', (error) => {
        ctx.res.end(error.message)
      })
  },
  validate: {
    headers: Schema({
      type: 'object',
      properties: {
        filename: {
          type: 'string'
        }
      },
      required: ['filename']
    })
  }
})