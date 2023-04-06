const Posts = require("../models/postModel");
const Comments = require("../models/commentModel");
const Users = require('../models/userModel')


class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString
  }
  paginating() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 9
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this;
  }
}

const postController = {
  createPost: async (req, res) => {
    try {
      const { images, content } = req.body;

      if (images.length === 0)
        return res
          .status(400)
          .json({ message: "Please add ypur videos or images" });

      const newPost = new Posts({
        content,
        images,
        user: req.user._id,
      });

      await newPost.save();

      return res.json({
        message: "Created post!",
        newPost: {
          ...newPost._doc,
          user: req.user
        },
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  showPosts: async (req, res) => {
    try {
      const features = new APIfeatures(Posts.find({
        user: [...req.user.following, req.user._id],
      }), req.query).paginating()
      const posts = await features.query.sort('-createAt')
        .populate("user likes", "avatar fullname username followers")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password"
          }
        })


      res.json({
        msg: "Success",
        result: posts.length,
        posts,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  updatePosts: async (req, res) => {
    try {
      const { content, images } = req.body

      const post = await Posts.findByIdAndUpdate({ _id: req.params.id },
        {
          content, images
        }).populate("user likes", "avatar fullname username ")
        .populate({ path: "comments", populate: { path: "user likes", select: "-password" } })

      res.json({
        message: "Update Post!",
        newPost: { ...post._doc, content, images }
      })

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  likeStatus: async (req, res) => {
    try {
      const post = await Posts.find({ _id: req.params.id, likes: req.user._id });
      if (post.length > 0) return res.status(400).json({ message: "You liked this status!" });

      const like = await Posts.findOneAndUpdate({ _id: req.params.id }, {
        $push: { likes: req.user._id }
      }, { new: true })

      if (!like) return res.status(400).json({ message: 'This post does not exist.' })

      res.json({ message: "Liked this status!" })

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  dislikeStatus: async (req, res) => {
    try {
      const like = await Posts.findOneAndUpdate({ _id: req.params.id }, {
        $pull: { likes: req.user._id }
      }, { new: true })

      if (!like) return res.status(400).json({ message: 'This post does not exist.' })


      res.json({ message: "Disliked this status!" })

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getPostUsers: async (req, res) => {
    try {
      const features = new APIfeatures(Posts.find({ user: req.params.id }), req.query).paginating()
      const posts = await features.query.sort("-createAt")
      res.json({
        posts,
        result: posts.length
      });
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  },

  getPost: async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id).populate("user likes", "avatar fullname username followers")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password"
          }
        })

      if (!post) return res.status(400).json({ message: 'This post does not exist.' })


      res.json({ post });
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  },

  getPostDiscover: async (req, res) => {
    try {
      const userArr = [...req.user.following, req.user._id]

      const num = req.query.num || 9

      const posts = await Posts.aggregate([
        { $match: { user: { $nin: userArr } } },
        { $sample: { size: Number(num) } }
      ])
      res.json({
        msg: "Success",
        result: posts.length,
        posts,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  },

  deletePost: async (req, res) => {
    try {
      const post = await Posts.findByIdAndDelete({ _id: req.params.id, user: req.user._id })
      await Comments.deleteMany({ _id: { $in: post.comments } })

      return res.json({
        message: 'Deleted Post!',
        newPost: {
          ...post,
          user: req.user
        }
      })
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  },

  savePost: async (req, res) => {
    try {
      const user = await Users.find({ _id: req.user._id, savedPost: req.params.id });
      if (user.length > 0) return res.status(400).json({ message: "You saved this status!" });

      const save = await Users.findOneAndUpdate({ _id: req.user._id }, {
        $push: { savedPost: req.params.id }
      }, { new: true })

      if (!save) return res.status(400).json({ message: 'This post does not exist.' })

      res.json({ message: "Saved this status!" })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  unSavePost: async (req, res) => {
    try {
      const save = await Users.findOneAndUpdate({ _id: req.user._id }, {
        $pull: { savedPost: req.params.id }
      }, { new: true })

      if (!save) return res.status(400).json({ msg: 'This user does not exist.' })

      res.json({ msg: 'unSaved Post!' })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getSavePosts: async (req, res) => {
    try {
      const features = new APIfeatures(Posts.find({
        _id: { $in: req.user.savedPost }
      }), req.query).paginating()

      const savePosts = await features.query.sort("-createdAt")

      res.json({
        savePosts,
        result: savePosts.length
      })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
};

module.exports = postController;
