const fetchMock = require('fetch-mock')
const wac = require('./index.js')

fetchMock.catch((url, config) => {
    //provide the acl headers for all containers
    if (url.endsWith("/"))
        return {status: 200, headers: {Link: '<.acl>; rel="acl"'}};

    //404 for any url not explicitly mocked
    return 404;
})

test('Get ACL Url - no link header', async function () {
    const docUrl = 'http://example.com/no-acl'
    fetchMock.head(docUrl, 200)
    const aclUrl = await wac.aclUrl(docUrl)
    expect(aclUrl).toBe('')
});

test('Get ACL Url - with link header', async function () {
    const docUrl = 'http://example.com/direct-acl'
    fetchMock.head(docUrl, {status: 200, headers: {Link: '<direct-acl.acl>; rel="acl"'}})
    fetchMock.get(`${docUrl}.acl`, 200)
    const aclUrl = await wac.aclUrl(docUrl)
    expect(aclUrl).toBe('http://example.com/direct-acl.acl')
});

test('Get ACL Url - parent inherited ACL', async function () {
    const docUrl = 'http://example.com/parent/inherited-acl'
    fetchMock.head(docUrl, {status: 200, headers: {Link: '<inherited-acl.acl>; rel="acl"'}})
    fetchMock.get('http://example.com/parent/.acl', 200)
    const aclUrl = await wac.aclUrl(docUrl);
    expect(aclUrl).toBe('http://example.com/parent/.acl')
});

test('Get ACL Url - deep inherited ACL', async function () {
    const docUrl = 'http://example.com/more/parents/here/than/normal/urls/typically/have/in/general/deep-acl'
    fetchMock.head(docUrl, {status: 200, headers: {Link: '<inherited-acl.acl>; rel="acl"'}})
    fetchMock.get('http://example.com/.acl', 200)
    const aclUrl = await wac.aclUrl(docUrl);
    expect(aclUrl).toBe('http://example.com/.acl')
});
