const router = require('express').Router();
const Workout = require('../models/workout.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// -- Load Routes --

// These routes are not protected as responses are not personalised.

router.get('/', (req, res) => {
    const numPosts = Number(req.headers['currentposts']);
    Workout.find({}).sort({likes: -1, createdAt: -1})
    .skip(numPosts)
    .limit(13)
    .exec((err, workouts) => {
        if (err) return res.json('eRROR in workouts route \n' + err);

        if (workouts.length < 13) {
            res.json({
                posts: workouts,
                hasMore: false
            }).status(200);
        } else {
            workouts.pop()
            res.json({
                posts: workouts,
                hasMore: true
            }).status(200);
        }
    });
});

router.get('/powerlifting', (req, res) => {
    const numPosts = Number(req.headers['currentposts']);
    Workout.find({type: 'Powerlifting'}).sort({likes: -1, createdAt: -1})
    .skip(numPosts)
    .limit(13)
    .exec( (err, workouts) => {
        if (err) return res.json('eRROR in workouts route \n' + err);
        
        if (workouts.length < 13) {
            res.json({
                posts: workouts,
                hasMore: false
            }).status(200);
        } else {
            workouts.pop()
            res.json({
                posts: workouts,
                hasMore: true
            }).status(200);
        }
    });
});

router.get('/bodybuilding', (req, res) => {
    const numPosts = Number(req.headers['currentposts']);
    Workout.find({type: 'Bodybuilding'}).sort({likes: -1, createdAt: -1})
    .skip(numPosts)
    .limit(13)
    .exec( (err, workouts) => {
        if (err) return res.json('eRROR in workouts route \n' + err);
        
        if (workouts.length < 13) {
            res.json({
                posts: workouts,
                hasMore: false
            }).status(200);
        } else {
            workouts.pop()
            res.json({
                posts: workouts,
                hasMore: true
            }).status(200);
        }
    });
});

router.get('/weightlifting', (req, res) => {
    const numPosts = Number(req.headers['currentposts']);
    Workout.find({type: 'Weightlifting'}).sort({likes: -1, createdAt: -1})
    .skip(numPosts)
    .limit(13)
    .exec( (err, workouts) => {
        if (err) return res.json('eRROR in workouts route \n' + err);
        
        if (workouts.length < 13) {
            res.json({
                posts: workouts,
                hasMore: false
            }).status(200);
        } else {
            workouts.pop()
            res.json({
                posts: workouts,
                hasMore: true
            }).status(200);
        }
    });
});

router.get('/endurance', (req, res) => {
    const numPosts = Number(req.headers['currentposts']);
    Workout.find({type: 'Endurance'}).sort({likes: -1, createdAt: -1})
    .skip(numPosts)
    .limit(13)
    .exec( (err, workouts) => {
        if (err) return res.json('eRROR in workouts route \n' + err);
        
        if (workouts.length < 13) {
            res.json({
                posts: workouts,
                hasMore: false
            }).status(200);
        } else {
            workouts.pop()
            res.json({
                posts: workouts,
                hasMore: true
            }).status(200);
        }
    });
});

router.get('/crossfit', (req, res) => {
    const numPosts = Number(req.headers['currentposts']);
    Workout.find({type: 'Crossfit'}).sort({likes: -1, createdAt: -1})
    .skip(numPosts)
    .limit(13)
    .exec( (err, workouts) => {
        if (err) return res.json('eRROR in workouts route \n' + err);
        
        if (workouts.length < 13) {
            res.json({
                posts: workouts,
                hasMore: false
            }).status(200);
        } else {
            workouts.pop()
            res.json({
                posts: workouts,
                hasMore: true
            }).status(200);
        }
    });
});




// -- Protected Routes --

// Checks that the user has a valid authToken

const verify = (req, res, next) => {
    const authToken = req.headers["authorization"].split(' ')[1]
    if (authToken == null) return res.json('authToken is null').sendStatus(401);

    jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

// Returns workouts that were liked by the user. (For the /my-favorites page)

router.get('/my-favorites', verify, (req, res) => {
    const numPosts = Number(req.headers['currentposts']);
    User.findById(req.user._id, 'liked', (error, user) => {
        if (error) return res.json(error)

        Workout.find({_id: {$in: user.liked}})
        .skip(numPosts)
        .limit(13)
        .exec((err, workouts) => {
            if (err) return res.json('eRROR in workouts route \n' + err);
        
            if (workouts.length < 13) {
                res.json({
                    posts: workouts,
                    hasMore: false
                }).status(200);
            } else {
                workouts.pop()
                res.json({
                    posts: workouts,
                    hasMore: true
                }).status(200);
            }
        });
    });
});

// Returns workouts that were posted by the user. (For the /my-workouts page)

router.get('/my-workouts', verify, (req, res) => {
    const numPosts = Number(req.headers['currentposts']);
    User.findById(req.user._id, 'posted', (error, user) => {
        if (error) return res.json(error)

        Workout.find({_id: {$in: user.posted}})
        .skip(numPosts)
        .limit(13)
        .exec((err, workouts) => {
            if (err) return res.json('eRROR in workouts route \n' + err);
        
            if (workouts.length < 13) {
                res.json({
                    posts: workouts,
                    hasMore: false
                }).status(200);
            } else {
                workouts.pop()
                res.json({
                    posts: workouts,
                    hasMore: true
                }).status(200);
            }
        });
    });
});

// For inspecting a particular workout

router.get('/:id', (req, res) => {
    Workout.findById(req.params.id, (err, workout) => {
        if (err) return res.json('eRROR in workouts route: \n' + err).status(400);
        if (!workout) return res.json('Not found');

        res.json(workout).status(200);
    });
});

// For deleting a workout in the /my-workouts page

router.delete('/:id', verify, (req, res) => {
    const workoutId = req.params.id; 
    Workout.deleteOne({_id: workoutId}, err => {
        if (err) return res.json('eRROR in workouts route: \n' + err).status(400);

        res.json('Workout successfully deleted').status(200);
    });
});

// For posting a new workout

router.post('/', verify, (req, res) => {
    const newWorkout = new Workout({
        title: req.body.title,
        type: req.body.type,
        exercises: req.body.exercises,
        likes: []
    });
    newWorkout.save((error, workout) => {
        if (error) return res.json(error);

        User.updateOne({_id: req.user._id}, {$push: {posted: workout._id}}, err => {
            if (err) {
                res.json(err);
            } else {
                res.json(workout).status(200);
            }
        })
    });
});

module.exports = router;