
const express = require('express');
const router = express.Router();
 
router.get('/', async (req, res, next) => {
   try {
     res.send('ok');
   } catch (error) {
     console.error(error);
     next(error);
   }
});
 
module.exports = router;
