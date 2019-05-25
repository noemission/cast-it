import { init } from '@rematch/core'
import * as models from './models/index'
import { createLogger } from 'redux-logger'

import createRematchPersist from '@rematch/persist'

const persistPlugin = createRematchPersist({
    key: 'app'
})

const store = init({
    plugins: [persistPlugin],
    redux: {
        middlewares: [createLogger()]
    },
    models,
})

export default store