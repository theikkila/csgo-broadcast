'use strict';

const express = require('express');
const app = express();
const swig = require('swig');
const bodyParser = require('body-parser');

/*
app.get('/', function (req, res) {
  const t = swig.compileFile(__dirname + '/views/plays.html');
  db.get('shows', (err, shows) => {
    res.send(t(shows))
  });
});
*/
app.use(bodyParser.raw({ type:'*/*',limit:'50mb',extended: true }));

app.get('/match/:token/:fragment_number/:frametype', function (req, res) {
  /*const p = 'datas/'+req.params.token+'_'+req.params.fragment_number+'_'+req.params.frametype;
  fs.exists(p, (exists) => {
    if (!exists) return res.status(404).send("not found");
    console.log("match play", req.params.token, req.params.fragment_number, req.params.frametype);
    res.setHeader('Content-Type', 'application/octet-stream')
    */
  console.log('Fragment request for',req.params.fragment_number)
  res.setHeader('Content-Type', 'application/octet-stream')
  var p = Buffer.alloc(16, 0, 'binary');
  if (req.params.frametype == 'start') {
    //console.log("starting", req.params.token, "with fragment_number", req.params.fragment_number);
    //p = fragments_start[req.params.fragment_number]
    //console.log(fragments_start[req.params.fragment_number])
    //res.write(fragments_start[req.params.fragment_number],'binary')
    p = fragments_start[req.params.fragment_number]
  }
  if (req.params.frametype == 'delta') {
    //console.log("Fragment", req.params.fragment_number, "for tick", req.query.tick);
    //p = fragments_delta[req.params.fragment_number]
    //console.log(fragments_delta[req.params.fragment_number])
    //res.write(fragments_delta[req.params.fragment_number],'binary')
    p = fragments_delta[req.params.fragment_number]
  }
  if (req.params.frametype == 'full') {
    //console.log("Fragment", req.params.fragment_number, "for tick", req.query.tick);
    //p = fragments_full[req.params.fragment_number]
    //console.log(fragments_full[req.params.fragment_number])
    //res.write(fragments_full[req.params.fragment_number],'binary')
    p = fragments_full[req.params.fragment_number]
  }
  console.log(p)
  res.write(p, 'binary');
  res.end(null, 'binary');
  //fs.createReadStream(p)
  //.pipe(res)
})

app.get('/match/:token/sync', function (req, res) {
  console.log("match sync!")
  const r = {
    tick: parseInt(syncdata["tick"]),
    rtdelay: 1,
    rcvage: 1,
    fragment: parseInt(syncdata["fragment"]),
    signup_fragment: syncdata.start,
    tps: 128,
    protocol: 4
  }
  console.log(r)
  res.send(r);
})


//  playcast "http://586f7685.ngrok.io/match/s85568392920768736t1477086968"
app.post('/reset/:token/', (req, res) => {
  //db.del(req.params.token + '-started')
  res.send("ACK");
  started = false;
  syncdata.start = null;
})

var fragments_start = {};
var fragments_full = {};
var fragments_delta = {};
var syncdata = {};
var started = false;
app.post('/:token/:fragment_number/:frametype', function (req, res) {
  console.log(req.body)
  console.log("Fragment ", req.params.frametype, req.params.fragment_number, "for tick", req.query.tick);
  if (req.params.frametype == "start") {
    syncdata.start = req.params.fragment_number
    fragments_start[req.params.fragment_number] = req.body
    started = true;
  }
  else {
    if (!started) {
      res.status(205).send("Reset");
      console.log('reset at type :', req.params.frametype)
    }
    else {
      if(req.params.fragment_number){
        syncdata["fragment"] = req.params.fragment_number
      }
      if(req.query.tick){
        syncdata["tick"] = req.query.tick
      }
      if (req.params.frametype == 'full') {
        fragments_full[req.params.fragment_number] = req.body
      }
      if (req.params.frametype == 'delta') {
        fragments_delta[req.params.fragment_number] = req.body
      }
      res.status(200).send("OK");
    }
  }
})



app.listen(3000, function () {
  console.log('CSGO broadcast server listening on port 3000!');
});
