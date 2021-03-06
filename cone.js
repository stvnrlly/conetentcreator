'use strict';

const fs = require('fs');
const Canvas = require('canvas');
const randy = require('randy');
const seed = require('seed-random');
const Twit = require('twit');
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config();

var T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var Image = Canvas.Image;
var canvas = new Canvas(500, 500);
var ctx = canvas.getContext('2d');

// background color
ctx.fillStyle = randomColor();
ctx.fillRect(0,0,500,500);

// some cone stats
var x = randy.randInt(-50, 50);
var y = randy.randInt(-50, 85);
var h = randy.randInt(50, 250);

// circle radius for ellipse
var r = randy.randInt(10, 30);
var stretch = randy.randInt(2, 5);

// set up rotation
ctx.save();
if (randy.randInt(0, 100) > 50) {
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
}
ctx.translate(canvas.width/2,canvas.height/2);
ctx.rotate((randy.randInt(0,360))*Math.PI/180);

// color gradient, randomized for this cone
var gradient=ctx.createLinearGradient(0,0,170,0);
gradient.addColorStop(0, randomColor());
gradient.addColorStop(0.5, randomColor());
gradient.addColorStop(1.0, randomColor());

ctx.fillStyle = gradient;

ctx.scale((stretch), 1);

// draw the triangle and arc
ctx.beginPath();
ctx.moveTo(x+r, y+h);
var angle = Math.asin(r / h);
ctx.arc(x+r, y, r, angle, Math.PI - angle, true);
ctx.closePath();

ctx.fill();
ctx.restore();

if (argv.test) {
  // write to file
  var out = fs.createWriteStream(__dirname + '/cone.png');
  var stream = canvas.pngStream();
  stream.on('data', function(chunk){
    out.write(chunk);
  });

  stream.on('end', function(){
    console.log(`>> x: ${x}, y: ${y}, r: ${r}, h: ${h}, stretch: ${stretch}`);
    console.log('>> saved png');
  });
} else {
  // create tweet
  T.post('media/upload', { media_data: canvas.toBuffer().toString('base64') }, function (err, data, response) {
    if (err) { console.log(err); }
    var mediaIdStr = data.media_id_string;
    var altText = 'cone';
    var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

    T.post('media/metadata/create', meta_params, function (err, data, response) {
      // if (err) { console.log(err); }
      if (!err) {
        // now we can reference the media and post a tweet (media will attach to the tweet)
        var params = { status: 'cone', media_ids: [mediaIdStr] };

        T.post('statuses/update', params, function (err, data, response) {
          if (err) {
            console.log('Error posting status: \n'+err);
          } else {
            console.log(data, response);
          }
        });
      }
    });
  });
}

function randomColor() {
  return '#000000'.replace(/0/g, function () {return (~~(Math.random()*16)).toString(16);});
}
