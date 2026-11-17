import passport from 'passport';
import { oauthProviders } from '../../config/passport.js';
import { updateLastLogin } from '../../models/profile/profile.js';
import { createAuthenticatedSession } from '../../utils/authentication.js';

const providerName = {
    google: 'Google',
    github: 'GitHub'
};

const startSocialLogin = (provider) => (req, res, next) => {
    if (!oauthProviders[provider]) {
        req.flash('error', `${providerName[provider]} sign-in is not configured yet.`);
        return res.redirect('/login');
    }

    const scope = provider === 'google' ? ['profile', 'email'] : ['user:email'];
    return passport.authenticate(provider, { scope })(req, res, next);
};

const completeSocialLogin = async (req, res, next, user) => {
    try {
        await updateLastLogin(user.id);
        await createAuthenticatedSession(req, user);
        req.flash('success', `Welcome back to our dealership, ${user.name || user.email}!`);
        return res.redirect('/dashboard');
    } catch (error) {
        return next(error);
    }
};

const finishSocialLogin = (provider) => (req, res, next) => {
    if (!oauthProviders[provider]) {
        req.flash('error', `${providerName[provider]} sign-in is not configured yet.`);
        return res.redirect('/login');
    }

    return passport.authenticate(provider, { session: false }, (error, user, info) => {
        if (error) {
            return next(error);
        }

        if (!user) {
            req.flash('error', info?.message || `Unable to sign in with ${providerName[provider]}.`);
            return res.redirect('/login');
        }

        return completeSocialLogin(req, res, next, user);
    })(req, res, next);
};

const startGoogleLogin = startSocialLogin('google');
const googleLoginCallback = finishSocialLogin('google');
const startGitHubLogin = startSocialLogin('github');
const gitHubLoginCallback = finishSocialLogin('github');

export {
    startGoogleLogin,
    googleLoginCallback,
    startGitHubLogin,
    gitHubLoginCallback
};
