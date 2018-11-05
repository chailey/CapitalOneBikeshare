//Parse the data and create a graph with the data.
function parseData(createGraphs) {
    Papa.parse("../data/metro-bike-share-trip-data.csv", {
        download: true,
        complete: function(results) {
            createGraphs(results.data);
        }
    });
}

//Calculates the distance between two coordinates on a map
//Inspired by the distance function here: https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
}

//All of the data analysis for the questions was done through this one function, to ensure that the for loop was only called once
//Each chart is created in separate functions called in this one
function analyzeData(data) {

    //data for question 1, chart 1-- number of instances of months from July 2016 through March 2017
    var jul16 = 0;
    var aug16 = 0;
    var sep16 = 0;
    var oct16 = 0;
    var nov16 = 0;
    var dec16 = 0;
    var jan17 = 0;
    var feb17 = 0;
    var mar17 = 0;

    //data for question 1, chart 2 -- number of instances of round trips versus one ways
    var roundTrip = 0; //number of roundtrips
    var oneWay = 0; //number of oneways

    //data for question 1, chart 3 -- the total number of bike ID's
    var bikeData = []; //just a list of bike id's

    //data for question 2 -- most popular start/stop stations
    var startingStations = [];
    var endingStations = [];
    var startEndState = [];
    var startStateCoor = new Map();
    var endStateCoor = new Map();


    //data for question 3 -- average distance. The total distance is calculated in the for-loop, then divided by data size afterwards
    var avgDist = 0;

    //data for question 4 -- the categorization of each passholder type. Generally, it is safe to say that the monthly/yearly(flex pass) passholders are regular commuters
    var numMonthly = 0;
    var numYearly = 0;
    var numWalkup = 0;


    //data for question 5, chart 1 -- the average durations for each season
    var summerDur = 0; //average duration of bike ride in the summer
    var fallDur = 0;
    var winterDur = 0;

    //data for question 5, chart 2 -- Categorization of each pass type per season
    var summerMonthly = 0; //total nummer of monthly passes in the summer
    var summerYearly = 0;
    var summerWalkup = 0;
    var fallMonthly = 0;
    var fallYearly = 0;
    var fallWalkup = 0;
    var winterMonthly = 0;
    var winterYearly = 0;
    var winterWalkup = 0;

    //data for question 5, chart 3 -- Categorization of the trip types per season
    var summerRound = 0; //total number round trips in the summer
    var summerOneway = 0;
    var fallRound = 0;
    var fallOneway = 0;
    var winterRound = 0;
    var winterOneway = 0;

    //data for question 5, chart 4 -- the ridership per season
    var summerRidership = 0;
    var fallRidership = 0;
    var winterRidership = 0;


    //data for question 6, chart 1 -- the peaks of bikes used per hour
    var hours = [];

    //data for question 6, chart 2 (map) -- the most popular starting station in AM and most popular ending station in PM
    var AMStationStarts = [];
    var PMStationEnds =[];

    //data for question 7, chart 1 -- the categorization of pass holders for round trips
    var roundTripMonth = 0;
    var roundTripYear = 0;
    var roundTripWalk = 0;

    //data for question 7, chart 2 -- the categorization of pass holders for one ways
    var oneWayMonth = 0;
    var oneWayYear = 0;
    var oneWayWalk = 0;

    //iterate through all of the data in this one for loop -- that way, we reduce time
    for (var i = 1; i < data.length; i++) {

        //grab the date
        var date = new Date(data[i][2]);

        //update the variables for question 1, chart 1
        if (date.getMonth() == 6)
            jul16 += 1;
        else if (date.getMonth() == 7)
            aug16 += 1;
        else if (date.getMonth() == 8)
            sep16 += 1;
        else if (date.getMonth() == 9)
            oct16 += 1;
        else if (date.getMonth() == 10)
            nov16 += 1;
        else if (date.getMonth() == 11)
            dec16 += 1;
        else if (date.getMonth() == 0)
            jan17 += 1;
        else if (date.getMonth() == 1)
            feb17 += 1;
        else
            mar17 += 1;

        //update the variables for question 1, chart 2
        if (data[i][12] == "Round Trip")
            roundTrip += 1;
        else
            oneWay += 1;

        //update the variables for question 1, chart 3
        bikeData.push(data[i][10]);


        //update the variables for question 2 -- MUST check if the data is Number or NOT -- this is to ensure we do not add any null values to our table
        if (!isNaN(parseInt(data[i][4])))
            startingStations.push(parseInt(data[i][4]));
        if (!isNaN(parseInt(data[i][7])))
            endingStations.push(parseInt(data[i][7]));
        if (!isNaN(parseInt(data[i][4])) && !isNaN(parseInt(data[i][7]))) {
            //set the map with Key of station ID and value of coordinate
            startStateCoor.set(parseInt(data[i][4]), [data[i][5], data[i][6]]);
            endStateCoor.set(parseInt(data[i][7]), [data[i][8], data[i][9]]);

            //For the startEndState (most popular starting/ending route), I combined the two ID's. This makes a unique key for the map.
            var startEndStr = data[i][4] + data[i][7];
            startEndState.push(parseInt(startEndStr));
        }

        //update the variables for question 3
        if (data[i][12] == "One Way")
        {
            //check the validity of the values, and clean them
            if (!isNaN(parseFloat(data[i][5])) && !isNaN(parseFloat(data[i][6]) &&
                !isNaN(parseFloat(data[i][8])) && !isNaN(parseFloat(data[i][9]))))
            {
                //calculate distance, and check the validity of the distance function
                var theDist = distance(parseFloat(data[i][5]),parseFloat(data[i][6]), parseFloat(data[i][8]), parseFloat(data[i][9]));
                if (!isNaN(theDist))
                    avgDist += theDist;
            }
        }

        //update the variables for question 4
        if (data[i][13] == "Monthly Pass")
            numMonthly = numMonthly + 1;
        else if (data[i][13] == "Flex Pass")
            numYearly = numYearly + 1;
        else
            numWalkup = numWalkup + 1;

        //update the variables for question 5
       var month = date.getMonth();
       if (month >= 6 && month <= 8) //JUL through SEP -- SUMMER
       {

           summerRidership += 1;

           if (!isNaN(parseInt(data[i][1])))
               summerDur += parseInt(data[i][1]);

           if (data[i][13] == "Monthly Pass")
               summerMonthly += 1;
           else if (data[i][13] == "Flex Pass")
               summerYearly += 1;
           else
               summerWalkup += 1;

           if (data[i][12] == "Round Trip")
               summerRound += 1;
           else
               summerOneway += 1;
       }
       else if (month >= 9 && month <= 11) //OCT through DEC -- FALL
       {
           fallRidership += 1;

           if (!isNaN(parseInt(data[i][1])))
               fallDur += parseInt(data[i][1]);

           if (data[i][13] == "Monthly Pass")
               fallMonthly += 1;
           else if (data[i][13] == "Flex Pass")
               fallYearly += 1;
           else
               fallWalkup += 1;

           if (data[i][12] == "Round Trip")
               fallRound += 1;
           else
               fallOneway += 1;
       }
       else //JAN through MAR -- WINTER
       {
           winterRidership += 1;

           if (!isNaN(parseInt(data[i][1])))
               winterDur += parseInt(data[i][1]);

           if (data[i][13] == "Monthly Pass")
               winterMonthly += 1;
           else if (data[i][13] == "Flex Pass")
               winterYearly += 1;
           else
               winterWalkup += 1;

           if (data[i][12] == "Round Trip")
               winterRound += 1;
           else
               winterOneway += 1;
       }


        //update the variables for question 6, chart 1
        var hour = date.getHours();
        hours.push(hour);

        //update the variables for question 6, chart 2
        if (hour < 12)
            if (!isNaN(parseFloat(data[i][5])) && !isNaN(parseFloat(data[i][6])))
                AMStationStarts.push([parseFloat(data[i][5]),parseFloat(data[i][6])]);
        else
            if (!isNaN(parseFloat(data[i][8])) && !isNaN(parseFloat(data[i][9])))
                PMStationEnds.push([parseFloat(data[i][8]),parseFloat(data[i][9])]);

        //update the variables for question 7
        if (data[i][12] == "Round Trip" && data[i][13] == "Monthly Pass")
            roundTripMonth += 1;
        else if (data[i][12] == "Round Trip" && data[i][13] == "Flex Pass")
            roundTripYear += 1;
        else if (data[i][12] == "Round Trip" && data[i][13] == "Walk-up")
            roundTripWalk += 1;
        else if (data[i][12] == "One Way" && data[i][13] == "Monthly Pass")
            oneWayMonth += 1;
        else if (data[i][12] == "One Way" && data[i][13] == "Flex Pass")
            oneWayYear += 1;
        else
            oneWayWalk += 1;

    }
    //update the average distance for question 3
    avgDist = avgDist/(data.length-1);

    //update the average durations for question 5
    summerDur = summerDur/summerRidership;
    fallDur = fallDur/fallRidership;
    winterDur = winterDur/winterRidership;

    //display question 3
    var averageDistance = avgDist.toFixed(3);
    var displayDistance = averageDistance.toString() + " miles"
    document.getElementById("dist").innerHTML = displayDistance;

    //FUNCTION FOR QUESTION 1, CHART 1
    var chartQ11 =  c3.generate({
        bindto: '#chartQ11',
        data: {
            columns: [
                ['Months', jul16, aug16, sep16, oct16, nov16, dec16, jan17, feb17, mar17],
            ]

        },
        axis: {
            x: {
                type : 'category',
                categories: ['Jul 16', 'Aug 16', 'Sep 16', 'Oct 16', 'Nov 16', 'Dec 16', 'Jan 17', 'Feb 17', 'Mar 17']
            }
        }

    });

    //FUNCTION FOR QUESTION 1, CHART 2
    getRouteTypes(oneWay, roundTrip);

    //FUNCTION FOR QUESTION 1, CHART 3
    getMostUsedBikes(bikeData);


    //FUNCTION FOR QUESTION 2
    getPopularStations(startingStations, endingStations, startStateCoor, endStateCoor, startEndState);
    getPassBreakdown(numMonthly, numYearly, numWalkup);

    //FUNCTION FOR QUESTION 4
    getPassBreakdown(numMonthly, numYearly, numWalkup);

    //FUNCTION FOR QUESTION 5, CHART 1
    getSeasonalDurations(summerDur, fallDur, winterDur);

    //FUNCTION FOR QUESTION 5, CHART 2
    getSeasonalPassType(summerMonthly, summerYearly, summerWalkup, fallMonthly, fallYearly, fallWalkup, winterMonthly, winterYearly, winterWalkup);

    //FUNCTION FOR QUESTION 5, CHART 3
    getSeasonalTripType(summerRound, summerOneway, fallRound, fallOneway, winterRound, winterOneway);

    //FUNCTION FOR QUESTION 5, CHART 4
    getSeasonalRidership(summerRidership, fallRidership, winterRidership);

    //FUNCTION FOR QUESTION 6, CHART 1
    getDailyPeaks(hours);

    //FUNCTION FOR QUESTION 6, MAP
    getDailyUsedStations(AMStationStarts, PMStationEnds);

    //FUNCTION FOR QUESTION 7
    getPassholderCategoryBreakdown(roundTripMonth, roundTripYear, roundTripWalk, oneWayMonth, oneWayYear, oneWayWalk);

}


//generates the chart for route types -- question 1 chart 2
function getRouteTypes(oneWay, roundTrip) {

    var chartQ12 = c3.generate({
        bindto: '#chartQ12',
        data: {
            // iris data from R
            columns: [
                ['One Way', oneWay],
                ['Round Trip', roundTrip],
            ],
            type : 'pie',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    });
}

//gets the most widely used bikes on the system -- question 1 chart 3
function getMostUsedBikes(bikesData) {
    bikesData.sort();
    var bikes = [];
    var bikeIDFreqs = [];
    bikes.push(bikesData[0]);
    bikeIDFreqs.push(1);
    for (var i = 1; i < bikesData.length; i++) {

        if (bikesData[i] != bikesData[i-1] && bikesData[i] != "" && bikesData[i] != " " && bikesData[i] != null)
        {
            bikes.push(bikesData[i]);
            bikeIDFreqs.push(1);
        }
        else
            bikeIDFreqs[bikeIDFreqs.length-1] += 1;
    }

    var bikeIDTopFive = ['BikeIDs'];
    var topFiveFreq = ['BikeIDFreqs'];

    for (var i = bikes.length-1; i >= bikes.length-5; i--)
    {
        bikeIDTopFive.push(bikes[i]);
        topFiveFreq.push(bikeIDFreqs[i]);
    }

    var chartQ13 = c3.generate({
        bindto: '#chartQ13',
        data: {
            x: 'BikeIDs',
            columns: [
                bikeIDTopFive,
                topFiveFreq
            ],
            type: 'bar',
            order: 'desc'
        },
        axis:{
            x: {
                type: 'category'
            },
            y: {
                min: 0,
                padding: {top: 0, bottom: 0}
            }
        }
    });
}


//gets the most popular stations based on station ID and a map that links station IDs with its coordinates -- question 2
function getPopularStations(startingStations, endingStations, startStateCoor, endStateCoor, startEndState) {

    var mostPopStart = math.mode(startingStations);
    var mostPopEnd = math.mode(endingStations);
    var popStartCoor = startStateCoor.get(parseInt(mostPopStart));
    var popEndCoor = endStateCoor.get(parseInt(mostPopEnd));

    var mostPopStartEnd = math.mode(startEndState).toString();
    var mostPopStartEndStart = mostPopStartEnd.substr(0,4);
    var mostPopStartEndEnd = mostPopStartEnd.substr(4,4);

    var popSESCoor = startStateCoor.get(parseInt(mostPopStartEndStart));
    var popSEECoor = endStateCoor.get(parseInt(mostPopStartEndEnd));

    var start = {lat: parseFloat(popStartCoor[0]), lng: parseFloat(popStartCoor[1])};
    var end = {lat: parseFloat(popEndCoor[0]), lng: parseFloat(popEndCoor[1])};
    var seStart = {lat: parseFloat(popSESCoor[0]), lng: parseFloat(popSESCoor[1])};
    var seEnd = {lat: parseFloat(popSEECoor[0]), lng: parseFloat(popSEECoor[1])};

    var map1 = new google.maps.Map(
        document.getElementById('map1'), {zoom: 15, center: start});
    var marker1 = new google.maps.Marker({position: start, map: map1});
    var map2 = new google.maps.Map(
        document.getElementById('map2'), {zoom: 15, center: end});
    var marker2 = new google.maps.Marker({position: end, map: map2});

    var map3 = new google.maps.Map(
        document.getElementById('map3'), {zoom: 13, center: seStart});
    var marker3 = new google.maps.Marker({position: seStart, map: map3});
    var marker4 = new google.maps.Marker({position: seEnd, map: map3});

}
//generates the breakdown of pass types -- question 4
function getPassBreakdown(numMonthly, numYearly, numWalkup) {

    var chartQ4 = c3.generate({
        bindto: '#chartQ4',
        data: {
            columns: [
                ['Monthly Pass', numMonthly],
                ['Flex Pass', numYearly],
                ['Walk-up', numWalkup]
            ],
            type : 'donut',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    });


}

//generates the seasonal duration chart -- question 5 chart 1
function getSeasonalDurations(summerDur, fallDur, winterDur)
{
    var chartQ51 =  c3.generate({
        bindto: '#chartQ51',
        data: {
            columns: [
                ['Average Duration per Season', summerDur, fallDur, winterDur],
            ]

        },
        axis: {
            x: {
                type : 'category',
                categories: ['Summer', 'Fall', 'Winter']
            }
        }

    });
}
//generates the chart for pass types -- question 5 chart 2
function getSeasonalPassType(summerMonthly, summerYearly, summerWalkup, fallMonthly, fallYearly, fallWalkup, winterMonthly, winterYearly, winterWalkup)
{
    var months = ['MonthPass', summerMonthly, fallMonthly, winterMonthly];
    var years = ['FlexPass', summerYearly, fallYearly, winterYearly];
    var walks = ['WalkUp', summerWalkup, fallWalkup, winterWalkup];
    var chart = c3.generate({
        bindto: '#chartQ52',
        data: {
            columns: [
                months,
                years,
                walks
            ],
            type: 'bar'
        },

        bar: {
            width: {
                ratio: 0.5
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: ['Summer', 'Fall', 'Winter']
            }
        }
    });

}
//Generates the chart for seasonal trip types -- question 5 chart 3
function getSeasonalTripType(summerRound, summerOneway, fallRound, fallOneway, winterRound, winterOneway)
{
    var rounds = ['RoundTrip', summerRound, fallRound, winterRound];
    var ones = ['OneWay', summerOneway, fallOneway, winterOneway];

    var chart = c3.generate({
        bindto: '#chartQ53',
        data: {
            columns: [
                rounds,
                ones
            ],
            type: 'bar'
        },

        bar: {
            width: {
                ratio: 0.5
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: ['Summer', 'Fall', 'Winter']
            }
        }
    });

}
//Generates the chart for seasonal ridership -- question 5 chart 4
function getSeasonalRidership(summerRidership, fallRidership, winterRidership) {
    var chartQ54 =  c3.generate({
        bindto: '#chartQ54',
        data: {
            columns: [
                ['Seasonal Ridership', summerRidership, fallRidership, winterRidership],
            ]

        },
        axis: {
            x: {
                type : 'category',
                categories: ['Summer', 'Fall', 'Winter']
            }
        }

    });
}

//Generates the chart for peak hours -- question 6 chart 1
function getDailyPeaks(hours) {
    var trace = {
        x: hours,
        type: 'histogram',
    };
    var data = [trace];
    Plotly.newPlot('chartQ61', data);

}


//Displays the daily most used AM Starting, PM Ending stations, on a Google Map -- question 6 map
function getDailyUsedStations(AMStationStarts, PMStationEnds) {
    var mostPopStart = math.mode(AMStationStarts);
    var mostPopEnd = math.mode(PMStationEnds);
    var startLL = {lat: mostPopStart[0], lng: mostPopStart[1]};
    var endLL = {lat: mostPopEnd[0], lng: mostPopEnd[1]};
    var map4 = new google.maps.Map(
        document.getElementById('map4'), {zoom: 13, center: startLL});
    var marker1 = new google.maps.Marker({position: startLL, map: map4, label: "Sam"});
    var marker2 = new google.maps.Marker({position: endLL, map: map4,  label: "Epm"});
}


//Generate the breakdown of pass type - trip type charts -- question 7 both charts
function getPassholderCategoryBreakdown(roundTripMonth, roundTripYear, roundTripWalk, oneWayMonth, oneWayYear, oneWayWalk) {

    var chartQ71 = c3.generate({
        bindto: '#chartQ71',
        data: {
            columns: [
                ['Round Trip + Monthly Pass', roundTripMonth],
                ['Round Trip + Flex Pass', roundTripYear],
                ['Round Trip + Walk-up', roundTripWalk]
            ],
            type : 'donut',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    });
    var chartQ72 = c3.generate({
        bindto: '#chartQ72',
        data: {
            columns: [
                ['One Way + Monthly Pass', oneWayMonth],
                ['One Way + Flex Pass', oneWayYear],
                ['One Way + Walk-up', oneWayWalk]
            ],
            type : 'donut',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    });

}

//Creates all the graphs
function createGraphs(data) {
    analyzeData(data);
}


parseData(createGraphs);