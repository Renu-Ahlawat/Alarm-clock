//Array containing currently set alarms.
var alarms = [];
var digitalClock = document.getElementById("digitalClock");
var alarmSound = document.getElementById("alarmSound");

// Function to save alarms to local storage
function saveAlarmsToStorage() {
  localStorage.setItem("alarms", JSON.stringify(alarms));
}

// Function to retrieve alarms from local storage
function getAlarmsFromStorage() {
  var storedAlarms = localStorage.getItem("alarms");
  return storedAlarms ? JSON.parse(storedAlarms) : [];
}

// Function to add an alarm
function addAlarm(alarm) {
  alarms.push(alarm);
  saveAlarmsToStorage();
  renderAndResetAlarms(false);
}

// Function to delete an alarm
function deleteAlarm(alarm) {
  var index = alarms.indexOf(alarm);
  if (index > -1) {
    clearTimeout(alarm.timeout);
    alarms.splice(index, 1);
    saveAlarmsToStorage();
    renderAndResetAlarms(false);
  }
}


// Function to render and reset saved alarms
function renderAndResetAlarms(toReset) {
  var container = document.getElementById("alarmsContainer");
  container.innerHTML = "";

  alarms.forEach(function (alarm) {
    var alarmElement = document.createElement("div");
    alarmElement.className = "alarm";
    // console.log("alarm.time",alarm.time);
    var alarmTime = new Date(alarm.time);
    // console.log("alarmTime",alarmTime);
    var formattedHours24 = formatTime(alarmTime.getHours());
    var formattedHours = formattedHours24 > 12 ? formattedHours24 - 12 : formattedHours24;
    var meridiem = alarmTime.getHours() >= 12 ? "PM" : "AM";
    var formattedMinutes = formatTime(alarmTime.getMinutes());
    var formattedTime = formattedHours + ":" + formattedMinutes + " " + meridiem;
    alarmElement.textContent = formattedTime;

    var deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
      deleteAlarm(alarm);
    };

    alarmElement.appendChild(deleteButton);
    container.appendChild(alarmElement);

    // Set the alarm
    var currentTime = new Date();
    var timeDiff = alarmTime - currentTime;
    if (timeDiff > 0) {
      if (toReset) {
        alarm.timeout = setTimeout(function () {
          alarmSound.play();
          alert("Wake up!");
          alarmSound.pause();
          deleteAlarm(alarm);
        }, timeDiff);
      }
    } else {
      deleteAlarm(alarm);
    }
  });
}

// Function to update the clock
function updateClock() {
  var hourHand = document.getElementById("hourHand");
  var minuteHand = document.getElementById("minuteHand");
  var secondHand = document.getElementById("secondHand");

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  var meridiem = "AM";
  if (hours >= 12) {
    meridiem = "PM";
    hours = hours % 12 || 12;
  }

  var hourRotation = (hours % 12) * 30 + (minutes / 2);
  var minuteRotation = minutes * 6 + (seconds / 10);
  var secondRotation = seconds * 6;

  hourHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${hourRotation}deg)`;
  minuteHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${minuteRotation}deg)`;
  secondHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${secondRotation}deg)`;

  if (seconds === 0) {
    secondHand.style.transition = "none"; // Disable transition for a smooth reset
    setTimeout(function () {
      secondHand.style.transition = "all 0.3s ease-in-out"; // Re-enable transition after reset
      secondHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${secondRotation}deg)`;
    }, 0);
  } else if (seconds === 1) {
    secondHand.style.transitionDelay = "0s"; // Reset transition delay
  }

  var formattedTime = formatTime(hours) + ":" + formatTime(minutes) + ":" + formatTime(seconds) + " " + meridiem;
  digitalClock.textContent = formattedTime;
  requestAnimationFrame(updateClock);
}

// Function to format time
function formatTime(time) {
  return time.toString().padStart(2, "0");
}

// Retrieve alarms from local storage on page load
alarms = getAlarmsFromStorage();

// Render alarms
renderAndResetAlarms(true);

// Start the clock and alarms
updateClock();

// Event listener for set alarm button
document.getElementById("setAlarmButton").addEventListener("click", function () {
  var timeInput = document.getElementById("alarmTime").value;
  var splitTime = timeInput.split(":");
  var hours = parseInt(splitTime[0]);
  var minutes = parseInt(splitTime[1]);

  var currentTime = new Date();
  var alarmTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), hours, minutes, 0);

  if(alarms.some(alarm => alarm.time === alarmTime.toString())){
    alert("Alarm Already exist");
    return;
  }

  var timeDiff = alarmTime - currentTime;

  if (timeDiff <= 0) {
    alert("Invalid time. Please select a future time.");
    return;
  }

  var alarm = {
    time: alarmTime.toString(),
    timeout: setTimeout(function () {
      alarmSound.play();
      alert("Wake up!");
      alarmSound.pause();
      deleteAlarm(alarm);
    }, timeDiff)
  };

  addAlarm(alarm);
});

window.addEventListener('beforeunload', (event) => {
  alarms.map(alarmItem => {
    alarmItem.clearTimeout();
  })
});
