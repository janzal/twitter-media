/**
 * Inspired by https://github.com/evanlucas/remote-file-size
 */

const request = require('request')

module.exports = function(uri) {

  return new Promise((resolve, reject) => {

    let options = { uri }

    options.method = 'HEAD'
    options.followAllRedirects = true
    options.followOriginalHttpMethod = true

    request(options, (err, res) => {
      if (err) return reject(err)
      const code = res.statusCode
      if (code >= 400) {
        return reject(new Error('Received invalid status code: ' + code))
      }

      if (!res.headers['content-length']) {
        return reject(new Error('Unable to determine file size'))
      }

      resolve(Number(res.headers['content-length']))
    })
  })
}