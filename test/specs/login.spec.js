import { expect } from 'chai';
import LoginPage from '../pages/login.page';

describe('login form', () => {
    it('should deny access with wrong password', () => {
        LoginPage.open();
        LoginPage.username.setValue('New User');
        LoginPage.password.setValue('SuperSecretPassword');
        LoginPage.submit();

        expect(LoginPage.flash.getText()).to.contain('Your username is invalid!');
    });

    it('should allow access with correct credentials', () => {
        LoginPage.open();
        LoginPage.username.setValue('tomsmith');
        LoginPage.password.setValue('SuperSecretPassword!');
        LoginPage.submit();

        expect(LoginPage.flash.getText()).to.contain('You logged into a secure area!');
    });
});