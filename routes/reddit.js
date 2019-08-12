const express = require("express");
const router = express.Router();

// const queryString = require('querystring');

// router.get('/access_token_init', (req, res, next) => {
//   let postOptions = {
//     host: 
//   }
//   let dataOptions = queryString.stringify({
//     greant_type: 'password',
//     username: 'ScarredDemonIV',
//     password: '13TM31N10@'
//   });
//   let requestOptions = setRequestOptions(dataOptions);
// });

router.get('/access_token', (req ,res ,next ) => {
  res.status(200).json({test: req.query});
});

router.get('/reddit_auth', (req, res, next) => {
  // console.log(res);
  console.log(req.query);
  // res.send({test: 'reddit works'});
});

const setRequestOptions = () => {

}

module.exports = router;