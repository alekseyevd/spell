import App from './lib/App'
import checkspell from './routes/checkspell'
import * as config from './config'

const app = new App(config)
app.route(checkspell)

export default app