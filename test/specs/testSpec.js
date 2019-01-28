const assert = require('assert');

describe('The-Internet page', () => {
    it('should have the right title', () => {
        browser.url('/');
        const title = browser.getTitle();
        assert.equal(title, 'The Internet');
    });
});