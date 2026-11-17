import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import GoogleStrategy from 'passport-google-oauth20';
import { env } from './env.js';
import { findOrCreateSocialUser } from '../models/forms/socialAuth.js';

const oauthProviders = {
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
};

if (oauthProviders.google) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: new URL('/auth/google/callback', env.OAUTH_CALLBACK_BASE_URL).toString(),
                scope: ['profile', 'email'],
                state: true
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const verifiedEmail = profile.emails?.find(
                        (email) =>
                            email.verified === true && profile._json.email_verified === true
                    );
                    const result = await findOrCreateSocialUser({
                        provider: 'google',
                        providerUserId: profile.id,
                        email: verifiedEmail?.value,
                        emailVerified: Boolean(verifiedEmail),
                        name: profile.displayName,
                        profileImage: profile.photos?.[0]?.value
                    });

                    return done(null, result.user || false, { message: result.error });
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
}

if (oauthProviders.github) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
                callbackURL: new URL('/auth/github/callback', env.OAUTH_CALLBACK_BASE_URL).toString(),
                scope: ['user:email'],
                state: true,
                allRawEmails: true,
                userAgent: 'NeoMotor-used-car-dealership'
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const verifiedEmail =
                        profile.emails?.find((email) => email.primary && email.verified) ||
                        profile.emails?.find((email) => email.verified);
                    const result = await findOrCreateSocialUser({
                        provider: 'github',
                        providerUserId: profile.id,
                        email: verifiedEmail?.value,
                        emailVerified: Boolean(verifiedEmail),
                        name: profile.displayName || profile.username,
                        profileImage: profile.photos?.[0]?.value
                    });

                    return done(null, result.user || false, { message: result.error });
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
}

export { oauthProviders };
