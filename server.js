const inquirer = require("inquirer");
const mysql = require("mysql2/promise");
const cfonts = require('cfonts');

// Function to create a MySQL connection
async function createDbConnection() {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "",
            database: "employeeTrackerDatabase",
        });
        console.log("Connected to the database!");
        return connection;
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
}

// Function to start the application
async function start() {
    const connection = await createDbConnection();

    cfonts.say('Employee\nTracker', {
        font: 'simple',              
    });
    displayMenu(connection)
}

// Function to start the application
async function displayMenu(connection) {
    const actionChoices = [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Add a Manager",
        "Update an employee role",
        "View Employees by Manager",
        "View Employees by Department",
        "Delete Departments, Roles, Employees",
        "View the total utilized budget of a department",
        "Exit",
    ];

    const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: actionChoices,
    });

    try {
        switch (action) {
            case "View all departments":
                await viewAllDepartments(connection);
                break;
            case "View all roles":
                await viewAllRoles(connection);
                break;
            case "View all employees":
                await viewAllEmployees(connection);
                break;
            case "Add a department":
                await addDepartment(connection);
                break;
            case "Add a role":
                await addRole(connection);
                break;
            case "Add an employee":
                await addEmployee(connection);
                break;
            case "Add a Manager":
                await addManager(connection);
                break;
            case "Update an employee role":
                await updateEmployeeRole(connection);
                break;
            case "View Employees by Manager":
                await viewEmployeesByManager(connection);
                break;
            case "View Employees by Department":
                await viewEmployeesByDepartment(connection);
                break;
            case "Delete Departments, Roles, Employees":
                await deleteEntries(connection);
                break;
            case "View the total utilized budget of a department":
                await viewDepartmentBudget(connection);
                break;
            case "Exit":
                await connection.end();
                console.log("Application terminated.");
                process.exit(0); // Immediately stops the Node.js process
            default:
                console.log("Action not recognized");
                displayMenu(connection)
        }
    } catch (err) {
        console.error("An error occurred:", err);
    }
}

start().catch(err => console.error(err));

function outputData(rows) {
    if (!rows || rows.length === 0) {
        console.log("No data available.");
        return;
    }

    // Determine column widths
    const headers = Object.keys(rows[0]);
    const columnWidths = headers.map(header =>
        Math.max(header.length, ...rows.map(row => String(row[header]).length))
    );

    // Create a header row
    const headerRow = headers.map((header, index) =>
        header.padEnd(columnWidths[index], ' ')
    ).join(' ');

    // Underline for each header
    const underlines = columnWidths.map(width =>
        '-'.repeat(width)
    ).join(' ');

    // Log header
    console.log('');
    console.log(headerRow);
    console.log(underlines);

    // Log each row
    rows.forEach(row => {
        const rowString = headers.map((header, index) =>
            String(row[header]).padEnd(columnWidths[index], ' ')
        ).join(' ');
        console.log(rowString);
    });

    // Empty line after the table for separation
    console.log('');
}



async function viewAllDepartments(connection) {
    try {
        const [rows] = await connection.query("SELECT * FROM departments");
        outputData(rows);
    } catch (err) {
        console.error('Failed to query departments:', err);
        // Handle the error as needed
    } finally {
        // Ensure displayMenu is called with connection
        await displayMenu(connection);
    }
}

async function viewAllRoles(connection) {
    try {
        const [rows] = await connection.query(`
            SELECT roles.title, roles.id, departments.department_name, roles.salary
            FROM roles
            JOIN departments ON roles.department_id = departments.id
        `);
        outputData(rows);
    } catch (err) {
        console.error('Failed to query roles:', err);
    } finally {
        // Ensure displayMenu is called with connection
        await displayMenu(connection);
    }
}

async function viewAllEmployees(connection) {
    try {
        const [rows] = await connection.query(`
            SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
            FROM employee e
            LEFT JOIN roles r ON e.role_id = r.id
            LEFT JOIN departments d ON r.department_id = d.id
            LEFT JOIN employee m ON e.manager_id = m.id
        `);
        outputData(rows);
    } catch (err) {
        console.error('Failed to query employees:', err);
    } finally {
        // Ensure displayMenu is called with connection
        await displayMenu(connection);
    }
}

async function addDepartment(connection) {
    try {
        // Prompt user for new department name
        const { name } = await inquirer.prompt({
            type: "input",
            name: "name",
            message: "Enter the name of the new department:",
        });

        // Parameterized query for inserting a new department
        const query = `INSERT INTO departments (department_name) VALUES (?)`;
        const [res] = await connection.execute(query, [name]);

        console.log(`Added department ${name} to the database!`);

    } catch (err) {
        console.error('Failed to add the new department:', err);
        // Handle the error appropriately
    } finally {
        // Ensure displayMenu is called with connection to return to the main menu
        await displayMenu(connection);
    }
}

async function addRole(connection) {
    try {
        // Fetch departments to list as choices
        const [departments] = await connection.query("SELECT * FROM departments");

        const departmentChoices = departments.map((dept) => ({
            name: dept.department_name,
            value: dept.id, // Use department id as the value for easier reference
        }));

        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Enter the title of the new role:",
            },
            {
                type: "input",
                name: "salary",
                message: "Enter the salary of the new role:",
            },
            {
                type: "list",
                name: "departmentId",
                message: "Select the department for the new role:",
                choices: departmentChoices,
            },
        ]);

        // Insert the new role using parameterized query
        const result = await connection.query("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", [
            answers.title,
            answers.salary,
            answers.departmentId,
        ]);

        console.log(`Added role ${answers.title} with salary ${answers.salary} to the database!`);

    } catch (err) {
        console.error('Failed to add the new role:', err);
    } finally {
        // Return to the main menu
        await displayMenu(connection);
    }
}


async function addEmployee(connection) {
    try {
        // Retrieve list of roles
        const [roles] = await connection.query("SELECT id, title FROM roles");
        const roleChoices = roles.map(({ id, title }) => ({
            name: title,
            value: id,
        }));

        // Retrieve list of employees to choose as managers
        const [employees] = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
        const managerChoices = employees.map(({ id, name }) => ({
            name,
            value: id,
        }));

        // Add an option for no manager
        managerChoices.unshift({ name: "None", value: null });

        // Prompt for employee information
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "Enter the employee's first name:",
            },
            {
                type: "input",
                name: "lastName",
                message: "Enter the employee's last name:",
            },
            {
                type: "list",
                name: "roleId",
                message: "Select the employee role:",
                choices: roleChoices,
            },
            {
                type: "list",
                name: "managerId",
                message: "Select the employee manager:",
                choices: managerChoices,
            },
        ]);

        // Insert the new employee
        const sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
        await connection.query(sql, [answers.firstName, answers.lastName, answers.roleId, answers.managerId]);

        console.log("Employee added successfully");

    } catch (error) {
        console.error('Failed to add the new employee:', error);
    } finally {
        // Return to the main menu
        await displayMenu(connection);
    }
}

async function addManager(connection) {
    try {
        // Fetch departments and employees concurrently
        const [departments] = await connection.query("SELECT * FROM departments");
        const [employees] = await connection.query("SELECT * FROM employee");

        // Prepare choices for inquirer prompts
        const departmentChoices = departments.map(dept => ({ name: dept.department_name, value: dept.id }));
        const employeeChoices = employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));

        // Prompt user for manager addition details
        const answers = await inquirer.prompt([
            {
                type: "list",
                name: "departmentId",
                message: "Select the department:",
                choices: departmentChoices,
            },
            {
                type: "list",
                name: "employeeId",
                message: "Select the employee to add a manager to:",
                choices: employeeChoices,
            },
            {
                type: "list",
                name: "managerId",
                message: "Select the employee's manager:",
                choices: [{ name: "None", value: null }, ...employeeChoices], // Allow for no manager option
            },
        ]);

        // Update the employee with the selected manager
        await connection.query(
            "UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)",
            [answers.managerId, answers.employeeId, answers.departmentId]
        );

        console.log("Manager added successfully!");

    } catch (error) {
        console.error('Failed to add the manager:', error);
    } finally {
        // Return to the main menu
        await displayMenu(connection);
    }
}

async function updateEmployeeRole(connection) {
    try {
        // Fetch employees and roles concurrently to improve performance
        const [employees] = await connection.query(
            "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id"
        );
        const [roles] = await connection.query("SELECT * FROM roles");

        // Prepare choices for inquirer prompts
        const employeeChoices = employees.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id,
        }));
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id,
        }));

        // Prompt user for employee and new role
        const answers = await inquirer.prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Select the employee to update:",
                choices: employeeChoices,
            },
            {
                type: "list",
                name: "roleId",
                message: "Select the new role:",
                choices: roleChoices,
            },
        ]);

        // Update the employee's role
        await connection.query(
            "UPDATE employee SET role_id = ? WHERE id = ?",
            [answers.roleId, answers.employeeId]
        );

        console.log("Employee role updated successfully!");

    } catch (error) {
        console.error('Failed to update the employee role:', error);
    } finally {
        // Return to the main menu
        await displayMenu(connection);
    }
}

async function viewEmployeesByManager(connection) {
    try {
        const query = `
          SELECT 
            e.id, 
            e.first_name, 
            e.last_name, 
            r.title, 
            d.department_name, 
            CONCAT(m.first_name, ' ', m.last_name) AS manager_name
          FROM 
            employee e
            INNER JOIN roles r ON e.role_id = r.id
            INNER JOIN departments d ON r.department_id = d.id
            LEFT JOIN employee m ON e.manager_id = m.id
          ORDER BY 
            manager_name, 
            e.last_name, 
            e.first_name
        `;

        const [rows] = await connection.query(query);

        // Group employees by manager
        const employeesByManager = rows.reduce((acc, cur) => {
            const managerName = cur.manager_name || 'No Manager'; // Handle employees without a manager
            acc[managerName] = acc[managerName] || [];
            acc[managerName].push(cur);
            return acc;
        }, {});

        // Display employees grouped by manager
        console.log("\nEmployees by manager:");
        Object.entries(employeesByManager).forEach(([managerName, employees]) => {
            console.log(`\n${managerName}:`);
            employees.forEach(employee => {
                console.log(`  ${employee.first_name} ${employee.last_name} | ${employee.title} | ${employee.department_name}`);
            });
        });

    } catch (error) {
        console.error('Failed to view employees by manager:', error);
    } finally {
        // Ensure consistent application flow
        await displayMenu(connection);
    }
}

async function viewEmployeesByDepartment(connection) {
    try {
        const query = `
            SELECT 
                departments.department_name, 
                employee.first_name, 
                employee.last_name 
            FROM 
                employee 
                INNER JOIN roles ON employee.role_id = roles.id 
                INNER JOIN departments ON roles.department_id = departments.id 
            ORDER BY 
                departments.department_name ASC
        `;

        const [rows] = await connection.query(query);
        console.log("\nEmployees by department:");
        outputData(rows);

    } catch (error) {
        console.error('Failed to view employees by department:', error);
    } finally {
        // Return to the main menu
        await displayMenu(connection);
    }
}

async function deleteEntries(connection) {
    try {
        const answer = await inquirer.prompt({
            type: "list",
            name: "data",
            message: "What would you like to delete?",
            choices: ["Employee", "Role", "Department"],
        });

        switch (answer.data) {
            case "Employee":
                await deleteEmployee(connection); 
                break;
            case "Role":
                await deleteRole(connection); 
                break;
            case "Department":
                await deleteDepartment(connection); 
                break;
            default:
                console.log(`Invalid data: ${answer.data}`);
                break;
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Return to the main menu
        await displayMenu(connection);
    }
}

async function deleteEmployee(connection) {
    try {
        const [employees] = await connection.query("SELECT * FROM employee");

        const employeeList = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));

        // Add a "Go Back" option
        employeeList.push({ name: "Go Back", value: "back" });

        const { id } = await inquirer.prompt({
            type: "list",
            name: "id",
            message: "Select the employee you want to delete:",
            choices: employeeList,
        });

        // Handle "Go Back" option
        if (id === "back") {
            await displayMenu(connection);
            return;
        }

        await connection.query("DELETE FROM employee WHERE id = ?", [id]);
        console.log(`Deleted employee with ID ${id} from the database!`);

    } catch (error) {
        console.error('Failed to delete the employee:', error);
    } finally {
        // Return to the main menu
        await displayMenu(connection);
    }
}

async function deleteRole(connection) {
    try {
        const [roles] = await connection.query("SELECT * FROM roles");

        const choices = roles.map(role => ({
            name: `${role.title} (${role.id}) - ${role.salary}`,
            value: role.id,
        }));

        // Add a "Go Back" option
        choices.push({ name: "Go Back", value: null });

        const { roleId } = await inquirer.prompt({
            type: "list",
            name: "roleId",
            message: "Select the role you want to delete:",
            choices: choices,
        });

        // Handle "Go Back" option
        if (roleId === null) {
            await displayMenu(connection); // Assuming displayMenu is the correct way to navigate back
            return;
        }

        await connection.query("DELETE FROM roles WHERE id = ?", [roleId]);
        console.log(`Deleted role with ID ${roleId} from the database!`);

    } catch (error) {
        console.error('Failed to delete the role:', error);
    } finally {
        await displayMenu(connection); // Ensure consistent navigation
    }
}

async function deleteDepartment(connection) {
    try {
        const [departments] = await connection.query("SELECT * FROM departments");

        const departmentChoices = departments.map(department => ({
            name: department.department_name,
            value: department.id,
        }));

        // Add a "Go Back" option
        departmentChoices.push({ name: "Go Back", value: "back" });

        const { departmentId } = await inquirer.prompt({
            type: "list",
            name: "departmentId",
            message: "Which department do you want to delete?",
            choices: departmentChoices,
        });

        // Handle "Go Back" option
        if (departmentId === "back") {
            await displayMenu(connection);
            return;
        }

        // Execute deletion query
        await connection.query("DELETE FROM departments WHERE id = ?", [departmentId]);
        console.log(`Deleted department with ID ${departmentId} from the database!`);

    } catch (error) {
        console.error('Failed to delete the department:', error);
    } finally {
        // Ensure the user is always returned to the main menu
        await displayMenu(connection);
    }
}

async function viewDepartmentBudget(connection) {
    try {
        const [departments] = await connection.query("SELECT * FROM departments");

        const departmentChoices = departments.map(department => ({
            name: department.department_name,
            value: department.id,
        }));

        const { departmentId } = await inquirer.prompt({
            type: "list",
            name: "departmentId",
            message: "Which department do you want to calculate the total salary for?",
            choices: departmentChoices,
        });

        const query = `
            SELECT 
                departments.department_name AS department,
                SUM(roles.salary) AS total_salary
            FROM 
                departments
                INNER JOIN roles ON departments.id = roles.department_id
                INNER JOIN employee ON roles.id = employee.role_id
            WHERE 
                departments.id = ?
            GROUP BY 
                departments.id;`;

        const [result] = await connection.query(query, [departmentId]);

        if (result.length > 0) {
            console.log(`The total salary for the ${result[0].department} department is $${result[0].total_salary.toLocaleString()}`);
        } else {
            console.log("Department not found or no salaries to calculate.");
        }

    } catch (error) {
        console.error('Failed to calculate the total utilized budget of the department:', error);
    } finally {
        // Return to the main menu
        await displayMenu(connection);
    }
}
