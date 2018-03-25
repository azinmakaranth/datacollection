(function ($) {
    $(function () {

        //initialize all modals           
        $('.modal').modal();

        //now you can open modal from code
        //$('#modal1').modal('open');

        //or by click on trigger
        $('.trigger-modal').modal();

    }); // end of document ready
})(jQuery);

function count(){
    var val = document.getElementById('pass1').value;
    if(val.length<7){
        document.getElementById('pd_1').innerHTML = "Password (min 7 character)";
        document.getElementById('pd_1').style.color = "red";
    }
    else{
        document.getElementById('pd_1').innerHTML = "Password";
        document.getElementById('pd_1').style.color = "#26a69a";
    }
}

function form1_sent() {
    var xhttp = new XMLHttpRequest();
    var uname = document.getElementById("name1").value;
    var pass = document.getElementById("pass1").value;

    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        document.getElementById("modal1").innerHTML = '<div class="input-field col s12"><center>'+this.responseText+'</center></div><br><br><br>'
        //document.getElementById("modal1").style.display = "none";
        
     }
   };
   xhttp.open("POST", "post_ord", true);
   xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   xhttp.send("uname="+uname+"&pass="+pass);
 }
 function form2_sent() {
    var xhttp = new XMLHttpRequest();
    var uname = document.getElementById("name").value;
    var pass = document.getElementById("pass").value;
    var pid = document.getElementById("pid").value;

    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        document.getElementById("modal2").innerHTML = '<div class="input-field col s12"><center>'+this.responseText+'</center></div><br><br><br>'
        //document.getElementById("modal1").style.display = "none";
        
     }
   };
   xhttp.open("POST", "post_", true);
   xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   xhttp.send("uname="+uname+"&pass="+pass+"&pid="+pid);
 }