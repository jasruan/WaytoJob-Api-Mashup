"use strict";
(function(){
    //all variables
var map,infowindow;
var markers=[];
var ctx, canvas;
var API_URL="https://cors-anywhere.herokuapp.com/http://api.indeed.com/ads/apisearch?publisher=";
var API_KEY="1759705264997827";
var API_URLMID="&q=&l="
var API_URLEND="&sort=&format=json&radius=&st=&jt=&start=&limit=";
    //initialize everything 
function init(){
    canvas=document.querySelector('canvas');
    canvas.width=600;
    canvas.height=108;
    ctx=canvas.getContext('2d');
    bannerPlace();
    initMap();
    document.getElementById('search').onkeypress=function(e){
    var textArea = document.getElementById('search').value;
        //handle if press enter button will be equivalent to pressing a button
        if(e.keyCode==13){
            if(textArea===""){
                alert("Please Enter a Location");
                clearMarkers();
            }
            else
                getData();
                clearMarkers();
        }
    };
            document.getElementById('submit').onclick=function(){
                getData();
                clearMarkers();
            };
    //end of it
        }// end of init
    //addmarker on map and make infowindow based on passed lat and long params
         function addMarker(latitude, longitude, title){
          var position={lat:latitude, lng:longitude};
          var marker=new google.maps.Marker({position:position, map:map});
          marker.setTitle(title);
            google.maps.event.addListener(marker, 'click',function(e){
            makeInfoWindow(this.position, this.title);
            zoomOnFirstResult();
            });
             markers.push(marker);
       }
    //makes the infowindow
 function makeInfoWindow(position,msg){
              if(infowindow)infowindow.close();
              infowindow=new google.maps.InfoWindow({
                  map:map,
                  position:position,
                  content:"<b>"+msg+"</b>"
              });
          } 
    //clear markers on the page
      function clearMarkers(){
          if(infowindow)infowindow.close();
          for(var i=0; i<markers.length; i++){
          markers[i].setMap(null);
          }
          markers=[];
      }
      function zoomOnFirstResult(){
          if(markers.length==0)return;
          map.panTo(markers[0].position);
          map.setZoom(10);
      }
function initMap(){
    //check if geolocation is supported by this browser, **this is extra technology**
    if("geolocation" in navigator){
        //if so, make success function that will be called later to retrieve location
       var success = function success(position){
        var geocoder= new google.maps.Geocoder(); //use google.maps geocoder
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var latlng = new google.maps.LatLng(latitude, longitude);
           //converts the latitude and longitude that's retrieved to a state name
        geocoder.geocode({'latLng': latlng}, function(results, status){
            var result = results[0];
            var state='';
            for(var i =0, len=result.address_components.length; i<len; i++){
            var ac = result.address_components[i];
                if(ac.types.indexOf('administrative_area_level_1') >= 0) {
                state = ac.long_name;
                }
            }
            //sticks it into the textbox after it gets retrieved
             document.querySelector('#search').value = state;
        });
           //see your own location with the marker
        addMarker(latitude, longitude, 'Your Location');
       
    };
        //calls the error function when unable to retrieve the location
    var error = function(){
        alert("Unable to retrieve your location");
    };
    navigator.geolocation.getCurrentPosition(success, error);
    }
    else
        //if the geolocation is not supported in this browser call this alert. 
     alert('Geolocation is not supported on this browser!');
    //default options no markers are added
    var mapOptions={ zoom:7, center:{lat:43.083848, lng:-77.6799}};
    map = new google.maps.Map(document.getElementById('jobMap'), mapOptions);
    
    
}
//the way to job banner is drawn here! 
function bannerPlace(){
    ctx.fillStyle="#516f8d";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    var banner = new Image();
    banner.src="banner.png";
    ctx.drawImage(banner,30,33);
    ctx.save();
    ctx.font="40px Fjalla One";
    ctx.fillStyle="white";
    ctx.fillText("Way to Job",120,82);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle="white";
    ctx.lineWidth=2;
    ctx.strokeRect(110,-10,280,250);
    ctx.restore();
}
//connect to the API 
//retrieves the data that's inputted and calls for a json file from it
//based on the location and handles the radio buttons which changes the limit field
function getData(){
    var url=API_URL + API_KEY + API_URLMID;
    var textArea = document.querySelector('#search').value;
    //for checking which radio button was checked
    var limit="";
    var resultShow = document.getElementsByName('limit');
    for(var i=0; i<resultShow.length; i++){
        if(resultShow[i].checked)
            limit=resultShow[i].value;
    }
    
    textArea=textArea.trim();
    if(textArea.length<1)return;
    textArea=encodeURI(textArea);
    $("#jobResults").hide().fadeIn(1000);
    url+=textArea + API_URLEND + limit +"&fromage=&filter=&latlong=1&co=us&chnl=&userip=1.2.3.4&useragent=&v=2";
    $.ajax({
    dataType: "jsonp",
    url:url,
    type:'GET',
    success:loadData
    });
   
}
      //read from apis                    
function loadData(obj){
                var html="";
                 var allJobs = obj.results;
                var totalResults= obj.totalResults;
                if(totalResults===0){
                    alert('No results found, try again with a different or valid location.');
                }
                else 
                html+= "<h3> There are a total of: " + totalResults+ " jobs.</h3>";
                for(var i=0; i<allJobs.length;i++){
                     var jobCompany = allJobs[i].company;
                    var jobTitle = allJobs[i].jobtitle;
                    var snippet = allJobs[i].snippet;
                    var latitude = Number(allJobs[i].latitude);
                    var longitude = Number(allJobs[i].longitude);
                    var link = allJobs[i].url;
                    var loc = allJobs[i].formattedLocation;
                    var formedDate = allJobs[i].formattedRelativeTime;
                    if(latitude && longitude){
                        //if the latitude is not null then add a marker for them
                        addMarker(latitude,longitude,"<a href=" +link+">" + jobCompany+ "</a>");
                    }
                    var date = allJobs[i].date;
                    //concetenate everything
                    html +="<a href=" +link+"><h2>" + jobCompany+ "</h2></a>";
                    html +="<p>" + jobTitle+ "</p>";
                    html+="<p><i>" + loc + "</i></p>"; 
                    html +="<p>" + snippet+ "</p>";
                    html +="<p><i>"+ date+"</i></p>"; 
                    html+="<p><i> Formed: " + formedDate + "</i></p>"; 
                    html+="<hr>";
                }
             document.querySelector("#jobResults").innerHTML= html;
            $("#jobResults").fadeIn(1000);
        }
           
})();