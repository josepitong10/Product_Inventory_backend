-- =============================================
-- DATABASE SETUP FOR MYSQL_CONTAINER
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. SUPPLIERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier_name (supplier_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 5,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_product_name (product_name),
    INDEX idx_category (category_id),
    INDEX idx_supplier (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. INVENTORY TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_type ENUM('IN', 'OUT') NOT NULL,
    quantity INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_type (transaction_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. INSERT SAMPLE DATA
-- =============================================

-- Insert admin user (password: Admin@123)
-- Password hash generated with bcrypt
INSERT INTO users (fullname, email, password) VALUES 
('Admin User', 'admin@example.com', '$2b$10$YOUR_HASHED_PASSWORD_HERE');

-- Insert sample categories
INSERT INTO categories (category_name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Food', 'Food products and beverages'),
('Furniture', 'Home and office furniture'),
('Books', 'Books and publications'),
('Tools', 'Hardware and tools'),
('Vehicles', 'Automotive and vehicles');

-- Insert sample suppliers
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES 
('Tech Distributors Inc.', 'John Smith', '+1-555-0101', 'john@techdist.com', '123 Tech Street, Silicon Valley, CA'),
('Fashion Wholesale Ltd.', 'Sarah Johnson', '+1-555-0102', 'sarah@fashionwholesale.com', '456 Fashion Avenue, New York, NY'),
('Fresh Food Supply Co.', 'Mike Wilson', '+1-555-0103', 'mike@freshfood.com', '789 Food Market St, Chicago, IL'),
('Office Furniture Plus', 'Emily Davis', '+1-555-0104', 'emily@officefurniture.com', '321 Business Park, Dallas, TX'),
('Book World Distributors', 'Robert Brown', '+1-555-0105', 'robert@bookworld.com', '654 Library Lane, Boston, MA');

-- Insert sample products (created_by = 1 is admin user)
INSERT INTO products (product_name, category_id, supplier_id, price, quantity, minimum_stock, description, created_by) VALUES 
('Smartphone X', 1, 1, 699.99, 50, 10, 'Latest smartphone with advanced features', 1),
('Laptop Pro', 1, 1, 1299.99, 30, 8, 'High-performance laptop for professionals', 1),
('T-Shirt Classic', 2, 2, 19.99, 100, 20, 'Comfortable cotton t-shirt', 1),
('Office Chair', 4, 4, 249.99, 25, 5, 'Ergonomic office chair with lumbar support', 1),
('Wireless Headphones', 1, 1, 149.99, 75, 15, 'Noise-cancelling Bluetooth headphones', 1),
('Coffee Maker', 3, 3, 89.99, 40, 8, 'Programmable coffee maker with thermal carafe', 1),
('Desk Lamp', 4, 4, 39.99, 60, 10, 'LED desk lamp with adjustable brightness', 1);

-- =============================================
-- 7. CREATE VIEWS FOR REPORTS
-- =============================================

-- Low stock alert view
CREATE OR REPLACE VIEW low_stock_alert AS
SELECT 
    p.id,
    p.product_name,
    p.quantity,
    p.minimum_stock,
    c.category_name,
    s.supplier_name,
    (p.minimum_stock - p.quantity) AS shortage_quantity,
    CASE 
        WHEN p.quantity = 0 THEN 'Out of Stock'
        WHEN p.quantity <= p.minimum_stock THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN suppliers s ON p.supplier_id = s.id
WHERE p.quantity <= p.minimum_stock
ORDER BY shortage_quantity DESC;

-- Inventory summary view
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    p.id,
    p.product_name,
    p.quantity AS current_stock,
    p.minimum_stock,
    p.price,
    (p.price * p.quantity) AS stock_value,
    c.category_name,
    s.supplier_name,
    CASE 
        WHEN p.quantity = 0 THEN 'Out of Stock'
        WHEN p.quantity <= p.minimum_stock THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN suppliers s ON p.supplier_id = s.id
ORDER BY p.id;

-- Transaction summary view
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    t.id,
    p.product_name,
    u.fullname AS user_name,
    t.transaction_type,
    t.quantity,
    t.previous_quantity,
    t.new_quantity,
    t.notes,
    t.created_at,
    CONCAT(
        t.transaction_type, 
        ' - ', 
        p.product_name, 
        ' (', 
        t.quantity, 
        ' units)'
    ) AS description
FROM inventory_transactions t
JOIN products p ON t.product_id = p.id
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC;

-- Category product count view
CREATE OR REPLACE VIEW category_summary AS
SELECT 
    c.id,
    c.category_name,
    COUNT(p.id) AS product_count,
    SUM(p.quantity) AS total_units,
    SUM(p.price * p.quantity) AS total_value
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id
ORDER BY total_value DESC;

-- =============================================
-- 8. STORED PROCEDURES
-- =============================================

-- Get low stock products
DELIMITER //
CREATE PROCEDURE GetLowStockProducts()
BEGIN
    SELECT * FROM low_stock_alert;
END //
DELIMITER ;

-- Get inventory value by category
DELIMITER //
CREATE PROCEDURE GetInventoryValueByCategory()
BEGIN
    SELECT * FROM category_summary;
END //
DELIMITER ;

-- Get product with transaction history
DELIMITER //
CREATE PROCEDURE GetProductWithHistory(IN product_id INT)
BEGIN
    SELECT * FROM products WHERE id = product_id;
    SELECT * FROM transaction_summary WHERE id = product_id;
END //
DELIMITER ;

-- Add stock with transaction
DELIMITER //
CREATE PROCEDURE AddStock(
    IN p_product_id INT,
    IN p_quantity INT,
    IN p_user_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE current_qty INT;
    DECLARE new_qty INT;
    
    -- Get current quantity
    SELECT quantity INTO current_qty FROM products WHERE id = p_product_id;
    SET new_qty = current_qty + p_quantity;
    
    -- Update product
    UPDATE products SET quantity = new_qty WHERE id = p_product_id;
    
    -- Insert transaction
    INSERT INTO inventory_transactions 
    (product_id, user_id, transaction_type, quantity, previous_quantity, new_quantity, notes)
    VALUES (p_product_id, p_user_id, 'IN', p_quantity, current_qty, new_qty, p_notes);
    
    -- Return updated product
    SELECT * FROM products WHERE id = p_product_id;
END //
DELIMITER ;

-- Remove stock with transaction
DELIMITER //
CREATE PROCEDURE RemoveStock(
    IN p_product_id INT,
    IN p_quantity INT,
    IN p_user_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE current_qty INT;
    DECLARE new_qty INT;
    
    -- Get current quantity
    SELECT quantity INTO current_qty FROM products WHERE id = p_product_id;
    SET new_qty = current_qty - p_quantity;
    
    -- Check if enough stock
    IF new_qty < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock';
    END IF;
    
    -- Update product
    UPDATE products SET quantity = new_qty WHERE id = p_product_id;
    
    -- Insert transaction
    INSERT INTO inventory_transactions 
    (product_id, user_id, transaction_type, quantity, previous_quantity, new_quantity, notes)
    VALUES (p_product_id, p_user_id, 'OUT', p_quantity, current_qty, new_qty, p_notes);
    
    -- Return updated product
    SELECT * FROM products WHERE id = p_product_id;
END //
DELIMITER ;

-- =============================================
-- 9. TRIGGERS FOR AUDIT
-- =============================================

-- Trigger to prevent negative quantity
DELIMITER //
CREATE TRIGGER prevent_negative_quantity
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Quantity cannot be negative';
    END IF;
END //
DELIMITER ;

-- =============================================
-- 10. DISPLAY INITIAL DATA
-- =============================================

SELECT '✅ Database initialized successfully!' as 'Status';
SELECT '👥 Users:' as '', COUNT(*) as count FROM users;
SELECT '📂 Categories:' as '', COUNT(*) as count FROM categories;
SELECT '🏢 Suppliers:' as '', COUNT(*) as count FROM suppliers;
SELECT '📦 Products:' as '', COUNT(*) as count FROM products;
SELECT '📊 Transactions:' as '', COUNT(*) as count FROM inventory_transactions;

SELECT '⚠️ Low Stock Alert:' as '';
SELECT * FROM low_stock_alert;

SELECT '📊 Category Summary:' as '';
SELECT * FROM category_summary;

SELECT '✅ Setup Complete!' as '';