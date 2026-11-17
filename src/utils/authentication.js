const createAuthenticatedSession = (req, user) =>
    new Promise((resolve, reject) => {
        if (!req.session) {
            reject(new Error('Cannot authenticate without a session'));
            return;
        }

        req.session.regenerate((error) => {
            if (error) {
                reject(error);
                return;
            }

            req.session.user = user;
            req.session.userId = user.id;
            resolve();
        });
    });

export { createAuthenticatedSession };
