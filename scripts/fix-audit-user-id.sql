-- Drop foreign key constraint first, then make user_id nullable
ALTER TABLE audit_logs DROP FOREIGN KEY audit_logs_ibfk_2;
ALTER TABLE audit_logs MODIFY COLUMN user_id INT NULL;