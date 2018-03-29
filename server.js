const hs = require('./helpServer.js');
const db = require('./database.js');
const processPass = require('./processPass');

const express = require('express');
const ejs = require('ejs');
const hg = require('./hashgen.js');
let date = require('date-and-time');

const port = process.env.PORT || 8080;

var app =express();
app.set('view engine','ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static(__dirname + '/views/public'));
app.get('/check',function(req,res){
  db.con_dh.query("select count(username) cnt from pwdrepoheimdall where username = '"+req.query.uname+"'",(error,u,f)=>{
    if(error) throw error
     if(u[0].cnt == 0)
       res.send('Valid Username');
     else 
       res.send('Invalid Username');
  })
})
app.get('/',function(req,res) {
    var y =Math.random();
    if(y<0.5)
     y =Math.floor(y)
    else
     y= Math.ceil(y)
  if(y==0){  
    hs.exploration().then((val)=> {
      res.render('form',{
        insym : val[0],
        inchar : val[1],
        avchar : val[2],
        innum : val[3],
        pid : val[4]
      });
    });
  }
  else{ 
    processPass.comDet().then((r)=>{
      db.con.query('select pid,count(pid) cnt from pass group by pid order by cnt',(error,r,f)=>{
        if(error) throw error;
           db.con.query("select * from  policytab where id = "+r[0].pid,(error,v,f)=>{
            
            res.render('form',{
              insym : { e1 : v[0].insym1, e2 : v[0].insym2},
              inchar : { e1 : v[0].inchar1, e2 : v[0].inchar2},
              avchar : { e1 : v[0].avchar1, e2 : v[0].avchar2},
              innum : { e1 : v[0].innum1, e2 : v[0].innum2},
              pid : v[0].id
            }); 
           })
       });
     });
   } 
   
});

  

app.post('/postdata',function(req,res){
  
  var uname = req.body.uname;
  var pass_new = req.body.pwd_new;
  var pass_old = req.body.pwd_old;
  var pid = parseInt(req.body.pid);
  var color1 = parseInt(req.body.color1);
  var color2 = parseInt(req.body.color2);

  if(uname == '' || pass_new == '' || color1 == '' || color2 == '' || pid == '' || pass_old == '') // 
    res.send('<body style="background-color:#9b59b6;">Please Enter Some Valid Data <br><a href = "/">SafePlace</a>')
  else
  {
     let now = new Date();
     var login_time = date.format(now, 'YYYYMMDDHHmm');
     hg.salt_hash_gen(pass_new,login_time,color1,color2)
       .then( (key) => {
          //  hg.updatedb(uname,email,login_time,key);
          processPass.processAndUpdateTable(pass_new,pid).then(() => {} );
          db.con_dh.query("insert into pwdrepoheimdall(username,pass,hash) values('"+uname+"','"+pass_new+"','"+key+"')",(error)=>{
            if(error) throw error;
          });
          hg.hashGen(pass_old,'saltUsualsalt',16)
          .then((key)=>{
             db.con_dh.query("insert into pwdrepo(username,pass,hash) values('"+uname+"','"+pass_old+"','"+key+"')",(error)=>{
              if(error) throw error;
            }) 
           }) 
          res.send('<center> THANK YOU for your response <br><a href = "/">SafePlace</a><center>')
     });
      
  }
});

app.listen( port ,()=> console.log( 'Server Is Up @localhost:'+port+'/' ));