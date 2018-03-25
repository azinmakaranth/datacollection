const db = require('./database.js');
const rn = require('random-number');
const promise = require('promise');

var includechar,avoidchar;
var includesym = {
  e1 : '',
  e2 : ''
};

var includeSymbols  = function(){
  return new Promise( function(resolve, reject){
    db.con.query("select * from freqtab order by freq limit 2;",(error,result,field) => {
        if(error) throw error;
        includesym = {e1 : result[0].symbol, e2 : result[1].symbol};
        resolve(includesym);
      });
 });
}
var includeNums  = function(){
    return new Promise( function(resolve, reject){
      db.con.query("select * from freqtabnum order by freq limit 2;",(error,result,field) => {
          if(error) throw error;
          includenum = {e1 : result[0].symbol, e2 : result[1].symbol};
          resolve(includenum);
        });
   });
  }
var includeChars  = function(){
    return new Promise( function(resolve, reject){
      db.con.query("select * from freqtabcap order by freq limit 1;",(error,result,field) => {
          if(error) throw error;
          db.con.query("select * from freqtabsmall order by freq limit 1;",(error,resultsmall,field) => {
            if(error) throw error;
            result = result.concat(resultsmall);   
            includechar = {e1 : result[0].symbol, e2 : result[1].symbol};
            resolve(includechar); 
          });
        });
   });
}
var avoidChar = function(){
    return new Promise( function(resolve, reject){
        db.con.query("select * from freqtabcap order by freq desc limit 1;",(error,result,field) => {
            if(error) throw error;
            db.con.query("select * from freqtabsmall order by freq desc limit 1;",(error,resultsmall,field) => {
              if(error) throw error;
              result = result.concat(resultsmall);   
              avoidchar = {e1 : result[0].symbol, e2 : result[1].symbol};
              resolve(avoidchar); 
            });
          });
     });
}
var exploration = function(){
    return new Promise( function(resolve, reject){
    includeSymbols()
    .then((insym) => {
         includeChars()
         .then((inchar) => {
            avoidChar()
            .then((avchar) =>{
              includeNums()
              .then((innum) => {
                db.con.query("insert into policytab(inchar1,inchar2,insym1,insym2,innum1,innum2,avchar1,avchar2) values('"+inchar.e1+"','"+inchar.e2+"','"+insym.e1+"','"+insym.e2+"','"+innum.e1+"','"+innum.e2+"','"+avchar.e1+"','"+avchar.e2+"');",(error) => {
                  if(error) throw error;
                  db.con.query("select id from policytab order by id desc;",(error,res) => {
                    if(error) throw error;
                    resolve([includesym,includechar,avoidchar,includenum,res[0].id]);            
                  });      
                });  
              });
        });  
    });
 });
});
}

module.exports = {
  exploration
};
