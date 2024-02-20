# Employee Tracker

A command-line application to manage a company's employee database, using Node.js, Inquirer, and MySQL.

## Description

This application is a Content Management System (CMS) that allows users to view and interact with information stored in a company's employee database. It provides a simple CLI for managing departments, roles, employees, and more.

## User Story

```
AS A business owner
I WANT to be able to view and manage the departments, roles, and employees in my company
SO THAT I can organize and plan my business
```

## Acceptance Criteria

```
GIVEN a command-line application that accepts user input
WHEN I start the application
THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
WHEN I choose to view all departments
THEN I am presented with a formatted table showing department names and department ids
WHEN I choose to view all roles
THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
WHEN I choose to view all employees
THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
WHEN I choose to add a department
THEN I am prompted to enter the name of the department and that department is added to the database
WHEN I choose to add a role
THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
WHEN I choose to add an employee
THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
WHEN I choose to update an employee role
THEN I am prompted to select an employee to update and their new role and this information is updated in the database
```

## Features

- View all departments, roles, and employees
- Add departments, roles, and employees
- Update employee roles
- View employees by manager or department
- Delete departments, roles, and employees
- View the total utilized budget of a department

## Installation

1. Clone the repository to your local machine.
2. Navigate to the cloned directory.
3. Install the necessary npm packages by running:

```
npm install
```

4. Make sure you have MySQL installed and running on your local machine.
5. Create the database and tables using the `schema.sql` file in the database folder.
6. (Optional) Populate the database with the initial data from `mockData.sql` file in the database folder.

## Usage

To start the application, run the following command in your terminal:

```
npm start
```


Follow the prompts to view, add, update, or delete data in the database.

## Database Schema

The database schema includes three tables:

- `departments` - Contains department names and department ids.
- `roles` - Contains job title, role id, the department that role belongs to, and the salary for that role.
- `employee` - Contains employee ids, first names, last names, job titles, departments, salaries, and managers.

## Technologies Used

- Node.js
- Inquirer.js
- MySQL
- cfonts



