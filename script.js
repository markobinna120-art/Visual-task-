console.log("SCRIPT STARTED");
/* =========================================
   MARKTASK APPLICATION JAVASCRIPT
   PART 1 - CORE SETUP
   ========================================= */


// ================================
// GLOBAL DATA STORAGE
// ================================


const APP_NAME = "VisualTask";


const ADMIN_EMAIL = "markobinna120@gmail.com";


// Get saved data

function getData(key) {

  const data = localStorage.getItem(key);

  return data ? JSON.parse(data) : null;

}


// Save data

function saveData(key, data) {

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );

}


// Remove data

function removeData(key) {

  localStorage.removeItem(key);

}



// ================================
// DEFAULT DATABASE
// ================================


if (!getData("users")) {

  saveData("users", []);

}


if (!getData("tasks")) {

  saveData("tasks", []);

}


if (!getData("deposits")) {

  saveData("deposits", []);

}


if (!getData("withdrawals")) {

  saveData("withdrawals", []);

}


if (!getData("notifications")) {

  saveData("notifications", []);

}


if (!getData("currentUser")) {

  saveData("currentUser", null);

}



// ================================
// CURRENT USER
// ================================


function getCurrentUser() {

  return getData("currentUser");

}



function setCurrentUser(user) {

  saveData(
    "currentUser",
    user
  );

}



// ================================
// ID GENERATOR
// ================================


function generateID(prefix = "ID") {

  return (

    prefix +

    Date.now().toString()

  );

}



// ================================
// MONEY FORMAT
// ================================


function formatMoney(amount) {

  return "₦" +

    Number(amount)
    .toLocaleString();

}



// ================================
// DATE FORMAT
// ================================


function formatDate(date) {

  return new Date(date)
    .toLocaleDateString();

}



// ================================
// TOAST MESSAGE
// ================================


function showToast(message, type="success") {


  const container =
    document.getElementById(
      "toastContainer"
    );


  if (!container) return;


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "toast " + type;


  toast.textContent =
    message;


  container.appendChild(toast);


  setTimeout(() => {

    toast.remove();

  },3000);


}
/* =========================================
   AUTHENTICATION SYSTEM
   ========================================= */


// ================================
// CREATE ADMIN ACCOUNT
// ================================


function createAdminAccount() {


  let users = getData("users") || [];


  const adminExists =
    users.find(
      user =>
      user.email === ADMIN_EMAIL
    );


  if (!adminExists) {


    users.push({

      id: generateID("ADM"),

      name: "Mark Admin",

      username: "admin",

      email: ADMIN_EMAIL,

      password: "admin123",

      role: "admin",

      balance: 0,

      pendingBalance: 0,

      verified: true,

      createdAt: new Date()

    });


    saveData(
      "users",
      users
    );


  }

}



createAdminAccount();



// ================================
// SIGN UP
// ================================


function signupUser(data) {


  let users =
    getData("users") || [];



  const emailExists =
    users.some(
      user =>
      user.email === data.email
    );


  if(emailExists){

    showToast(
      "Email already exists",
      "error"
    );

    return false;

  }



  const newUser = {


    id:
    generateID("USR"),


    name:
    data.name,


    username:
    data.username,


    email:
    data.email,


    password:
    data.password,


    role:
    data.role || "earner",


    balance: 0,


    pendingBalance: 0,


    verified: false,


    createdAt:
    new Date()


  };



  users.push(
    newUser
  );


  saveData(
    "users",
    users
  );



  // create notification

  addNotification(
    newUser.id,
    "Welcome to MarkTask",
    "Your account has been created successfully"
  );



  showToast(
    "Account created successfully"
  );


  return true;


}



// ================================
// LOGIN
// ================================


function loginUser(email,password){


  let users =
    getData("users") || [];



  const user =
    users.find(
      item =>
      item.email === email &&
      item.password === password
    );



  if(!user){


    showToast(
      "Invalid email or password",
      "error"
    );


    return false;


  }



  setCurrentUser(
    user
  );



  showToast(
    "Login successful"
  );


  return true;


}



// ================================
// LOGOUT
// ================================


function logoutUser(){


  setCurrentUser(
    null
  );


  showToast(
    "Logged out"
  );


  location.reload();


}
/* =========================================
   NOTIFICATION SYSTEM
   ========================================= */


function addNotification(
  userId,
  title,
  message
){


  let notifications =
    getData("notifications") || [];



  notifications.push({


    id:
    generateID("NOT"),


    userId:
    userId,


    title:
    title,


    message:
    message,


    read:
    false,


    createdAt:
    new Date()


  });



  saveData(
    "notifications",
    notifications
  );


}




function getUserNotifications(
  userId
){


  let notifications =
    getData("notifications") || [];



  return notifications.filter(

    item =>
    item.userId === userId

  );


}




function markNotificationsRead(
  userId
){


  let notifications =
    getData("notifications") || [];



  notifications =
  notifications.map(item => {


    if(item.userId === userId){

      item.read = true;

    }


    return item;


  });



  saveData(
    "notifications",
    notifications
  );


}



// ================================
// PROFILE SYSTEM
// ================================


function updateProfile(
  userId,
  data
){


  let users =
    getData("users") || [];



  users =
  users.map(user => {


    if(user.id === userId){


      user.name =
      data.name || user.name;


      user.username =
      data.username || user.username;


      user.phone =
      data.phone || user.phone;


    }



    return user;


  });



  saveData(
    "users",
    users
  );



  let current =
    getCurrentUser();



  if(current &&
     current.id === userId){


    setCurrentUser(

      users.find(
        u => u.id === userId
      )

    );


  }



  showToast(
    "Profile updated"
  );


}




// ================================
// PASSWORD UPDATE
// ================================


function changePassword(
  userId,
  oldPassword,
  newPassword
){


  let users =
    getData("users") || [];



  const user =
    users.find(
      u =>
      u.id === userId
    );



  if(!user){

    showToast(
      "User not found",
      "error"
    );

    return false;

  }



  if(
    user.password !== oldPassword
  ){

    showToast(
      "Old password incorrect",
      "error"
    );

    return false;

  }



  user.password =
  newPassword;



  saveData(
    "users",
    users
  );



  setCurrentUser(
    user
  );



  showToast(
    "Password changed"
  );



  return true;


}
/* =========================================
   TASK SYSTEM
   ========================================= */


// ================================
// CREATE TASK
// ================================


function createTask(taskData){


  let tasks =
    getData("tasks") || [];



  const task = {


    id:
    generateID("TASK"),


    advertiserId:
    taskData.advertiserId,


    platform:
    taskData.platform,


    title:
    taskData.title,


    link:
    taskData.link,


    type:
    taskData.type,


    quantity:
    Number(taskData.quantity),


    budget:
    Number(taskData.budget),


    reward:
    Number(taskData.reward),


    status:
    "active",


    completed:
    0,


    createdAt:
    new Date()


  };



  tasks.push(task);



  saveData(
    "tasks",
    tasks
  );



  showToast(
    "Task created successfully"
  );



  return task;


}



// ================================
// GET AVAILABLE TASKS
// ================================


function getAvailableTasks(){


  let tasks =
    getData("tasks") || [];



  return tasks.filter(

    task =>
    task.status === "active"

  );


}



// ================================
// SUBMIT TASK PROOF
// ================================


function submitTaskProof(
  taskId,
  userId,
  proof
){


  let submissions =
    getData("submissions") || [];



  submissions.push({


    id:
    generateID("SUB"),


    taskId:
    taskId,


    userId:
    userId,


    proof:
    proof,


    status:
    "pending",


    createdAt:
    new Date()


  });



  saveData(
    "submissions",
    submissions
  );



  showToast(
    "Proof submitted successfully"
  );


}




// ================================
// APPROVE SUBMISSION
// ================================


function approveSubmission(
  submissionId
){


  let submissions =
    getData("submissions") || [];



  let users =
    getData("users") || [];



  let tasks =
    getData("tasks") || [];



  let submission =
    submissions.find(

      item =>
      item.id === submissionId

    );



  if(!submission){

    return;

  }



  submission.status =
  "approved";



  let task =
    tasks.find(

      item =>
      item.id === submission.taskId

    );



  if(task){


    task.completed++;


  }



  let user =
    users.find(

      item =>
      item.id === submission.userId

    );



  if(user && task){


    user.balance +=
    task.reward;



    addNotification(

      user.id,

      "Task Approved",

      "Your task reward has been added"

    );


  }



  saveData(
    "users",
    users
  );


  saveData(
    "tasks",
    tasks
  );


  saveData(
    "submissions",
    submissions
  );


  showToast(
    "Submission approved"
  );


  }
/* =========================================
   BALANCE & MONEY SYSTEM
   ========================================= */


// ================================
// GET USER BALANCE
// ================================


function getBalance(userId){


  let users =
    getData("users") || [];



  let user =
    users.find(

      item =>
      item.id === userId

    );



  if(!user){

    return 0;

  }



  return user.balance || 0;


}




// ================================
// UPDATE BALANCE
// ================================


function updateBalance(
  userId,
  amount,
  type="add"
){


  let users =
    getData("users") || [];



  users =
  users.map(user => {



    if(user.id === userId){



      if(type === "add"){


        user.balance +=
        Number(amount);


      }


      else if(type === "remove"){


        user.balance -=
        Number(amount);


      }



    }



    return user;


  });



  saveData(
    "users",
    users
  );



}




// ================================
// CREATE DEPOSIT REQUEST
// ================================


function createDeposit(
  userId,
  amount
){


  let deposits =
    getData("deposits") || [];



  deposits.push({


    id:
    generateID("DEP"),


    userId:
    userId,


    amount:
    Number(amount),


    status:
    "pending",


    createdAt:
    new Date()


  });



  saveData(
    "deposits",
    deposits
  );



  addNotification(

    userId,

    "Deposit Submitted",

    "Your deposit is waiting for approval"

  );



  showToast(
    "Deposit request sent"
  );


}




// ================================
// APPROVE DEPOSIT
// ================================


function approveDeposit(
  depositId
){


  let deposits =
    getData("deposits") || [];



  let users =
    getData("users") || [];



  let deposit =
    deposits.find(

      item =>
      item.id === depositId

    );



  if(!deposit){

    return;

  }



  deposit.status =
  "approved";



  let user =
    users.find(

      item =>
      item.id === deposit.userId

    );



  if(user){


    user.balance +=
    deposit.amount;



    addNotification(

      user.id,

      "Deposit Approved",

      "Your balance has been updated"

    );


  }



  saveData(
    "users",
    users
  );


  saveData(
    "deposits",
    deposits
  );


  showToast(
    "Deposit approved"
  );


}
/* =========================================
   WITHDRAWAL SYSTEM
   ========================================= */


// ================================
// CREATE WITHDRAW REQUEST
// ================================


function createWithdrawal(
  userId,
  amount,
  method,
  account
){


  let users =
    getData("users") || [];



  let withdrawals =
    getData("withdrawals") || [];



  let user =
    users.find(

      item =>
      item.id === userId

    );



  if(!user){

    showToast(
      "User not found",
      "error"
    );

    return false;

  }



  if(
    Number(amount) > user.balance
  ){

    showToast(
      "Insufficient balance",
      "error"
    );


    return false;

  }



  withdrawals.push({


    id:
    generateID("WITH"),


    userId:
    userId,


    amount:
    Number(amount),


    method:
    method,


    account:
    account,


    status:
    "pending",


    createdAt:
    new Date()


  });



  user.balance -=
  Number(amount);



  saveData(
    "users",
    users
  );



  saveData(
    "withdrawals",
    withdrawals
  );



  addNotification(

    userId,

    "Withdrawal Requested",

    "Your withdrawal is waiting for approval"

  );



  showToast(
    "Withdrawal request sent"
  );



  return true;


}



// ================================
// APPROVE WITHDRAWAL
// ================================


function approveWithdrawal(
  withdrawalId
){


  let withdrawals =
    getData("withdrawals") || [];



  let withdrawal =
    withdrawals.find(

      item =>
      item.id === withdrawalId

    );



  if(!withdrawal){

    return;

  }



  withdrawal.status =
  "approved";



  addNotification(

    withdrawal.userId,

    "Withdrawal Approved",

    "Your withdrawal has been approved"

  );



  saveData(
    "withdrawals",
    withdrawals
  );



  showToast(
    "Withdrawal approved"
  );


}



// ================================
// REJECT WITHDRAWAL
// ================================


function rejectWithdrawal(
  withdrawalId
){


  let withdrawals =
    getData("withdrawals") || [];



  let users =
    getData("users") || [];



  let withdrawal =
    withdrawals.find(

      item =>
      item.id === withdrawalId

    );



  if(!withdrawal){

    return;

  }



  withdrawal.status =
  "rejected";



  let user =
    users.find(

      item =>
      item.id === withdrawal.userId

    );



  if(user){


    user.balance +=
    withdrawal.amount;


  }



  saveData(
    "users",
    users
  );



  saveData(
    "withdrawals",
    withdrawals
  );



  addNotification(

    withdrawal.userId,

    "Withdrawal Rejected",

    "Your money has been returned"

  );



  showToast(
    "Withdrawal rejected"
  );


  }
/* =========================================
   ADVERTISER SYSTEM
   ========================================= */


// ================================
// GET ADVERTISER TASKS
// ================================


function getAdvertiserTasks(
  advertiserId
){


  let tasks =
    getData("tasks") || [];



  return tasks.filter(

    task =>
    task.advertiserId === advertiserId

  );


}



// ================================
// CALCULATE TASK PRICE
// ================================


function calculateTaskPrice(
  type,
  quantity
){


  let prices = {


    like: 11,

    follow: 11,

    comment: 11,

    custom_comment: 50,

    share: 11,

    group_join: 17,

    bot_start: 20,

    video_view: 12,

    website_signup: 30


  };



  let price =
    prices[type] || 0;



  return Number(quantity) * price;


}



// ================================
// CHECK ADVERTISER BALANCE
// ================================


function checkAdvertiserBalance(
  advertiserId,
  amount
){


  let users =
    getData("users") || [];



  let user =
    users.find(

      item =>
      item.id === advertiserId

    );



  if(!user){

    return false;

  }



  return user.balance >= amount;


}



// ================================
// PAY FOR TASK
// ================================


function payForTask(
  advertiserId,
  amount
){


  let users =
    getData("users") || [];



  users =
  users.map(user => {


    if(
      user.id === advertiserId
    ){


      user.balance -=
      Number(amount);


    }



    return user;


  });



  saveData(
    "users",
    users
  );


}



// ================================
// DELETE TASK
// ================================


function deleteTask(
  taskId,
  advertiserId
){


  let tasks =
    getData("tasks") || [];



  tasks =
  tasks.filter(task => {


    if(
      task.id === taskId &&
      task.advertiserId === advertiserId
    ){

      return false;

    }


    return true;


  });



  saveData(
    "tasks",
    tasks
  );



  showToast(
    "Task deleted"
  );


}



// ================================
// CLOSE COMPLETED TASK
// ================================


function closeTask(
  taskId
){


  let tasks =
    getData("tasks") || [];



  tasks =
  tasks.map(task => {


    if(
      task.id === taskId
    ){


      task.status =
      "completed";


    }



    return task;


  });



  saveData(
    "tasks",
    tasks
  );


    }
/* =========================================
   ADMIN SYSTEM
   ========================================= */


// ================================
// GET ALL USERS
// ================================


function getAllUsers(){


  return getData("users") || [];


}



// ================================
// BAN USER
// ================================


function banUser(
  userId
){


  let users =
    getData("users") || [];



  users =
  users.map(user => {


    if(
      user.id === userId
    ){

      user.banned = true;

    }


    return user;


  });



  saveData(
    "users",
    users
  );



  showToast(
    "User banned"
  );


}



// ================================
// UNBAN USER
// ================================


function unbanUser(
  userId
){


  let users =
    getData("users") || [];



  users =
  users.map(user => {


    if(
      user.id === userId
    ){

      user.banned = false;

    }


    return user;


  });



  saveData(
    "users",
    users
  );



  showToast(
    "User unbanned"
  );


}



// ================================
// GET PENDING DEPOSITS
// ================================


function getPendingDeposits(){


  let deposits =
    getData("deposits") || [];



  return deposits.filter(

    item =>
    item.status === "pending"

  );


}



// ================================
// GET PENDING WITHDRAWALS
// ================================


function getPendingWithdrawals(){


  let withdrawals =
    getData("withdrawals") || [];



  return withdrawals.filter(

    item =>
    item.status === "pending"

  );


}



// ================================
// ADMIN DELETE TASK
// ================================


function adminDeleteTask(
  taskId
){


  let tasks =
    getData("tasks") || [];



  tasks =
  tasks.filter(

    task =>
    task.id !== taskId

  );



  saveData(
    "tasks",
    tasks
  );



  showToast(
    "Task removed by admin"
  );


}



// ================================
// ADMIN SEND NOTIFICATION
// ================================


function adminNotifyUser(
  userId,
  title,
  message
){


  addNotification(

    userId,

    title,

    message

  );



  showToast(
    "Notification sent"
  );


}
/* =========================================
   DASHBOARD DATA UPDATE SYSTEM
   ========================================= */


// ================================
// UPDATE USER BALANCE DISPLAY
// ================================


function updateBalanceDisplay(){


  const user =
    getCurrentUser();



  if(!user) return;



  const balanceElements =
    document.querySelectorAll(
      ".user-balance"
    );



  balanceElements.forEach(
    element => {

      element.textContent =
      formatMoney(
        user.balance || 0
      );

    }
  );



}



// ================================
// UPDATE PROFILE DISPLAY
// ================================


function updateProfileDisplay(){


  const user =
    getCurrentUser();



  if(!user) return;



  const nameElements =
    document.querySelectorAll(
      ".user-name"
    );



  nameElements.forEach(
    element => {

      element.textContent =
      user.name;

    }
  );



  const emailElements =
    document.querySelectorAll(
      ".user-email"
    );



  emailElements.forEach(
    element => {

      element.textContent =
      user.email;

    }
  );


}



// ================================
// LOAD TASKS TO PAGE
// ================================


function loadTasks(){


  const taskContainer =
    document.getElementById(
      "taskList"
    );



  if(!taskContainer) return;



  const tasks =
    getAvailableTasks();



  taskContainer.innerHTML = "";



  if(tasks.length === 0){


    taskContainer.innerHTML =

    `<div class="empty-state">

      <div class="empty-state-icon">
        📭
      </div>

      <h3>
        No tasks available
      </h3>

      <p>
        New tasks will appear here.
      </p>

    </div>`;



    return;


  }



  tasks.forEach(task => {


    taskContainer.innerHTML +=


    `<div class="task-card">


      <div class="task-card-header">


        <div class="task-platform">


          <div class="task-platform-icon">
            📱
          </div>


          <div>

            <h3>
              ${task.title}
            </h3>


            <p>
              ${task.platform}
            </p>

          </div>


        </div>


      </div>



      <p>
        Reward:
        <strong class="task-reward">
          ${formatMoney(task.reward)}
        </strong>
      </p>



      <button
        class="btn btn-primary"
        onclick="openTask('${task.id}')"
      >

        Complete Task

      </button>


    </div>`;


  });


}



// ================================
// OPEN TASK
// ================================


function openTask(
  taskId
){


  let tasks =
    getData("tasks") || [];



  const task =
    tasks.find(

      item =>
      item.id === taskId

    );



  if(!task) return;



  saveData(
    "selectedTask",
    task
  );



  showToast(
    "Task opened"
  );


}
/* =========================================
   FORM EVENTS & APP INTERACTIONS
   ========================================= */


// ================================
// SIGNUP FORM EVENT
// ================================


function setupSignupForm(){


  const form =
    document.getElementById(
      "signupForm"
    );



  if(!form) return;



  form.addEventListener(
    "submit",
    function(e){


      e.preventDefault();



      const data = {


        name:
        document.getElementById(
          "signupName"
        ).value,


        username:
        document.getElementById(
          "signupUsername"
        ).value,


        email:
        document.getElementById(
          "signupEmail"
        ).value,


        password:
        document.getElementById(
          "signupPassword"
        ).value,


        role:
        document.getElementById(
          "signupRole"
        ).value



      };



      signupUser(data);



      form.reset();



    }
  );


}



// ================================
// LOGIN FORM EVENT
// ================================


function setupLoginForm(){


  const form =
    document.getElementById(
      "loginForm"
    );



  if(!form) return;



  form.addEventListener(
    "submit",
    function(e){


      e.preventDefault();



      const email =
      document.getElementById(
        "loginEmail"
      ).value;



      const password =
      document.getElementById(
        "loginPassword"
      ).value;



      if(
        loginUser(
          email,
          password
        )
      ){


        location.reload();


      }



    }
  );


}



// ================================
// DEPOSIT FORM EVENT
// ================================


function setupDepositForm(){


  const form =
    document.getElementById(
      "depositForm"
    );



  if(!form) return;



  form.addEventListener(
    "submit",
    function(e){


      e.preventDefault();



      const user =
      getCurrentUser();



      if(!user) return;



      const amount =
      document.getElementById(
        "depositAmount"
      ).value;



      createDeposit(

        user.id,

        amount

      );



      form.reset();


    }
  );


}



// ================================
// WITHDRAW FORM EVENT
// ================================


function setupWithdrawForm(){


  const form =
    document.getElementById(
      "withdrawForm"
    );



  if(!form) return;



  form.addEventListener(
    "submit",
    function(e){


      e.preventDefault();



      const user =
      getCurrentUser();



      if(!user) return;



      createWithdrawal(

        user.id,

        document.getElementById(
          "withdrawAmount"
        ).value,


        document.getElementById(
          "withdrawMethod"
        ).value,


        document.getElementById(
          "withdrawAccount"
        ).value


      );



      form.reset();


    }
  );


}
/* =========================================
   APPLICATION STARTUP
   FINAL PART
   ========================================= */


// ================================
// INITIALIZE APPLICATION
// ================================


function initializeApp(){


  const user =
    getCurrentUser();



  if(user){


    updateBalanceDisplay();


    updateProfileDisplay();


    loadTasks();


  }



  setupSignupForm();


  setupLoginForm();


  setupDepositForm();


  setupWithdrawForm();



}



// ================================
// AUTO RUN APP
// ================================


document.addEventListener(

  "DOMContentLoaded",

  function(){


    initializeApp();


  }

);



// ================================
// GLOBAL PAGE HELPERS
// ================================


function refreshApp(){


  updateBalanceDisplay();


  updateProfileDisplay();


  loadTasks();


}



// ================================
// CHECK USER LOGIN
// ================================


function requireLogin(){


  const user =
    getCurrentUser();



  if(!user){


    showToast(

      "Please login first",

      "error"

    );


    return false;


  }



  return true;


}



// ================================
// CHECK ADMIN
// ================================


function requireAdmin(){


  const user =
    getCurrentUser();



  if(
    !user ||
    user.email !== ADMIN_EMAIL
  ){


    showToast(

      "Admin access denied",

      "error"

    );


    return false;


  }



  return true;


}



// ================================
// EMAIL VERIFICATION PLACEHOLDER
// ================================


function sendSignupEmail(
  email
){


  console.log(

    "Verification email sent to:",
    email

  );


      }
console.log("MarkTask script loaded successfully");
