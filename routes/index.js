var express = require('express');
var router = express.Router();
var multer  = require('multer')
var readline = require('linebyline')
var upload = multer({ dest: 'uploads/' })
var fs = require('fs')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/upload-advertisers', upload.single('advertisers'), function (req, res, next) {
  const obj = {}
  let duplicateCount = 0
  const file = fs.readFileSync(req.file.path)
  const arr = file.toString().split(/\r?\n/) // create array of advertisers from file
    .map(advertiser =>  { // transform elements of array to objects that normalize values and retain original name
      return {
          value: advertiser.replace(/\W+/g, " ").toLowerCase(),
          name: advertiser
        }
      })
    .sort((a, b) => { // sort objects by their name
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    })
    .forEach((advertiser, index, array) => { // iterate through array, comparing objects adjacently. If object's value is a substring of the next object's value then add to response. If object's value has at least three matching words also add to response.
      let matches = 0;

      let comparison = []
      if ( array[index + 1] ) {
        comparison = array[index + 1].value.split(' ').filter(el => Boolean(el))
      }
      const advertiserArray = advertiser.value.split(' ').filter(el => Boolean(el))

      advertiserArray.forEach(word => {
          if ( comparison.indexOf(word) !== -1 ) {
            matches += 1
          }
        })

        if ( ( matches ==  advertiserArray.length ) || matches >= 3) {
          obj[++duplicateCount] = [advertiser.name, array[index + 1].name]
        }
    })
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(obj, null, 4));
})

module.exports = router;
