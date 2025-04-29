import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    const routes = {
        "Authentication Routes": [
            { method: "POST", route: "/api/v1/auth/register", description: "Register a new user" },
            { method: "POST", route: "/api/v1/auth/login", description: "Login a user" },
            { method: "POST", route: "/api/v1/auth/logout", description: "Logout a user" }
        ],
        "User Details Routes": [
            { method: "PUT", route: "/api/v1/userdetails/update/:userId", description: "Update user details" },
            { method: "GET", route: "/api/v1/userdetails/get/:userId", description: "Get user details by userId" }
        ],
        "Post Routes": [
            { method: "POST", route: "/api/v1/posts/createpost", description: "Create a new post" },
            { method: "GET", route: "/api/v1/posts/getpost/:postId", description: "Get a post by postId" },
            { method: "GET", route: "/api/v1/posts/getpost/user/:userId", description: "Get all posts by a user" },
            { method: "GET", route: "/api/v1/posts/getposts", description: "Get all posts" },
            { method: "PUT", route: "/api/v1/posts/updatepost/:postId", description: "Update a post by postId" },
            { method: "PUT", route: "/api/v1/posts/addlike/:postId", description: "Add a like to a post" },
            { method: "PUT", route: "/api/v1/posts/addrepost/:postId", description: "Repost a post" },
            { method: "PUT", route: "/api/v1/posts/addview/:postId", description: "Add a view to a post" }
        ],
        "Photo Routes": [
            { method: "POST", route: "/api/v1/photos/upload", description: "Upload a photo" },
            { method: "GET", route: "/api/v1/photos/:photoId", description: "Get a photo by photoId" },
            { method: "DELETE", route: "/api/v1/photos/:photoId", description: "Delete a photo by photoId" }
        ],
        "Comments Routes": [
            { method: "POST", route: "/api/v1/comments/create", description: "Create a new comment on a post" },
            { method: "GET", route: "/api/v1/comments/:postId", description: "Get all comments for a specific post" },
            { method: "DELETE", route: "/api/v1/comments/:commentId", description: "Delete a comment by commentId" }
        ],
        "Uploads": [
            { method: "GET", route: "/uploads/:filename", description: "Serve uploaded files from the 'uploads' directory" }
        ]
    };

    return res.status(200).json(routes);
});

export default router;
