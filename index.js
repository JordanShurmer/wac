const parseHeader = require('parse-link-header')

const wac = module.exports = {}

/**
 * Given any document url return the url to the corresponding ACL document that defines it's sharing settings
 *
 * Parse the Link header for the rel="acl" link. Inherit up the hierarchy until an acl doc is actually found
 */
wac.aclUrl = function (docUrl) {
    return fetch(docUrl, {method: 'HEAD'})
        .then(response => {
            const links = parseHeader(response.headers.get('Link'))
            if (links && links.acl) {
                // resolve the relative acl Link against the given document url
                const aclUrl = new URL(links.acl.url, docUrl).href

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
                return ''
            }
        })
        .catch(reason => {
            console.error("HEAD request for acl Link header failed", {reason: reason});
            // TODO: what to do here?
            return '';
        })
}
