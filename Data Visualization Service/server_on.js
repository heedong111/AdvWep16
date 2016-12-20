var http = require('http');
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var session = require('express-session');
var entities = require('entities');
var PythonShell = require('python-shell');
var mysql = require('mysql');
var router = express.Router();

var bodyParser = require('body-parser')

var app = express();

var word = new Array();

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'mydb'
});
//MessagePassing to pyhton




/*
PythonShell.run('naturalize.py', options, function (err, results) {
    output += entities.decode(results.toString());
  if (err) throw err;
  console.log('results: %j\n %j', sentence, entities.decode(results));

  var http = require('http');
    http.createServer(function (request, response) {  
        response.writeHead(200, {'Content-Type' : 'text/plain'});
  //      response.write(sentence+"\n");
        response.write(results.toString());
       response.end(); 
    }).listen(8888);
});*/

app.use(express.static(__dirname + '/public'));

app.use(bodyParser());

app.use(session({
    key: 'login',
    secret : 'secret',
    resave : false,
    saveUninitialized : true
}));

app.post('/input', function(request, response, next){
    var sentence = request.body.sentence;
        sentence = sentence.replace(/\,/g,'');    //, 제거
        sentence = sentence.replace(/\[/g,'');      //[ 제거
        sentence = sentence.replace(/\]/g,'');      //] 제거
        sentence = sentence.replace(/\(/g,'');      //( 제거
        sentence = sentence.replace(/\)/g,'');      //) 제거
        sentence = sentence.replace(/\"/g,'');      //" 제거
      //  sentence = sentence.replace(/\s/g,'');      //공백 제거
        sentence = sentence.replace(/\\/g,'');      // \제거(따옴표 처리에 필요)
   console.log(sentence);
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        //encoding: 'utf8',
        args: [sentence]
    };
    PythonShell.run('naturalize.py', options, function (err, results) {
        console.log(sentence);
        if (err) throw err;
        console.log('results: %j', results);
    
        var res = entities.decode(results).toString();
        //res = res.replace(/\,/g,'');    //, 제거
        res = res.replace('b','');        //Init 제거
        res = res.replace(/\[/g,'');      //[ 제거
        res = res.replace(/\]/g,'');      //] 제거
        res = res.replace(/\(/g,'');      //( 제거
        res = res.replace(/\)/g,'');      //) 제거
        res = res.replace(/\"/g,'');      //" 제거
        res = res.replace(/\s/g,'');      //공백 제거
        res = res.replace(/\\/g,'');      // \제거(따옴표 처리에 필요)
  
        res = res.split(',');

        for (i=0; i<res.length; i++)
            console.log("RES["+i+"]:" + res[i]);
        function Word(num, morphs, part) {
            this.num = num;
            this.morphs = morphs;
            this.part = part;
            this.getInfo = getWordInfo;
        }
 
        function getWordInfo() {
            return this.morphs + '(' + this.part + ')' + ' is used \"' + this.num + '\" times';
        }

        for (i=0; i<res.length; i+=3)
        {
            word[i] = new Word(res[i], res[i+1], res[i+2]);
            console.log(word[i].getInfo());
        }
    
    });
    setTimeout(function(){response.redirect('/#contact')}, 10000);
    console.log(word);
    word = new Array();
})

app.get('/input', function(request, response, next){
    if(request.session.logined)
        response.render('../public/index.ejs',{session : request.session, result : word});
    else
        response.render('../public/index.ejs',{session : false, result : word});
})

app.get('/', function(request, response, next){
    if(request.session.logined)
        response.render('../public/index.ejs',{session : request.session, result : word});
    else
        response.render('../public/index.ejs',{session : false, result : word});
})

app.get('/login', function(request, response, next){
    if(request.session.logined)
        response.redirect('../public/index.ejs',{session : request.session, result : word});
    else
        response.render('../public/index.ejs',{session : false, result : word});
})

app.post('/login', function(request, response){
  var output='';
  var query = connection.query('select count(*) cnt from user where userid='+ mysql.escape(request.body.loginid)
  +'&& userpw=' + mysql.escape(request.body.loginpass), function(err,rows){
    console.log('rows',rows);
    cnt=rows[0].cnt;
    if(cnt==1){
      request.session.user_id = request.body.loginid;
      request.session.logined = true;
      response.render('../public/index.ejs',{session: request.session, result: []});
    }
    else {
      response.render('../public/index.ejs',{session: false, result: []});
    }
  });
})

app.post('/logout', function(request, response){
    request.session.destroy();
    response.render('../public/index.ejs',{session:false, result : []});
})

app.post('/signup', function(request, response){

  var output='';
  var query = connection.query('select count(*) cnt from user where userid =' + mysql.escape(request.body.user_id), function(err,rows){
      console.log('rows',rows);
      cnt=rows[0].cnt;

      if(cnt>0){
          console.log('id fail');
          response.render('../public/index.ejs',{session: false, result: word});
      }
      else{
          if(request.body.pass_wd == request.body.pass_ck){
                     var query = connection.query('insert into user set userid='+mysql.escape(request.body.user_id)+
                     ', userpw='+mysql.escape(request.body.pass_wd), function(err, rows){
                     if(err){
                         console.error(err);
                         throw err;
                     }
                     //console.log(query);
                     console.log('new menber signed up!');
                     response.render('../public/index.ejs',{session: false, result: word});
                 })
          }
          else{
              console.log('pw fail');
              response.render('../public/index.ejs',{session: false, result: word});
          }
      }
  })
});

app.use(function(request, response){
    fs.readFile('./public/index.ejs', 'utf8', function(error, data){
        response.writeHead(200,{'Content-Type' : 'text/html'});
        response.end(ejs.render(data));
    });
});

http.createServer(app).listen(52273, function(){
        console.log('Server on!');
});