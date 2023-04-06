const router = require("express").Router();
const auth = require("../middleware/auth");
const postController = require("../controllers/postController");

router.route("/posts")
    .post(auth, postController.createPost)
    .get(auth, postController.showPosts);

router.route("/post/:id")
    .patch(auth, postController.updatePosts)
    .get(auth, postController.getPost)
    .delete(auth, postController.deletePost)

router.route("/post/:id/like").patch(auth, postController.likeStatus)

router.route("/post/:id/dislike").patch(auth, postController.dislikeStatus)

router.get("/user_posts/:id", auth, postController.getPostUsers)

router.get("/post_discover", auth, postController.getPostDiscover)

router.patch('/savePost/:id', auth, postController.savePost)

router.patch('/unSavePost/:id', auth, postController.unSavePost)

router.get('/getSavePosts', auth, postController.getSavePosts)



module.exports = router;
