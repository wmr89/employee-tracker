const inquirer = require('inquirer');
const mysql = require('mysql2');
const employeeTracker = require('./js/q')
const db = require('./connections.js')


function init() {
employeeTracker();
}

init();
