function Map()
{
}

/**
 * Display the map showing the user position or the latter and the home position
 */
Map.displayMap = function(userPosition, homePosition)
{
   var userLatLng = null;
   var homeLatLng = null;

   if (userPosition != null)
      userLatLng = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
   if (homePosition != null)
      homeLatLng = new google.maps.LatLng(homePosition.position.latitude, homePosition.position.longitude);

   var options = {
      zoom: 20,
      disableDefaultUI: true,
      streetViewControl: true,
      center: userLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
   }

   var map = new google.maps.Map(document.getElementById('map'), options);
   var marker = new google.maps.Marker({
      position: userLatLng,
      map: map,
      title: 'Your position'
   });
   // If homeLatLng is null means that the function has been called when the
   // user set his current position and that is when he parked the home so the
   // icon will be shown accordingly.
   if (homeLatLng == null)
      marker.setIcon('images/home-marker.png');
   else
      marker.setIcon('images/user-marker.png');
   var circle = new google.maps.Circle({
      center: userLatLng,
      radius: userPosition.coords.accuracy,
      map: map,
      fillColor: '#70E7FF',
      fillOpacity: 0.2,
      strokeColor: '#0000FF',
      strokeOpacity: 1.0
   });
   map.fitBounds(circle.getBounds());

   if (homeLatLng != null)
   {
      marker = new google.maps.Marker({
         position: homeLatLng,
         map: map,
         icon: 'images/home-marker.png',
         title: 'Home position'
      });
      circle = new google.maps.Circle({
         center: homeLatLng,
         radius: homePosition.position.accuracy,
         map: map,
         fillColor: '#70E7FF',
         fillOpacity: 0.2,
         strokeColor: '#0000FF',
         strokeOpacity: 1.0
      });

      // Display route to the home
      options = {
         suppressMarkers: true,
         map: map,
         preserveViewport: true
      }
      this.setRoute(new google.maps.DirectionsRenderer(options), userLatLng, homeLatLng);
   }

   $.mobile.loading('hide');
}

/**
 * Calculate the route from the user to his home
 */
Map.setRoute = function(directionsDisplay, userLatLng, homeLatLng)
{
   var directionsService = new google.maps.DirectionsService();
   var request = {
      origin: userLatLng,
      destination: homeLatLng,
      travelMode: google.maps.DirectionsTravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC
   };

   directionsService.route(
      request,
      function(response, status)
      {
         if (status == google.maps.DirectionsStatus.OK)
            directionsDisplay.setDirections(response);
         else
         {
            navigator.notification.alert(
               'Unable to retrieve a route to your home. However, you can still find it by your own.',
               function(){},
               'Warning'
            );
         }
      }
   );
}

/**
 * Request the address of the retrieved location
 */
Map.requestLocation = function(position)
{
   new google.maps.Geocoder().geocode(
      {
         'location': new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      },
      function(results, status)
      {
         if (status == google.maps.GeocoderStatus.OK)
         {
            var positions = new Position();
            positions.updatePosition(0, positions.getPositions()[0].coords, results[0].formatted_address);
         }
      }
   );
}