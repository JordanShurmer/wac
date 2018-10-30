const parseHeader = require('parse-link-header')

const wac = module.exports = {}

/**
 * Given any document url, return the url to the corresponding ACL document, whether or not that document actually exists.
 *
 * Parse the Link header for the first rel="acl" link
 */
wac.aclUrl = function (docUrl) {
  console.debug(`Determining acl url for ${docUrl}`)
  return fetch(docUrl, { method: 'HEAD' })
    .then(response => {
      let aclUrl = ''
      const links = parseHeader(response.headers.get('Link'))
      if (links && links.acl) {
        // resolve the relative acl Link against the given document url
        aclUrl = new URL(links.acl.url, docUrl).href
        console.debug(`ACL URL from ${docUrl} Headers: ${aclUrl}`)
      } else {
        console.debug(`No ACL Link header for ${docUrl}`)
      }
      return aclUrl
    })
    // TODO: handle fetch.catch().  return ''? throw errors?
}
