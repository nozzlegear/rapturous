export const paths = {
    api: {
        sessions: {
            base: "/api/v1/sessions/",
            paths: {
                create: ""
            }
        },
        users: {
            base: "/api/v1/users/",
            paths: {
                create: "",
                getIntegrationLink: "integration/link",
                finalizeIntegration: "integration/finalize"
            }
        },
    },
    home: {
        index: "/",
    },
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
    },
    signup: {
        index: "/signup",
        getIntegrationLink: "/signup/integrate",
        finalizeIntegration: "/signup/integrate/finalize",
    }
}

export default paths;