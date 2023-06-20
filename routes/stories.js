const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../middleware/auth");

const Story = require("../models/Story");

// @description Add Story Page
// @route GET /stories/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// @description Process Add Form
// @route POST /stories
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
})

// @description Show Public Stories Page
// @route GET /stories
.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate('user')
      .sort({ created: "desc" })
      .lean();

    res.render("stories/index", { stories });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @description Edit Story Page
// @route GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();

    if (!story) {
      res.render("error/404");
    // } else {
    //   res.render("stories/edit", { story });
    }

    if (story.user != req.user.id) {
      res.redirect("/");
    } else {
      res.render("stories/edit", { story });
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @description Edit Story
// @route PUT /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true
      });

      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
})

// @description Delete Story
// @route Delete /stories/:id
.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/");
    } else {
      await Story.findOneAndRemove({ _id: req.params.id });

      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
})

// @description Single Story Page
// @route GET /stories/:id
.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id)
    .populate("user")
    .lean();

  if (!story) {
    res.render("error/404");
  }

  res.render("stories/show", { story });
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

// @description Add Story Page
// @route GET /stories/add
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    let stories = await Story.find({
      user: req.params.userId,
      status: "public"
    }).populate("user").lean();

    res.render("stories/index", { stories });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

//@desc Search Stories by Title
//@route GET /stories/search/:query
router.get('/search/:query', ensureAuth, async (req, res) => {
  try{
      const stories = await Story.find({title: new RegExp(req.query.query,'i'), status: 'public'})
        .populate("user")
        .sort({ createdAt: "desc"})
        .lean();

      res.render('stories/index', { stories });
  } catch(err){
      console.error(err);
      res.render('error/404');
  }
});

module.exports = router;