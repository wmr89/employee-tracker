//Require q.js to import employee tracker function
const employeeTracker = require('./js/q')
//Require connections.js to connect to mysql database
const db = require('./connections.js')

//Create function to initialize employee tracker
function init() {
employeeTracker();
}
//Call function to initialize employee tracker
init();
