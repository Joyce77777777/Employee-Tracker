INSERT INTO departments (department_name)
VALUES 
('Product Development'),
('Sales'),
('Operations'),
('Customer Support'),
('Quality Assurance'),
('Logistics'),
('Procurement'),
('Human Capital'),
('Finance and Accounting'),
('Corporate Strategy');

INSERT INTO roles (title, salary, department_id)
VALUES 
('Product Manager', 135000.00, 1),
('Sales Director', 155000.00, 2),
('Operations Manager', 120000.00, 3),
('Support Lead', 95000.00, 4),
('QA Engineer', 115000.00, 5),
('Logistics Coordinator', 89000.00, 6),
('Procurement Specialist', 78000.00, 7),
('HR Manager', 130000.00, 8),
('Accountant', 110000.00, 9),
('Strategy Analyst', 170000.00, 10);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Alice', 'Johnson', 1, NULL),
('Bob', 'Smith', 2, 1),
('Carol', 'Taylor', 3, 1),
('David', 'Wilson', 4, 2),
('Eve', 'Brown', 5, 2),
('Frank', 'Davis', 6, 3),
('Grace', 'Miller', 7, 3),
('Hank', 'Moore', 8, 4),
('Ivy', 'Clark', 9, 4),
('Jack', 'Lewis', 10, 5);
