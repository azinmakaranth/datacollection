const db = require('./database.js');
const levenshtein = require('js-levenshtein');
let louvain = require('./jLouvain');
const fs = require('fs');
// Fuctions to Assist Matte Functions Calculations...
var comp = (password)=>{
  var n = 0;
     if(/[A-Z]/.test(password))
        n++;
     if(/[a-z]/.test(password))
        n++;
     if(/\d/.test(password))
        n++;
     if(/[^A-Za-z0-9]/.test(password))
        n++;
     return(n);
}
var alt = (password) => {
   var n = 0;
   pArray = password.split("");
   for(var i =0; i<pArray.length-1; i++){
     if(pArray[i] != pArray[i+1])
         n++;
   }
   return n;
}
var capsFreq = (password) => {
  var n = 0;
  pArray = password.split("");
    pArray.forEach((item)=>{
      if(/[A-Z]/.test(item))
        n++;
    });
  return(n);
}
var smallFreq = (password) => {
  var n = 0;
  pArray = password.split("");
    pArray.forEach((item)=>{
      if(/[a-z]/.test(item))
        n++;
    });
    return(n);
}
var digitFreq = (password) => {
  var n = 0;
  pArray = password.split("");
    pArray.forEach((item)=>{
      if(/\d/.test(item))
        n++;
    });
  return(n);
}
var symFreq = (password) => {
  var n = 0;
  pArray = password.split("");
    pArray.forEach((item)=>{
      if(/[^A-Za-z0-9]/.test(item))
        n++;
    });
  return(n);
}
var getlCS = (pass1,pass2) => {
    var LCS = require('lcs');
    var lcs = new LCS(pass1, pass2);    
  return(lcs.getLength());
}
var struct = (pass)=>{
  pass = pass.split("");
  var s = "";
  pass.forEach((item)=>{
    if(/[A-Z]/.test(item))
        s+='U';
     if(/[a-z]/.test(item))
        s+='L';
     if(/\d/.test(item))
        s+='D';
     if(/[^A-Za-z0-9]/.test(item))
        s+='D';
  });
  return s;
}
//Calculations of All Those Freaking F*cking Fucktions given in that fucking PDFuck..........
var f1 = (pass1,pass2)=> (1-Math.abs(    (pass1.length-pass2.length)/(Math.max(pass1.length,pass2.length))    ));
var f2 = (pass1,pass2)=> (1-(Math.abs(    (comp(pass1)-comp(pass2)) / (  4  ) ) ) );
var f3 = (pass1,pass2)=> (1-(Math.abs(    (alt(pass1)/(pass1.length-1)) - (alt(pass2)/(pass2.length-1))     ) ) );
var f4 = (pass1,pass2)=> (1-(Math.abs(    capsFreq(pass1) - capsFreq(pass2)     ) ) );
var f5 = (pass1,pass2)=> (1-(Math.abs(    smallFreq(pass1) - smallFreq(pass2)     ) ) );
var f6 = (pass1,pass2)=> (1-(Math.abs(    digitFreq(pass1) - digitFreq(pass2)     ) ) );
var f7 = (pass1,pass2)=> (1-(Math.abs(    symFreq(pass1) - symFreq(pass2)     ) ) );
var f8 = (pass1,pass2)=> ( 1 - ( getlCS(pass1,pass2) / Math.min(pass1.length,pass2.length) ) );
var f9 = (pass1,pass2)=> ( 1 - ( levenshtein(pass1,pass2) / Math.max(pass1.length,pass2.length) ) );
var f10 = (pass1,pass2)=> (1- (Math.abs(    ( alt(struct(pass1))/ (pass1.length-1) ) - ( alt(struct(pass2))/ (pass2.length-1) )     ) ) );
var f11 = (pass1,pass2)=> (1- (Math.abs(    ( getlCS( struct(pass1),struct(pass2) ) / Math.min(pass1.length,pass2.length) )     ) ) );
var f12 = (pass1,pass2)=> ( 1 - ( levenshtein(struct(pass1),struct(pass2)) / Math.max(pass1.length,pass2.length) ) );
var fArray = [f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12]
var w = [1,1,1,1,1,1,1,1,1,1,1,1];
//Function Tht Calculates D .... Reference Page Number 9 ............
var f = (pass1,pass2) => { 
  //var v = f1(pass1,pass2) + f2(pass1,pass2) + f3(pass1,pass2) + f4(pass1,pass2) + f5(pass1,pass2) + f6(pass1,pass2) + f7(pass1,pass2) + f8(pass1,pass2) + f9(pass1,pass2) + f10(pass1,pass2) + f11(pass1,pass2) + f12(pass1,pass2);
  var v = 0.0;
  for( var i=0; i<12 ;i++)
      v+= Math.pow(fArray[i](pass1,pass2),2)*w[i];  
  return Math.sqrt(v);  
}
//graph Creation...
var node_data = [],edge_data = [];
var addNode = (id,pass)=>{
  fs.readFile('node_data.json', (err, data) => {  
    if (err) throw err;
    node_data = JSON.parse(data);
    fs.readFile('edge_data.json', (err, data) => {  
      if (err) throw err;
      edge_data = JSON.parse(data);
      var q = "select * from pass where id != '"+id+"'";
      db.con.query(q, (error,result,fields) => {
      if (error) throw error;
      if(result){
         node_data.push(id);
         result.forEach((item)=>{
            var d = f(pass,item.pass);
            edge_data.push({ source : id, target : item.id, weight :d});
         }); 
         fs.writeFile('edge_data.json', JSON.stringify(edge_data, null, 2), (err) => {  
          if (err) throw err;
         });
         fs.writeFile('node_data.json', JSON.stringify(node_data, null, 2), (err) => {  
          if (err) throw err;
         });
        }
      }); 
   });
 });
}
function sortObject(obj) {
  var arr = [];
  var prop;
  for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
          arr.push({
              'key': prop,
              'value': obj[prop]
          });
      }
  }
  arr.sort(function(a, b) {
      return a.value - b.value;
  });
  return arr; // returns array
}

var comDet = ()=>{
  return new Promise( function(resolve, reject){
  fs.readFile('node_data.json', (err, ndata) => {  
    fs.readFile('edge_data.json', (err, edata) => {  
      node_data = JSON.parse(ndata);
      edge_data = JSON.parse(edata);
      var community = jLouvain().nodes(node_data).edges(edge_data);
      var result  = community();
      console.log(result,'CommunityLouvianResult');
      result = sortObject(result);
      result = result[0].key;
      resolve(result); 
    });
  });
 });
}                                                                                                                          

var processAndUpdateTable = (password,pid) => {
  var passArray = password.split("");
  return new Promise( function(resolve, reject){
    passArray.forEach( e => {
       if(/[a-z]/.test(e)){
        var q = "UPDATE freqtabsmall SET freq = freq+1 where symbol = '"+e+"';";
        db.con.query(q, (error) => {
        if (error) throw error;
        console.log("Executed Query :- "+ q +" "+ e );
        });
       }
       else if(/[A-Z]/.test(e)){
        var qu = "UPDATE freqtabcap SET freq = freq+1 where symbol = '"+e+"';";
        db.con.query(qu, (error) => {
        if (error) throw error;
        console.log(`Executed Query :- ${qu}`);
        });
       }
       else if(/[0-9]/.test(e)){
        var quer = "UPDATE freqtabnum SET freq = freq+1 where symbol = '"+e+"';";
        db.con.query(quer, (error) => {
        if (error) throw error;
        console.log(`Executed Query :- ${quer}`);
        });
       }
       else{
        var que = "UPDATE freqtab SET freq = freq+1 where symbol = '"+e+"';";
        db.con.query(que, (error) => {
        if (error) throw error;
        console.log(`Executed Query :- ${que}`);
        });
       } 
    });
    var q1 = "insert into pass(pass,pid) values('"+password+"',"+pid+");";
        db.con.query(q1, (error) => {
        if (error) console.log(q1);
        var qw = "select id from  pass where pass = '"+password+"';";
        db.con.query(qw, (error,r) => {
        if (error) throw error;
              addNode(r[0].id,password);
        });
    });
    resolve();
  });
}

module.exports = {
  processAndUpdateTable,
  comDet
}

