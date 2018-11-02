function placeservice(self) {
    let option = self.selectedFilter();
    if(option == 'Other') {
        option = self.otherFilter();
    }
    // emptying result ko.observableArray for every search
    self.result.removeAll();
    placesList = [];
    // let results;

    let foursquare_data = getClient();
    
    let url = 'https://api.foursquare.com/v2/venues/search?';
    foursquare_data['query'] = option;
    foursquare_data['ll'] = getLatLng();
    console.log(foursquare_data)
    $.ajax({
        url: url,
        data: foursquare_data,
        success: function(results) {
            let venuesId = getVenueID(results);
            getVenueDetail(venuesId, self, function() {
                createLocalStorage(function() {
                    createMarkers();
                });
            });
        }
    });

}

function getVenueID(results) {
    results = results.response.venues;
    let venueId = [];
    results.forEach(function(venue) {
        venueId.push(venue.id);
    });
    return venueId;
}

function getVenueDetail(venuesId, self, callback) {
    venuesId.forEach(function(venue, arr_index) {
        let url = 'https://api.foursquare.com/v2/venues/' + venue;
        let data = getClient();
        $.ajax({
            url: url,
            data: data,
            success: function(result, index) {
                console.log(result)
                let venueDetail = filterVenueDetail(result.response.venue);
                console.log(venueDetail)
                self.result.push(venueDetail);
                placesList.push(venueDetail);
                
                // callback to function createLocalStorage()
                if(placesList.length == venuesId.length) {
                    callback();
                }
            }
        })
    });
}

function filterVenueDetail(detail) {
    let venue = {
        name: detail.name,
        fav: false
    };
    if(detail.rating == undefined) {
        // if their is no rating for the place
        venue['rating'] = 0.0;
    }
    else {
        venue['rating'] = detail.rating;
    }

    venue['location'] = new google.maps.LatLng(
        parseFloat(detail.location.lat),
        parseFloat(detail.location.lng)
    );
    venue['address'] = detail.location.formattedAddress.join();
    if(detail.photos.count != 0) {
        venue['photo'] = detail.bestPhoto.prefix + '250x250' + detail.bestPhoto.suffix;
    }
    else {
        venue['photo'] = 'Photo_404';
    }
    return venue;
}

function getClient() {
    // return the client
    return {
        "client_id": "UCYDAVG2AIIJYWLGD5BHIGK1AXQMNTFM0QXIMACI5JURUAL1",
        "client_secret": "M0QXXUESLTJ0GN52DCVDSKJLVNMF20X1VSLCKC434T00Z1AP",
        "v": "20180323"
    }
}

function getLatLng() {
    return ll.lat() + ',' + ll.lng();
}