'use strict'

// Generator returns data from promise with timeout

function * getStreams (nextKey) {
  const limit = 10
  let done = false
  while (!done) {
    yield new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = []
        for (let i = nextKey, j = 0; i <= 100, j < limit; i++, j++ ){
          result.push(i)
          if (i === 100) done = true
        }
        nextKey = nextKey + limit
        resolve({
          data: result,
          next: nextKey + limit
        })
      }, 500)
    })
  }
}

const isPromise = obj => Boolean(obj) && typeof obj.then === 'function'

const next = (iter, callback, prev = undefined) => {
  const item = iter.next(prev)
  const value = item.value

  if (item.done) return callback(prev)

  if (isPromise(value)) {
    value.then(val => {
      setImmediate(() => next(iter, callback, val))
    })
  } else {
    setImmediate(() => next(iter, callback, value))
  }
}

const gensync = (fn) =>
  (...args) => new Promise(resolve => {
    next(fn(...args), val => resolve(val))
  })

/* How to use gensync() */

const logs = getStreams(0)
let result = []

const asyncFunc = gensync(function * () {
  let result1 = yield logs.next().value // returns promise
  result = result.concat(result1.data)
  while (result1 && result1.next) {
    result1 = yield logs.next().value
    if (result1 && result1.data) result = result.concat(result1.data)
  }
  yield result
})

// Call the async function and pass params.
asyncFunc('param1', 'param2', 'param3', 'params 4')
  .then(val => console.log(val)) // 'future value 2