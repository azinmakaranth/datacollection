//const db = require('./database.js');
const mysql = require('mysql');
const crypto = require('crypto');
var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123',
  database : 'dsalt'
});

function getCat(x) {
  return new Promise( function(resolve, reject) {
         con.query(`SELECT category FROM seed_map WHERE row_id='${x+1}'`, function (error, cat, fields) {
            if (error) throw error;
            con.query(`SELECT count(${cat[0].category}) cnt FROM seeds_warehouse`, function (error, results, fields) {
               if (error) throw error;
               resolve(results[0].cnt);
            });
         });
  });
}
function getCat2(x,y) {
  return new Promise( function(resolve, reject) {
         con.query(`SELECT category FROM seed_map WHERE row_id='${x+1}'`, function (error, cat, fields) {
            if (error) throw error;
            con.query(`SELECT ${cat[0].category} as s FROM seeds_warehouse WHERE seq_no = '${y}'`, function (error, seed, fields) {
               if (error) throw error;
               if(typeof seed[0] == "undefined")
                    resolve("");
               else
                    resolve(seed[0].s);
            });
         });
  });
}
function hashGen(secret,salt,bits) {
  return new Promise( function(resolve, reject) {
    crypto.pbkdf2(secret, salt, 100000, bits, 'sha512', (err, derivedKey) => {
       if (err) throw err;
          resolve(derivedKey.toString('hex'));
       });
  });
}
const reducer = (accumulator, currentValue) => accumulator + parseInt(currentValue,10);
//uname,password,login_time,
var salt_hash_gen = (password,login_time,color1,color2) => {
return new Promise( function(resolve, reject){
  var x1 = color1;
  var x3 = color2;
  var x2 = x1 + x1 + x3;
  if( x2 > 20 )
         x2 = x2 % 20;
  else if( x2 == 20)
         x2 = 20;
  else
        x2 = x1+x1+x3;
  x4 = x3 + (x1*x3);
  if( x4>20 )
        x4 = x2%20;
  else if( x4 == 20)
        x4=20;
  else
        x4 = x3 + (x1*x3);
  var  len = [];
  getCat(x1)
    .then((results) => {
          len[0] = results;
          return getCat(x2);
     } )
     .then((results) => {
           len[1] = results;
           return getCat(x3);
      })
      .then((results) => {
            len[2] = results;
            return getCat(x4);
       })
       .then((results) => {
             len[3] = results;
            // console.log(len);
             var y1 = Math.max(...len);

             //console.log(d + '=  Time');
             var totTime = Array.from(login_time).reduce(reducer,0);
             //console.log(totTime+'=Time Sum');
             var y = y1 * totTime;// console.log(y);
             var y11,y12,y23,y24;
             if(y1 > len[0] )
                  y11= y1 % len[0];
             else if(y1 == len[0])
                  y11=len[0];
             else
                 y11 = y1;
             if(y1 > len[1] )
                 y12= y1 % len[1];
             else if(y1 == len[1])
                 y12=len[1];
             else
                 y12 = y1;
             y23 = y % len[2];// console.log(y23 + '=' + y +'%'+ len[2]);
             y24 = y % len[3];// console.log(y24 + '=' + y +'%'+ len[2]);
             seeds = [];
             getCat2(x1,y11)
               .then((seed) => {
                     seeds[0] = seed;
                     return getCat2(x2,y12);
                } )
                .then((seed) => {
                      seeds[1] = seed;
                      return getCat2(x3,y23);
                 })
                 .then((seed) => {
                       seeds[2] = seed;
                       return getCat2(x4,y24);
                  })
                  .then((seed) => {
                        seeds[3] = seed;
                        var salt = seeds[0] + seeds[2] + seeds[1] + seeds[3]
                        //console.log(salt);
                        hashGen(password,salt,16) // pass,salt,bit
                        .then((key)=>{
                           resolve(key);
                        });
                 });

      });

   });
}
/*
salt_hash_gen('','','',3,1).
then((key)=>{
  salt_hash_gen('','','',3,1).
  then((key1)=>{
             if(key1 == key)
                console.log("yeeeyi");
  });
}); */



function updatedb(name, email, login_time, hash){
  con.query(`INSERT INTO name_time_warehouse(uname,email,logintime) VALUES('${name}','${email}','${login_time}')`, function (error, res1, fields) {
     if (error)
        console.log(`INSERT INTO name_time_warehouse(uname,email,logintime) VALUES('${name}','${email}','${login_time}')`);;
      con.query(`SELECT uid FROM name_time_warehouse WHERE uname='${name}' AND email='${email}'`, function (error, res2, fields) {
      if (error)
           console.log(`SELECT uid FROM name_time_warehouse WHERE uname='${name}' AND email='${email}'`);;
        con.query(`INSERT INTO hash_warehouse(uid,hashval) VALUES('${res2[0].uid}','${hash}')`, function (error, res3, fields) {
           if (error)
               console.log(`INSERT INTO hash_warehouse(uid,hashval) VALUES('${res2[0].uid}','${hash}')`);;

        });
     });
  });
}

function check_hash(uname, password, color1, color2){
  return new Promise( function(resolve, reject){
    con.query(`SELECT uid,logintime FROM name_time_warehouse WHERE uname='${uname}'`, function (error, row, fields) {
       if (error) throw error;
       salt_hash_gen(password,row[0].logintime,color1,color2).
       then((key)=>{
            con.query(`SELECT hashval FROM hash_warehouse WHERE uid='${row[0].uid}'`, function (error, hash, fields) {
             if (error) throw error;
                console.log(key,hash[0].hashval);
                if(key === hash[0].hashval)
                  resolve();
                else
                  reject();
             });
       });
    });
  });
}

module.exports = {
  updatedb, //updatedb(name, email, login_time, hash)
  salt_hash_gen, //  (password,login_time,color1,color2)
  check_hash //check_hash(uname, password, color1, color2, hash)
};
