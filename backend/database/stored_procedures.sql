USE employee_management;

DELIMITER $$

-- ===================== DROP EXISTING =====================
DROP PROCEDURE IF EXISTS sp_login$$
DROP PROCEDURE IF EXISTS sp_get_user_by_username$$
DROP PROCEDURE IF EXISTS sp_add_employee$$
DROP PROCEDURE IF EXISTS sp_update_employee$$
DROP PROCEDURE IF EXISTS sp_delete_employee$$
DROP PROCEDURE IF EXISTS sp_get_employee_by_id$$
DROP PROCEDURE IF EXISTS sp_get_all_employees$$
DROP PROCEDURE IF EXISTS sp_get_employee_by_user_id$$
DROP PROCEDURE IF EXISTS sp_create_user$$

-- ===================== AUTH =====================
CREATE PROCEDURE sp_get_user_by_username(IN p_username VARCHAR(50))
BEGIN
    SELECT id, username, password, role, created_at
    FROM users
    WHERE username = p_username;
END$$

CREATE PROCEDURE sp_create_user(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255),
    IN p_role ENUM('Admin', 'HR', 'Manager', 'Employee'),
    OUT p_user_id INT
)
BEGIN
    INSERT INTO users (username, password, role)
    VALUES (p_username, p_password, p_role);
    SET p_user_id = LAST_INSERT_ID();
END$$

-- ===================== EMPLOYEE CRUD =====================
CREATE PROCEDURE sp_add_employee(
    IN p_user_id INT,
    IN p_emp_code VARCHAR(20),
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_department VARCHAR(50),
    IN p_designation VARCHAR(50),
    IN p_salary DECIMAL(12, 2),
    IN p_date_of_joining DATE,
    OUT p_employee_id INT
)
BEGIN
    INSERT INTO employees (
        user_id, emp_code, first_name, last_name, email, phone,
        department, designation, salary, date_of_joining, status
    ) VALUES (
        p_user_id, p_emp_code, p_first_name, p_last_name, p_email, p_phone,
        p_department, p_designation, p_salary, p_date_of_joining, 'Active'
    );
    SET p_employee_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE sp_update_employee(
    IN p_id INT,
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_department VARCHAR(50),
    IN p_designation VARCHAR(50),
    IN p_salary DECIMAL(12, 2),
    IN p_date_of_joining DATE,
    IN p_status ENUM('Active', 'Inactive')
)
BEGIN
    UPDATE employees SET
        first_name = p_first_name,
        last_name = p_last_name,
        email = p_email,
        phone = p_phone,
        department = p_department,
        designation = p_designation,
        salary = p_salary,
        date_of_joining = p_date_of_joining,
        status = p_status
    WHERE id = p_id;
END$$

CREATE PROCEDURE sp_delete_employee(IN p_id INT)
BEGIN
    DECLARE v_user_id INT;

    SELECT user_id INTO v_user_id FROM employees WHERE id = p_id;

    DELETE FROM employees WHERE id = p_id;

    IF v_user_id IS NOT NULL THEN
        DELETE FROM users WHERE id = v_user_id AND role = 'Employee';
    END IF;
END$$

CREATE PROCEDURE sp_get_employee_by_id(IN p_id INT)
BEGIN
    SELECT
        e.id, e.emp_code, e.first_name, e.last_name, e.email, e.phone,
        e.department, e.designation, e.salary, e.date_of_joining, e.status,
        e.user_id, e.created_at, e.updated_at,
        u.username, u.role
    FROM employees e
    LEFT JOIN users u ON e.user_id = u.id
    WHERE e.id = p_id;
END$$

CREATE PROCEDURE sp_get_all_employees()
BEGIN
    SELECT
        e.id, e.emp_code, e.first_name, e.last_name, e.email, e.phone,
        e.department, e.designation, e.salary, e.date_of_joining, e.status,
        e.user_id, e.created_at, e.updated_at,
        u.username, u.role
    FROM employees e
    LEFT JOIN users u ON e.user_id = u.id
    ORDER BY e.id DESC;
END$$

CREATE PROCEDURE sp_get_employee_by_user_id(IN p_user_id INT)
BEGIN
    SELECT
        e.id, e.emp_code, e.first_name, e.last_name, e.email, e.phone,
        e.department, e.designation, e.salary, e.date_of_joining, e.status,
        e.user_id, e.created_at, e.updated_at,
        u.username, u.role
    FROM employees e
    LEFT JOIN users u ON e.user_id = u.id
    WHERE e.user_id = p_user_id;
END$$

DELIMITER ;
