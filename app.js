var table = document.getElementById("prayerTimeTable")
getData().then(function(res){
    const foundDates = findDates(res);
    if(foundDates != 0){
        setDatesValues(foundDates)
    }else{
        console.log("No dates can be loaded")
    };

})

//returns all dates in timesheet as objects and current date object
async function getData() {
    let timeSheetArray = []
    const currentDate= new Date()    

    const response = await fetch("August_2021_Timetable.csv");
    const data = await response.text();
    
    const table = data.split("\n").slice(2);

    for (let row = 0; row < table.length; row++) {
        const column = table[row].split(",");
        const date = column[0]
        const fajrEnd = column[2]

        //Convert table date string into date object
        fajrSplit = fajrEnd.split(":")
        dateSplit = date.split("/")
        //date format (Year/Month/Day/FajrEndHour/FajrEndMinute)
        const tableDate = new Date(dateSplit[2], dateSplit[1]-1, dateSplit[0], fajrSplit[0], fajrSplit[1])

        let timesheet = {
            date : tableDate,
            fajrStart : column[1],
            fajrEnd : column[2],
            zuhr : column[3],
            asr : column[4],
            maghrib : column[5],
            isha : column[6]
        }

        timeSheetArray.push(timesheet)
    }
return {timeSheetArray: timeSheetArray, currentDate : currentDate}
}
//return current date of the dates in timesheet
function findDates(res){
    var previousTimeSheet = 0;
    var currentTimeSheet = 0;
    var nextTimeSheet = 0;
    const timeSheetArray = res.timeSheetArray;
    const currentDate = res.currentDate;
    
    for (let i = 0; i < timeSheetArray.length; i++) {
        // Old if statement condition if new if condition does not work
        // currentDate.getFullYear() == timeSheetArray[i].date.getFullYear() &&
        // currentDate.getMonth() == timeSheetArray[i].date.getMonth() &&
        // currentDate.getDate() == timeSheetArray[i].date.getDate())
        if(currentDate.toISOString().split('T')[0] == timeSheetArray[i].date.toISOString().split('T')[0]){
            console.log("Current date found in timesheet")
            previousTimeSheet = timeSheetArray[i-1];
            currentTimeSheet = timeSheetArray[i]
            nextTimeSheet = timeSheetArray[i+1];
            //check too see if previous or next day is available in the prayer time table
            if (typeof previousTimeSheet == 'undefined' || typeof nextTimeSheet == "undefined") {
                alert("Please update time table. Current day timesheet is found but previous/next timesheet not found. Most likley due to current timesheet being at the start/end of time table. ");
            }
            console.log(currentDate)
            console.log(timeSheetArray[i].date)
        }
    }
    
    if (currentTimeSheet == 0){
        alert("No current date was found in timesheet")
        return 0
    }else{
        return {previousTimeSheet: previousTimeSheet, currentTimeSheet: currentTimeSheet, nextTimeSheet : nextTimeSheet, currentDate: currentDate}
    }
}
//makes converting dates into specified format easier
function dateConverter(currentDate){
    return (currentDate.date.getDate() +"/"+ (currentDate.date.getMonth() + 1)+"/"+ currentDate.date .getFullYear())
}
//converts time object and hour/minutes time format into a new time object to allow for comparisons
function timeConverter(date){
    if (typeof date == "object"){
        var tempDate = new Date(0,0,0,date.getHours(), date.getMinutes())    
        return tempDate.getTime()
    }else if (typeof date == "string"){
        dateSplit = date.split(":")
        var tempDate = new Date(0,0,0, parseInt(dateSplit[0]), parseInt(dateSplit[1]))
        return tempDate.getTime()
    }
}
//loads dates onto web page
function setDatesValues(foundDates){
    var previousDateElement = table.children[1].children[0];
    var currentDateElement = table.children[1].children[1];
    var NextDateElement = table.children[1].children[2];

    //if statments are to allow the dates that are not undefined to be loaded to the page
    //without this check if one date is undefined then all three dates will not be loaded to the page
    if(typeof foundDates.previousTimeSheet != 'undefined'){
        previousDateElement.children[0].innerHTML = dateConverter(foundDates.previousTimeSheet);
        previousDateElement.children[1].innerHTML = foundDates.previousTimeSheet.fajrStart;
        previousDateElement.children[2].innerHTML = foundDates.previousTimeSheet.fajrEnd;
        previousDateElement.children[3].innerHTML = foundDates.previousTimeSheet.zuhr;
        previousDateElement.children[4].innerHTML = foundDates.previousTimeSheet.asr;
        previousDateElement.children[5].innerHTML = foundDates.previousTimeSheet.maghrib;
        previousDateElement.children[6].innerHTML = foundDates.previousTimeSheet.isha;
    }

    if(typeof foundDates.nextTimeSheet != 'undefined'){
        NextDateElement.children[0].innerHTML = dateConverter(foundDates.nextTimeSheet);
        NextDateElement.children[1].innerHTML = foundDates.nextTimeSheet.fajrStart;
        NextDateElement.children[2].innerHTML = foundDates.nextTimeSheet.fajrEnd;
        NextDateElement.children[3].innerHTML = foundDates.nextTimeSheet.zuhr;
        NextDateElement.children[4].innerHTML = foundDates.nextTimeSheet.asr;
        NextDateElement.children[5].innerHTML = foundDates.nextTimeSheet.maghrib;
        NextDateElement.children[6].innerHTML = foundDates.nextTimeSheet.isha;

    }

    currentDateElement.children[0].innerHTML = dateConverter(foundDates.currentTimeSheet);    
    currentDateElement.children[1].innerHTML = foundDates.currentTimeSheet.fajrStart;
    currentDateElement.children[2].innerHTML = foundDates.currentTimeSheet.fajrEnd;
    currentDateElement.children[3].innerHTML = foundDates.currentTimeSheet.zuhr;
    currentDateElement.children[4].innerHTML = foundDates.currentTimeSheet.asr;
    currentDateElement.children[5].innerHTML = foundDates.currentTimeSheet.maghrib;
    currentDateElement.children[6].innerHTML = foundDates.currentTimeSheet.isha;

    highlightCurrentDate(foundDates, currentDateElement)
}

function highlightCurrentDate(foundDates, currentDateElement){
    currentTimeSheet = foundDates.currentTimeSheet;

    //converts all times (like 02:32) in a date.getTime() int value
    const currentDateTime = timeConverter(foundDates.currentDate)
    const fajrStartTime = timeConverter(currentTimeSheet.fajrStart);
    const fajrEndTime = timeConverter(currentTimeSheet.fajrEnd);
    const zuhrTime = timeConverter(currentTimeSheet.zuhr);
    const asrTime = timeConverter(currentTimeSheet.asr);
    const maghribTime = timeConverter(currentTimeSheet.maghrib);
    const ishaTime = timeConverter(currentTimeSheet.isha);                   
            
    switch(true) {
        case (currentDateTime < fajrEndTime):
            currentDateElement.children[1].style = "background-color: #fcffa6";
            currentDateElement
            break;
        case (currentDateTime > fajrEndTime && currentDateTime < zuhrTime):
            currentDateElement.children[2].style = "background-color: #fcffa6";
            break;
        case (currentDateTime > zuhrTime && currentDateTime < asrTime):
            currentDateElement.children[3].style = "background-color: #fcffa6";
            break;
        case (currentDateTime > asrTime && currentDateTime < maghribTime):
            currentDateElement.children[4].style = "background-color: #fcffa6";
            break;
        case (currentDateTime > maghribTime && currentDateTime < ishaTime):
            currentDateElement.children[5].style = "background-color: #fcffa6";
            break;
        case (currentDateTime > ishaTime):
            currentDateElement.children[6].style = "background-color: #fcffa6";
            break;
    }    
}