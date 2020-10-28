/* jshint esversion: 8 */
console.log("WhattApp Client");
document.addEventListener("DOMContentLoaded", ready);

//global variables
var graphData = [];
let averageGraphData = [];
let serverData = [];
let firstTimeStamp = Date.now()/1000-600;
let accessToken;

async function getData() {
  console.log("Geting Data...");
  if(accessToken){

    if (serverData.length == 0){
      lastTimeStamp = firstTimeStamp;
    } else{
      lastTimeStamp = serverData[serverData.length-1].TimeStamp;
    }
    //const response = await fetch("/api?fromTime=" + lastTimeStamp);

    const response = await fetch("/api?fromTime=" + lastTimeStamp, {
      headers:{
        Authorization: "Bearer " + accessToken
      }
    });
    if(response.status == 200){
      console.log("get datas");
      console.log(response);
      const data = await response.json();
      console.log(data);
      //displayKWH(calculateKWH(data));
      serverData = serverData.concat(data);
      for (var item of data) {
        var date = new Date();
        date.setTime(item.TimeStamp*1000);
        graphData.push({
          x: date,
          y: item.Power
        });
      }
    } else {
      console.log(response);
    }
  }
  //console.log(graphData);
}





async function ready() {
  moment().format('dddd');
  await getData();
  console.log("aca sigo?");
  createChart();
  //displayKWH(calculateKWH(graphData));
  console.log(graphData);
  displayKWH(calculateKWH(serverData));
  myChart.update();
}

//setInterval(updateData, 2000);
async function updateData(){
  console.log("updateing data...");
  await getData();
  myChart.data.datasets.forEach((dataset) => {
        dataset.data = graphData;
    });
    displayKWH(calculateKWH(serverData));
  myChart.update(500);

}

function calculateKWH(data){
  let sum = 0;
  for (let i = 0; i < data.length -1; i++){
    let timeStep = Math.abs(data[i+1].TimeStamp - data[i].TimeStamp);
    let kwh = data[i].Power*timeStep/(1000*3600.0);
    sum+=kwh;
  }
return sum;
}

function displayKWH(kwh){
  document.getElementById("kwh").innerHTML = "" + kwh.toFixed(5) + "kWh";
}

function calculateAverageGraphData(){
  let averageCount = 5;
  averageGraphData=[];
  for (let i = averageCount; i<graphData.length; i++){
    let sum = 0;
    for (let j = 0; j< averageCount;j++){
      sum += graphData[i-j].y;
    }
    let average = sum/averageCount;
    averageGraphData.push({
      x: graphData.x,
      y: average
    });
  }
}

//------------------------
//char config
let myChart;
function createChart() {
  console.log("Create Chart");
  var timeFormat = 'll HH:mm';
  var ctx = document.getElementById("myChart");
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Power',
        data: graphData,
        pointRadius: 2,
        pointBorderWidth: 0,
        pointBackgroundColor: "rgba(120, 120, 120, 0.5)"
      }]
    },
    options: {
      scales: {

        yAxes: [{
          ticks: {
            beginAtZero: true,
            fontSize: 20,
            padding: 10,
            fontFamily:"Segoe UI Light",
            max: 20
          },
          scaleLabel: {
            display: true,
            labelString: "Watts",
            fontFamily:"Segoe UI Light",
            fontSize: 30
          },
        }],
        xAxes: [{
          type: 'time',
          time: {
            parser: timeFormat,
            //round: 'day',
            //unit: "day",
            tooltipFormat: 'll HH:mm',
            displayFormats: {
                        hour: 'MMM DD HH[hs]'
                    }
          },
          ticks: {
            fontSize: 20,
            padding: 10,
            fontFamily:"Segoe UI Light",
            autoSkipPadding: 30,
            //minRotation: 90,
            //maxRotation: 90
          },
          scaleLabel: {
            display: true,
            labelString: 'Date',
            fontFamily:"Segoe UI Light",
            fontSize: 30
          }
        }],
      }
    }
  });
}


//-----sign console.log(require('util').inspect(
async function loginHandeler() {
  console.log("login!");
  clearErrorMsg();
  let loginForm = document.getElementById("loginForm");
  //console.log(loginForm.elements);
  let userNameField = document.getElementById("userNameField");
  let passwordField = document.getElementById("passwordField");
  console.log(userNameField.value);
  console.log(passwordField.value);
  const response = await postData("/api/auth/login", {
    UserName: userNameField.value,
    Secret: passwordField.value
  });
  console.log(response);
  if (response.token) {
    hideLoginForm();
    accessToken = response.token;
    console.log(accessToken);
    updateData();
  } else {
    console.log("Login failed.");
    displayError("loginForm", "Login failed");

  }

}

//----error msg display

function clearErrorMsg() {
  let errorMsgs = document.getElementsByClassName("errorMsg");
  for(let errorMsg of errorMsgs){
    errorMsg.remove();
  }
}

function displayError(id, errorText) {
  let p = document.createElement("p");
  p.innerHTML = errorText;
  p.className = "errorMsg";
  let referenceNode = document.getElementById(id);
  insertAfter(referenceNode, p);
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function hideLoginForm(){
  let loginForm = document.getElementById("loginForm");
  loginForm.hidden = true;
}

//helper funciton
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
