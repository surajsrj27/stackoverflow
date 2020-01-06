const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

//Load Person model
const Person = require("../../models/Person");

//Load profile model
const Profile = require('../../models/Profile');

//@type GET
//@route /api/profile
//@desc route for personal user Profile
//@access PRIVATE
router.get('/', auth, (req,res) => {
    Profile.findOne({user: req.user.id})
            .then(profile => {
                if(!profile) {
                    return res.status(404).json({profilenotfound: 'No profile Found'})
                }
                res.json({profile});
            })
            .catch(err => console.log('got some error in profile' + err));
});

// @type POST
// @route /api/profile/
// @desc route for UPDATING/SAVING personnal user profile
// @access PRIVATE
router.post('/', auth, (req,res) => {
        const profileValues = {}
        profileValues.user = req.user.id;
        if(req.body.username) profileValues.username = req.body.username;
        if(req.body.website) profileValues.website = req.body.website;
        if(req.body.country) profileValues.country = req.body.country;
        if(req.body.portfolio) profileValues.portfolio = req.body.portfolio;
        if(typeof req.body.languages !== undefined) {
            profileValues.languages = req.body.languages.split(",");
        }

        //getting social liks
        profileValues.social = {};

        if(req.body.youtube) profileValues.social.youtube = req.body.youtube;
        if(req.body.facebook) profileValues.social.facebook = req.body.facebook;
        if(req.body.instagram) profileValues.social.instagram = req.body.instagram;
   
        //saving data into database
        Profile.findOne({user:req.user.id})
            .then(profile => {
                if(profile){
                    Profile.findOneAndUpdate(
                        {user:req.user.id},
                        {$set: profileValues},
                        {new: true}
                    )
                        .then(profile => res.json(profile))
                        .catch(err => console.log('problem in update' + err));
                } else {
                    Profile.findOne({username: profileValues.username})
                        .then(profile => {
                            //Username already exists
                            if(profile) {
                                res.status(400).json({username:'Username already exists'})
                            } 
                            //save user
                            new Profile(profileValues)
                                .save()
                                .then(profile => res.json(profile))
                                .catch(err => console.log(err));
                        })
                        .catch(err => console.log('Problem fetching username' + err));
                }
            })
            .catch(err => console.log('Problem in fetching profile' + err));

    }
);

// @type GET
// @route /api/profile/:username
// @desc route for getting user profile based on USERNAME
// @access PUBLIC
router.get('/:username', (req,res) => {
    Profile.findOne({username:req.params.username})
        .populate("user",["name","profilepic"])
        .then(profile => {
            if(!profile){
                res.status(404).json({username: 'User not found'})
            }
            res.json(profile);
        })
        .catch(err => console.log('Error in fetching username' + err));
});

// @type GET
// @route /api/profile/find/everyone
// @desc route for getting user profile of everyone
// @access PUBLIC
router.get('/find/everyone', (req,res) => {
    Profile.find()
        .populate("user",["name","profilepic"])
        .then(profiles => {
            if(!profiles){
                res.status(404).json({username: 'No profiles  was found'});
            }
            res.json(profiles);
        })
        .catch(err => console.log('Error in fetching profiles' + err));
});

// @type DELETE
// @route /api/profile/
// @desc route for DELETING user BASED ON ID
// @access PRIVATE
router.delete('/', auth , (req,res) => {
    Profile.findOne({user:req.user.id})
    Profile.findOneAndRemove({user:req.user.id})
        .then( () => {
            Person.findOneAndRemove({_id:req.user.id})
                .then(() => res.json({success: 'delete was success'}))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// @type POST
// @route /api/profile/workrole
// @desc route for adding work profile of a person
// @access PRIVATE
router.post('/workrole', auth , (req,res) => {
    Profile.findOne({user:req.user.id})
        .then(profile => {
            if(!profile){
                return res.status(404).json({profilenotfound: 'No Profile Found'})
            }
            const newWork = {
                role: req.body.role,
                company: req.body.company,
                country: req.body.country,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                details: req.body.details
            };
            profile.workrole.unshift(newWork);
            profile
                .save()
                .then(profile => res.json(profile))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// @type DELETE
// @route /api/profile/workrole/:w_id
// @desc route for deleting a specific workrole
// @access PRIVATE
router.delete('/workrole/:w_id', auth , (req,res) => {
        Profile.findOne({user: req.user.id})
            .then(profile => {
                if(!profile){
                    res.status(404).json({profilenotfound: 'Profile Not Found'})
                }
                const removethis = profile.workrole
                                        .map(item => item.id)
                                        .indexOf(req.params.w_id);
                profile.workrole.splice(removethis, 1);

                profile
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    });

module.exports = router;