const fetchMock = require('fetch-mock')
const wac = require('./index.js')

test('Get ACL Url - no link header', async function () {
        console.debug('Testing aclUrl(string) no link header')
        const docUrl = 'http://example.com/no-acl'
        fetchMock.head(docUrl, 200)
        const aclUrl = await wac.aclUrl(docUrl)
        expect(aclUrl).toBe('')
    }
)

test('Get ACL Url - with link header', async function () {
    console.debug('Testing aclUrl(string) direct link header')
    const docUrl = 'http://example.com/direct-acl'
    fetchMock.head(docUrl, {status: 200, headers: {Link: '<direct-acl.acl>; rel="acl"'}})
    fetchMock.get(`${docUrl}.acl`, 200)
    const aclUrl = await wac.aclUrl(docUrl)
    expect(aclUrl).toBe('http://example.com/direct-acl.acl')
});

