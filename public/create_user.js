/* jshint esversion: 8 */

document.addEventListener("DOMContentLoaded", ready);
console.log("create_user");

function ready() {
  document.getElementById("submitButton").addEventListener("click", async event => {
    console.log("Submit");
    const user = document.getElementById("userInput").value;
    const secret = document.getElementById("secretInput").value;
    console.log(user);
    console.log(secret);
    clearErrorMsg();
    let errors = false;
    if (user == "") {
      displayError("userInput", "Can't be empty!");
      errors = true;
    }
    if (secret == "") {
      displayError("secretInput", "Can't be empty!");
      errors = true;
    }

    if (errors) {
      return;
    }
    clearInputs();
    const url = "http://localhost:3000/api/auth/create_user";
    const postDataRes = await postData(url, {
      UserName: user,
      Secret: secret
    });

    console.log(postDataRes);
    if(postDataRes.status == "success"){
      displaySuccesMsg();
    } else {
      if (postDataRes.error_code == "user_unavailable"){
        displayError("userInput", postDataRes.message);
      }
    }


    console.log("End");
  });
}
function displaySuccesMsg(){
  document.getElementById("formArea").hidden = true;
  let succesMsg = document.createElement("h");
  succesMsg.innerHTML = "User created successfully!";
  succesMsg.style.fontSize = "40px";
  document.body.append(succesMsg);
}
function clearInputs() {
  document.getElementById("userInput").value = "";
  document.getElementById("secretInput").value = "";
}

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
