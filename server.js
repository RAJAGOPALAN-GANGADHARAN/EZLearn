const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const ThumbnailGenerator = require('video-thumbnail-generator').default;

app.use(express.static(path.join(__dirname, 'public')))

var template_course = path.join(__dirname + '/courseplay.html');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'))
})

app.get('/list', function (req, res) {
  const directoryPath = path.join(__dirname, '/assets');
  var data = {};
  
  fs.readdirSync(directoryPath).forEach(file => {
    const tg = new ThumbnailGenerator({
      sourcePath: path.join(directoryPath, file),
      thumbnailPath: path.join(path.join(__dirname, 'public'), 'thumbnail'),
    });
    tt = tg.generateOneByPercentCb(90, (err, result) => {
      console.log(result);
    });
    if(file!="comments")
    data[file] = null;
  });

  fs.readdirSync(path.join(path.join(__dirname, 'public'), 'thumbnail')).forEach(file => {
    let f = file.split('-');
    data[f[0]+".mp4"] = file;
  });
    
  console.log(data);
  res.send(JSON.stringify(data));
})

app.get('/video/:name', function(req, res) {
  //res.sendFile(template_course);
  const path = 'assets/' + req.params.name;
  console.log(path);
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    if(start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
      return
    }
    
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.get('/comments/:name', function (req, res) {
  var f = req.params.name;
  let rawdata = fs.readFileSync(`assets/comments/${f}.json`);
  let student = JSON.parse(rawdata);
  res.send(JSON.stringify(student));
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
