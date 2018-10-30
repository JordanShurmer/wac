const parseHeader = require('parse-link-header')

const wac = module.exports = {}

/**
 * Given any document url, return the url to the corresponding ACL document, whether or not that document actually exists.
 *
 * Parse the Link header for the first rel="acl" link
 */
wac.aclUrl = function (docUrl) {
    console.debug(`Determining acl url for ${docUrl}`)
    return fetch(docUrl, {method: 'HEAD'})
        .then(response => {
            let aclUrl = ''
            const links = parseHeader(response.headers.get('Link'))
            if (links && links.acl) {
                // resolve the relative acl Link against the given document url
                aclUrl = new URL(links.acl.url, docUrl).href
                console.debug(`ACL URL from ${docUrl} Headers: ${aclUrl}`)

                //check for existence of the doc
                return fetch(aclUrl)
                    .then(aclResponse => {
                        if (aclResponse.ok) {
                            return aclUrl;
                        } else {
                            //get the container url
                            const container = new URL(docUrl.endsWith('/') ? '..' : '.', docUrl).href;
                            if (container === docUrl) {
                                //TODO: We've already checked all the way.. what now? error?
                                return '';
                            } else {
                                return wac.aclUrl(container);
                            }
                        }
                    });
            } else {
                console.debug(`No ACL Link header for ${docUrl}`)
                return aclUrl
            }
        })
    // TODO: handle fetch.catch().  return ''? throw errors?
}
