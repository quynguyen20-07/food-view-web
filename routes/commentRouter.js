const router = require('express').Router();
const commentsController = require('../controllers/commentController')
const auth = require("../middleware/auth");



router.post('/comment', auth, commentsController.createComment)

router.patch('/comment/:id', auth, commentsController.updateComment)

router.patch('/comment/:id/like', auth, commentsController.likeComment)

router.patch('/comment/:id/dislike', auth, commentsController.dislikeComment)

router.delete('/comment/:id', auth, commentsController.deleteComment)


module.exports = router