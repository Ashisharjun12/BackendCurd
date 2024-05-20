const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

//diskstroage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(10 , (err, name)=>{
         const uploadFile = name.toString("hex") + path.extname(file.originalname)
         cb(null, uploadFile)

        } )
     
     
    }
  })
  
  const upload = multer({ storage: storage })


  module.exports = upload;