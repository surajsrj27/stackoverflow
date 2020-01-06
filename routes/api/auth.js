const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

//Person Model
const Person = require('../../models/Person');

//@type GET
//@route /api/auth
//@desc just for testing
//@access PUBLIC
router.get('/', (req,res) => res.json({test:"Auth is tested"}));

//@type POST
//@route /api/auth/register
//@desc route for registration of users
//@access PUBLIC
router.post('/register', (req,res) => {
    Person.findOne({ email: req.body.email })
        .then(person => {
            if(person) {
                return res.status(400).json({ email: 'Email already register'})    
            } else {
                const newPerson = new Person({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                //Encrypt password using bcrypt
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPerson.password, salt, (err, hash) => {
                        if(err) throw err;
                        newPerson.password = hash;
                        newPerson
                            .save()
                            .then(person => res.json(person))
                            .catch(err => console.log(err));
                    });
                });
            }

        })
        .catch(err => console.log(err));
});

//@type POST
//@route /api/auth/login
//@desc route for login of users
//@access PUBLIC
router.post('/login', (req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    Person.findOne({ email })
        .then( person => {
            if(!person){
                return res.status(404).json({emailerror: 'User not found with this email'});
            }
            bcrypt.compare(password, person.password)
                .then(isCorrect => {
                    if(isCorrect){
                        // res.json({success: 'User is able to login successfully'})
                        
                        //use payload and create token for user                    
                        const payload ={
                            id: person.id,
                            name: person.name,
                            email: person.email
                        };

                        jwt.sign(
                            payload,
                            config.get('jwtSecret'),
                            { expiresIn: 3600 },
                            (err, token) => {
                                if(err) throw err;
                                res.json({
                                    success:true,
                                    token
                                });
                            }
                        )

                    } else {
                        res.status(400).json({passworderr: 'Incorrect Password'})
                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

//@type GET
//@route /api/auth/profile
//@desc route for users
//@access PRIVATE
router.get('/profile', auth, (req,res) => {
    // console.log(req);

    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
});

module.exports = router;