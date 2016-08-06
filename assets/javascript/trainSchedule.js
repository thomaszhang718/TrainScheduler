$(document).ready(function(){

	//retrieving the trainCount from local storage. This is used for adding previously stored local data
	var trainCount = localStorage.getItem('currentTrainCount');

	//if statement for when there is no trainCount stored previously. Set it equal to zero
	if (trainCount == null) {
		trainCount = 0;
	} 

	//for loop to go through the local storage and append the stored train information to the table body
	for (i = 0; i < trainCount; i++) {
		var retrievedItem = localStorage.getItem('trainNumber-' + i);
		$('#tableBody').append(retrievedItem);
	}

	//this for loop is for trying to update the next arrival times and minutes away times for previously stored trains upon refresh. Once the current time passes the nextArrivalTime, the train schedule needs to updated again
	for (j = 0; j < trainCount; j++) {

		//using JQuery to target the table rows starting from the first
	    var RowTds = $('table').children().eq(1).children('tr').eq(j).children('td');
	    
	    //grabbing the frequency and nextArrivalTime and storing as oldFrequency and oldTime
	    var oldFrequency = RowTds.eq(2).prop('innerHTML');
	    var oldTime = RowTds.eq(3).prop('innerHTML');

	    //taking the oldTime variable given by user and storing as momentjs variable
	    oldTime = moment(oldTime, 'HH:mm');

	    //calculating the newTimeDifference variable from current time and oldTime variable
	    var newTimeDifference = moment(oldTime).diff( moment(), 'minutes');
	    console.log('newTimeDifference: ' + newTimeDifference)

	    //taking the absolute value of the time difference which will be used later
	    var newAbsoluteTimeDifference = Math.abs(newTimeDifference);

	    //create an if-else statement to check the newTimeDifference and if it's greater than or equal to zero or less than zero
	    //create an if-else statement to check the newTimeDifference and if it's greater than or equal to zero or less than zero
		if (newTimeDifference >= 0) {
		//if newTimeDifference is non-negative, the first train time is still in the future and hasn't occurred yet. We don't need to change the nextArrivalTime, just update the minutes away

			var newMinutesAwayTime = newTimeDifference;
			RowTds.eq(4).text(Math.ceil(newMinutesAwayTime));

		} else {
		//if newTimeDifference is less than zero, the first train time was in the past before the current time. We need to do some calculations to determine the newNextArrivalTime based on the train frequency and the oldTime
			
			//we want to make the newTimeDifference positive with the least amount of additions of more trains which will give us the newNextArrivalTime. We divide the newAbsoluteTimeDifference by oldFrequency and taking the ceiling
			var newNumberOfMultiples = Math.ceil(newAbsoluteTimeDifference/oldFrequency);

			//We add a total minutes of oldFrequency*newNumberOfMultiples to get a positive newTimeDifference and the newNextArrivalTime
			oldTime.add(oldFrequency*newNumberOfMultiples, 'minutes');
			var newNextArrivalTime = moment(oldTime).format('hh:mm A');

			//recalculate the newTimeDifference and then setting the new minutesAwayTime
			newTimeDifference = moment(oldTime).diff( moment(), 'minutes', true);
			var newMinutesAwayTime = newTimeDifference;

			//add the newNextArrivalTime and newMinutesAwayTime to the table row to display the updated schedule
		    RowTds.eq(3).text(newNextArrivalTime);
		    RowTds.eq(4).text(Math.ceil(newMinutesAwayTime));
		}
	}

	//on click function for submit button
	$('#submitButton').on('click', function(){

		//creating empty array to store train information
		var infoArray =[];

		//taking the values from the inputs on the HTML form for new trains and storing as variables
		var trainName = $('#trainNameText').val().trim();
		var destination = $('#destinationText').val().trim();
		var firstTrainTime = $('#firstTrainTimeText').val().trim();
		var frequency = $('#frequencyText').val().trim();
		var nextArrivalTime;
		var minutesAwayTime;

		//taking the firstTrainTime variable given by user and storing as momentjs variable
		var convertedTime = moment(firstTrainTime, 'HH:mm');
		
		//calculate the difference in minutes between the first train time and current time
		var timeDifference = moment(convertedTime).diff(moment(), 'minutes');

		//taking the absolute value of the time difference which will be used later
		var absoluteTimeDifference = Math.abs(timeDifference);

		//create if-else statement for timeDifference and when it's greater or equal to 0 and less than 0
		if (timeDifference >= 0) {
		//if timeDifference is non-negative, the first train time is still in the future and hasn't occurred yet. We just set the nextArrivalTime as the time inputted by the user. The minutesAwayTime is equal to the timeDifference variable we already calculated
			
			nextArrivalTime = moment(convertedTime).format('hh:mm A');
			minutesAwayTime = timeDifference;

		} else {
		//if timeDifference is less than zero, the first train time was in the past before the current time. We need to do some calculations to determine the nextArrivalTime based on the train frequency and the firstTrainTime

			//we want to make the timeDifference positive with the least amount of additions of more trains which will give us the nextArrivalTime. We divide the absoluteTimeDifference by frequency and taking the ceiling
			var numberOfMultiples = Math.ceil(absoluteTimeDifference/frequency);

			//We add a total minutes of frequency*numberOfMultiples to get a positive timeDifference and the nextArrivalTime
			convertedTime.add(frequency*numberOfMultiples, 'minutes');
			nextArrivalTime = moment(convertedTime).format('hh:mm A');

			//Finding the new timeDifference and then setting the new minutesAwayTime. I made sure to not round timeDifference as I was getting 0 minutes away anytime the timeDifference was between 0 and 1 minute. This was making the data slightly off for these type of situations
			timeDifference = moment(convertedTime).diff( moment(), 'minutes', true);
			minutesAwayTime = Math.ceil(timeDifference);
			
		}
		
		//pushing all of the information that will be displayed in the <td> tags into our array
		infoArray.push(trainName);
		infoArray.push(destination);
		infoArray.push(frequency);
		infoArray.push(nextArrivalTime);
		infoArray.push(minutesAwayTime);

		//dynamically creating a new table row with JQuery and giving it an id
		var trainRow = $('<tr>');
		trainRow.attr('id', 'item-' + trainCount);

		//using a for loop and JQuery to create a new <td> item for every item in our infoArray and appending it to our table row
		for (i = 0; i < infoArray.length; i++) {
			trainTD = $('<td>');
			trainTD.text(infoArray[i]);
			trainRow.append(trainTD);
		}

		//appending the table row to the table body
		$('#tableBody').append(trainRow);

		//storing the entire HTML of our created table row into local storage
		var currentTrain = trainRow.prop('outerHTML');
		localStorage.setItem('trainNumber-' + trainCount, currentTrain);

		//increasing the trainCount and then storing that to local storage
		trainCount++;
		localStorage.setItem('currentTrainCount', trainCount);

		//empty the form boxes
	    $('#trainNameText, #destinationText, #firstTrainTimeText, #frequencyText').val('');

		// Prevent Form from Refreshing (return false)
		return false;
	});
});