'use strict';

const fs = require('fs');
const Canvas = require('canvas');
const randy = require('randy');
const seed = require('seed-random');
const Twit = require('twit');
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

var out = fs.createWriteStream(__dirname + '/cone.png');
var stream = canvas.pngStream();



for (var i = 0; i < 500; i++) {
  console.log('cone time!');

  var x = randy.randInt(0, 200);
  var y = randy.randInt(0, 200);
  var w = randy.randInt(100, 300);
  var h = randy.randInt(20, 50);

  ctx.save();
  ctx.translate(canvas.width/2,canvas.height/2);
  ctx.rotate((randy.randInt(0,360))*Math.PI/180);

  // color gradient
  var gradient=ctx.createLinearGradient(0,0,170,0);
  gradient.addColorStop(0,'#000000'.replace(/0/g, function () {return (~~(Math.random()*16)).toString(16);}));
  gradient.addColorStop(0.5,'#000000'.replace(/0/g, function () {return (~~(Math.random()*16)).toString(16);}));
  gradient.addColorStop(1.0,'#000000'.replace(/0/g, function () {return (~~(Math.random()*16)).toString(16);}));

  ctx.beginPath();

  // draw the top lines
  ctx.moveTo(x+(w/2), 0);
  ctx.lineTo(x, y+(h/2));
  ctx.lineTo(x+w, y+(h/2));
  ctx.lineTo(x+(w/2), 0);
  ctx.strokeStyle = gradient;
  ctx.stroke();

  // add color gradient
  ctx.fillStyle = gradient;
  ctx.fill();

  // draw an ellipse
  // http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas#2173084
  var kappa = .5522848;
  var ox = (w / 2) * kappa; // control point offset horizontal
  var oy = (h / 2) * kappa; // control point offset vertical
  var xe = x + w;           // x-end
  var ye = y + h;           // y-end
  var xm = x + w / 2;       // x-middle
  var ym = y + h / 2;       // y-middle

  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.strokeStyle = gradient;
  ctx.stroke();

  // add color gradient
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();

}

// write to file
// stream.on('data', function(chunk){
//   out.write(chunk);
// });
//
// stream.on('end', function(){
//   console.log(x, y, w, h);
//   console.log('saved png');
// });

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
