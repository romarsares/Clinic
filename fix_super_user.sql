-- Remove all 'Super User' references and use only 'SuperAdmin'
-- This is a one-time fix script

-- Update any roles named 'Super User' to 'SuperAdmin'
UPDATE roles SET name = 'SuperAdmin' WHERE name = 'Super User';

-- Verify the change
SELECT * FROM roles WHERE name LIKE '%super%';
