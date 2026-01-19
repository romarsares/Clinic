-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: clinic_saas
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `status` enum('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled',
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `idx_appointment_clinic_date` (`clinic_id`,`scheduled_date`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`doctor_id`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `action` enum('create','update','delete','login','view') DEFAULT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_agent` text,
  `method` varchar(10) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `request_body` text,
  `response_data` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_audit_clinic_user` (`clinic_id`,`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_users`
--

DROP TABLE IF EXISTS `auth_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `status` enum('active','suspended') DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email_clinic` (`clinic_id`,`email`),
  KEY `idx_user_clinic` (`clinic_id`),
  CONSTRAINT `auth_users_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_users`
--

LOCK TABLES `auth_users` WRITE;
/*!40000 ALTER TABLE `auth_users` DISABLE KEYS */;
INSERT INTO `auth_users` VALUES (1,1,'admin@clinic.com','$2b$10$rQJ8YQZ9X5K5Z5Z5Z5Z5ZOeJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5','System Administrator','active',NULL,'2026-01-19 23:50:02','2026-01-19 23:50:02',NULL);
/*!40000 ALTER TABLE `auth_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_items`
--

DROP TABLE IF EXISTS `bill_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `service_type_id` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `lab_request_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bill_service` (`bill_id`,`service_type_id`),
  CONSTRAINT `bill_items_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `patient_bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_items`
--

LOCK TABLES `bill_items` WRITE;
/*!40000 ALTER TABLE `bill_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `bill_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_items`
--

DROP TABLE IF EXISTS `billing_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `billing_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  `lab_request_id` bigint DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  KEY `lab_request_id` (`lab_request_id`),
  KEY `idx_billing_item_billing` (`billing_id`),
  CONSTRAINT `billing_items_ibfk_1` FOREIGN KEY (`billing_id`) REFERENCES `billings` (`id`),
  CONSTRAINT `billing_items_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `billing_items_ibfk_3` FOREIGN KEY (`lab_request_id`) REFERENCES `lab_requests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_items`
--

LOCK TABLES `billing_items` WRITE;
/*!40000 ALTER TABLE `billing_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billings`
--

DROP TABLE IF EXISTS `billings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  `visit_id` bigint DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `net_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('unpaid','paid','void') DEFAULT 'unpaid',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `visit_id` (`visit_id`),
  KEY `idx_billing_clinic_status` (`clinic_id`,`status`),
  CONSTRAINT `billings_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `billings_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `billings_ibfk_3` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billings`
--

LOCK TABLES `billings` WRITE;
/*!40000 ALTER TABLE `billings` DISABLE KEYS */;
/*!40000 ALTER TABLE `billings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinic_settings`
--

DROP TABLE IF EXISTS `clinic_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinic_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clinic_key` (`clinic_id`,`key`),
  CONSTRAINT `clinic_settings_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinic_settings`
--

LOCK TABLES `clinic_settings` WRITE;
/*!40000 ALTER TABLE `clinic_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `clinic_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinics`
--

DROP TABLE IF EXISTS `clinics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT NULL,
  `status` enum('trial','active','suspended') DEFAULT 'trial',
  `subscription_plan` varchar(50) DEFAULT NULL,
  `trial_ends_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clinic_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinics`
--

LOCK TABLES `clinics` WRITE;
/*!40000 ALTER TABLE `clinics` DISABLE KEYS */;
INSERT INTO `clinics` VALUES (1,'Sample Pediatric Clinic','123 Health Street, Manila',NULL,'sample@clinic.com',NULL,'active','basic',NULL,'2026-01-19 14:19:32','2026-01-19 14:19:32'),(1000,'System Clinic','System','000','admin@system.com','UTC','trial',NULL,NULL,'2026-01-19 16:18:39','2026-01-19 16:18:39');
/*!40000 ALTER TABLE `clinics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_access_logs`
--

DROP TABLE IF EXISTS `failed_access_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_access_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `url` varchar(255) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `attempted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_access_logs`
--

LOCK TABLES `failed_access_logs` WRITE;
/*!40000 ALTER TABLE `failed_access_logs` DISABLE KEYS */;
INSERT INTO `failed_access_logs` VALUES (1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0','/api/v1/auth/login','POST',401,'2026-01-19 15:54:14');
/*!40000 ALTER TABLE `failed_access_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_request_items`
--

DROP TABLE IF EXISTS `lab_request_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_request_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lab_request_id` bigint NOT NULL,
  `lab_test_id` bigint NOT NULL,
  `status` enum('pending','completed') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lab_request_id` (`lab_request_id`),
  KEY `lab_test_id` (`lab_test_id`),
  CONSTRAINT `lab_request_items_ibfk_1` FOREIGN KEY (`lab_request_id`) REFERENCES `lab_requests` (`id`),
  CONSTRAINT `lab_request_items_ibfk_2` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_request_items`
--

LOCK TABLES `lab_request_items` WRITE;
/*!40000 ALTER TABLE `lab_request_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_request_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_requests`
--

DROP TABLE IF EXISTS `lab_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  `visit_id` bigint NOT NULL,
  `request_number` varchar(50) NOT NULL,
  `requested_by` bigint NOT NULL,
  `request_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `urgency` enum('routine','urgent','stat') DEFAULT 'routine',
  `clinical_notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lab_request_number` (`clinic_id`,`request_number`),
  KEY `patient_id` (`patient_id`),
  KEY `visit_id` (`visit_id`),
  KEY `requested_by` (`requested_by`),
  KEY `idx_lab_request_status` (`clinic_id`,`status`),
  CONSTRAINT `lab_requests_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `lab_requests_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `lab_requests_ibfk_3` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`),
  CONSTRAINT `lab_requests_ibfk_4` FOREIGN KEY (`requested_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_requests`
--

LOCK TABLES `lab_requests` WRITE;
/*!40000 ALTER TABLE `lab_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_result_details`
--

DROP TABLE IF EXISTS `lab_result_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_result_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lab_result_id` bigint NOT NULL,
  `lab_test_id` bigint NOT NULL,
  `parameter_name` varchar(255) NOT NULL,
  `result_value` varchar(255) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `normal_range` varchar(100) DEFAULT NULL,
  `is_abnormal` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lab_test_id` (`lab_test_id`),
  KEY `idx_lab_result_detail_result` (`lab_result_id`),
  CONSTRAINT `lab_result_details_ibfk_1` FOREIGN KEY (`lab_result_id`) REFERENCES `lab_results` (`id`),
  CONSTRAINT `lab_result_details_ibfk_2` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_result_details`
--

LOCK TABLES `lab_result_details` WRITE;
/*!40000 ALTER TABLE `lab_result_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_result_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_results`
--

DROP TABLE IF EXISTS `lab_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lab_request_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `result_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `entered_by` bigint NOT NULL,
  `verified_by` bigint DEFAULT NULL,
  `overall_status` enum('normal','abnormal','critical') DEFAULT 'normal',
  `remarks` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lab_request_id` (`lab_request_id`),
  KEY `clinic_id` (`clinic_id`),
  KEY `entered_by` (`entered_by`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `lab_results_ibfk_1` FOREIGN KEY (`lab_request_id`) REFERENCES `lab_requests` (`id`),
  CONSTRAINT `lab_results_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `lab_results_ibfk_3` FOREIGN KEY (`entered_by`) REFERENCES `auth_users` (`id`),
  CONSTRAINT `lab_results_ibfk_4` FOREIGN KEY (`verified_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_results`
--

LOCK TABLES `lab_results` WRITE;
/*!40000 ALTER TABLE `lab_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `test_code` varchar(50) NOT NULL,
  `test_name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `normal_range_config` json DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lab_test_code_clinic` (`clinic_id`,`test_code`),
  CONSTRAINT `lab_tests_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_allergies`
--

DROP TABLE IF EXISTS `patient_allergies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_allergies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `allergen` varchar(255) NOT NULL,
  `reaction` text,
  `severity` enum('mild','moderate','severe') DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `clinic_id` (`clinic_id`),
  CONSTRAINT `patient_allergies_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `patient_allergies_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_allergies`
--

LOCK TABLES `patient_allergies` WRITE;
/*!40000 ALTER TABLE `patient_allergies` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_allergies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_bills`
--

DROP TABLE IF EXISTS `patient_bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_bills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clinic_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `visit_id` int DEFAULT NULL,
  `bill_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','pending','paid','cancelled') DEFAULT 'draft',
  `bill_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bill_number` (`clinic_id`,`bill_number`),
  KEY `idx_patient_status` (`patient_id`,`status`),
  KEY `idx_clinic_date` (`clinic_id`,`bill_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_bills`
--

LOCK TABLES `patient_bills` WRITE;
/*!40000 ALTER TABLE `patient_bills` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_medical_history`
--

DROP TABLE IF EXISTS `patient_medical_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_medical_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `history_type` enum('past_illness','surgery','hospitalization','family_history') NOT NULL,
  `condition_name` varchar(255) NOT NULL,
  `diagnosed_date` date DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `clinic_id` (`clinic_id`),
  CONSTRAINT `patient_medical_history_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `patient_medical_history_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_medical_history`
--

LOCK TABLES `patient_medical_history` WRITE;
/*!40000 ALTER TABLE `patient_medical_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_medical_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_medications`
--

DROP TABLE IF EXISTS `patient_medications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_medications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `medication_name` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `prescribed_by` bigint DEFAULT NULL,
  `status` enum('active','discontinued') DEFAULT 'active',
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `clinic_id` (`clinic_id`),
  KEY `prescribed_by` (`prescribed_by`),
  CONSTRAINT `patient_medications_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `patient_medications_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `patient_medications_ibfk_3` FOREIGN KEY (`prescribed_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_medications`
--

LOCK TABLES `patient_medications` WRITE;
/*!40000 ALTER TABLE `patient_medications` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_medications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `patient_code` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `birth_date` date NOT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `parent_patient_id` bigint DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_patient_code_clinic` (`clinic_id`,`patient_code`),
  KEY `idx_patient_clinic` (`clinic_id`),
  KEY `idx_patient_parent` (`parent_patient_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `patients_ibfk_2` FOREIGN KEY (`parent_patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `billing_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','gcash') DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `received_by` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `clinic_id` (`clinic_id`),
  KEY `received_by` (`received_by`),
  KEY `idx_payment_billing` (`billing_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`billing_id`) REFERENCES `billings` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permission_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'patients.view','View Patients','Can view patient demographic data and lists.','Patient','2026-01-19 14:19:32'),(2,'patients.create','Create Patients','Can create new patient profiles.','Patient','2026-01-19 14:19:32'),(3,'patients.edit','Edit Patients','Can edit patient demographic information.','Patient','2026-01-19 14:19:32'),(4,'patients.delete','Delete Patients','Can soft-delete patient profiles.','Patient','2026-01-19 14:19:32'),(5,'appointments.view','View Appointments','Can view the clinic appointment schedule.','Appointment','2026-01-19 14:19:32'),(6,'appointments.create','Create Appointments','Can schedule new appointments for patients.','Appointment','2026-01-19 14:19:32'),(7,'appointments.edit','Edit Appointments','Can reschedule or update existing appointments.','Appointment','2026-01-19 14:19:32'),(8,'appointments.cancel','Cancel Appointments','Can cancel an appointment.','Appointment','2026-01-19 14:19:32'),(9,'clinical.diagnoses.create','Create Diagnoses','Can add a clinical diagnosis to a patient visit. (Doctor-level)','Clinical','2026-01-19 14:19:32'),(10,'clinical.diagnoses.edit','Edit Diagnoses','Can edit an existing clinical diagnosis.','Clinical','2026-01-19 14:19:32'),(11,'clinical.vitals.create','Record Vital Signs','Can record patient vital signs like BP, temp, etc.','Clinical','2026-01-19 14:19:32'),(12,'clinical.history.view','View Medical History','Can view a patients full medical history.','Clinical','2026-01-19 14:19:32'),(13,'labs.requests.create','Create Lab Requests','Can order new laboratory tests for a patient. (Doctor-level)','Laboratory','2026-01-19 14:19:32'),(14,'labs.requests.view','View Lab Requests','Can view the status of lab requests.','Laboratory','2026-01-19 14:19:32'),(15,'labs.results.enter','Enter Lab Results','Can enter the results for a completed lab test. (Lab Tech-level)','Laboratory','2026-01-19 14:19:32'),(16,'labs.results.verify','Verify Lab Results','Can review and verify the accuracy of entered lab results. (Doctor-level)','Laboratory','2026-01-19 14:19:32'),(17,'billing.invoices.view','View Invoices','Can view patient invoices and billing history.','Billing','2026-01-19 14:19:32'),(18,'billing.invoices.create','Create Invoices','Can create new invoices for services rendered.','Billing','2026-01-19 14:19:32'),(19,'billing.payments.create','Record Payments','Can record a payment made against an invoice.','Billing','2026-01-19 14:19:32'),(20,'reports.operational.view','View Operational Reports','Can view reports on appointments, revenue, etc.','Reports','2026-01-19 14:19:32'),(21,'reports.clinical.view','View Clinical Reports','Can view reports on disease prevalence, common diagnoses, etc.','Reports','2026-01-19 14:19:32'),(22,'admin.users.manage','Manage Users','Can create, edit, and suspend users within the clinic.','Admin','2026-01-19 14:19:32'),(23,'admin.roles.manage','Manage Roles & Permissions','Can create and edit roles and their assigned permissions.','Admin','2026-01-19 14:19:32'),(24,'admin.settings.manage','Manage Clinic Settings','Can configure clinic-wide settings.','Admin','2026-01-19 14:19:32');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_permission` (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_name_clinic` (`clinic_id`,`name`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,1,'Owner','Clinic owner with full access','2026-01-19 23:50:02','2026-01-19 23:50:02'),(2,1,'Doctor','Medical doctor','2026-01-19 23:50:02','2026-01-19 23:50:02'),(4,1,'Staff','Front desk and administrative staff','2026-01-19 14:19:32','2026-01-19 14:19:32'),(5,1,'Lab Technician','Laboratory technician for entering lab results','2026-01-19 14:19:32','2026-01-19 14:19:32');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_types`
--

DROP TABLE IF EXISTS `service_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clinic_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('consultation','procedure','lab_test','vaccine','other') NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clinic_category` (`clinic_id`,`category`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_types`
--

LOCK TABLES `service_types` WRITE;
/*!40000 ALTER TABLE `service_types` DISABLE KEYS */;
INSERT INTO `service_types` VALUES (1,1,'General Consultation','consultation',500.00,1,'2026-01-19 15:49:13'),(2,1,'Pediatric Consultation','consultation',600.00,1,'2026-01-19 15:49:13'),(3,1,'Follow-up Visit','consultation',300.00,1,'2026-01-19 15:49:13'),(4,1,'Complete Blood Count (CBC)','lab_test',250.00,1,'2026-01-19 15:49:13'),(5,1,'Urinalysis','lab_test',150.00,1,'2026-01-19 15:49:13'),(6,1,'Blood Chemistry','lab_test',400.00,1,'2026-01-19 15:49:13'),(7,1,'General Consultation','consultation',500.00,1,'2026-01-19 15:49:19'),(8,1,'Pediatric Consultation','consultation',600.00,1,'2026-01-19 15:49:19'),(9,1,'Follow-up Visit','consultation',300.00,1,'2026-01-19 15:49:19'),(10,1,'Complete Blood Count (CBC)','lab_test',250.00,1,'2026-01-19 15:49:19'),(11,1,'Urinalysis','lab_test',150.00,1,'2026-01-19 15:49:19'),(12,1,'Blood Chemistry','lab_test',400.00,1,'2026-01-19 15:49:19'),(13,1,'General Consultation','consultation',500.00,1,'2026-01-19 15:49:41'),(14,1,'Pediatric Consultation','consultation',600.00,1,'2026-01-19 15:49:41'),(15,1,'Follow-up Visit','consultation',300.00,1,'2026-01-19 15:49:41'),(16,1,'Complete Blood Count (CBC)','lab_test',250.00,1,'2026-01-19 15:49:41'),(17,1,'Urinalysis','lab_test',150.00,1,'2026-01-19 15:49:41'),(18,1,'Blood Chemistry','lab_test',400.00,1,'2026-01-19 15:49:41'),(19,1,'General Consultation','consultation',500.00,1,'2026-01-19 15:49:49'),(20,1,'Pediatric Consultation','consultation',600.00,1,'2026-01-19 15:49:49'),(21,1,'Follow-up Visit','consultation',300.00,1,'2026-01-19 15:49:49'),(22,1,'Complete Blood Count (CBC)','lab_test',250.00,1,'2026-01-19 15:49:49'),(23,1,'Urinalysis','lab_test',150.00,1,'2026-01-19 15:49:49'),(24,1,'Blood Chemistry','lab_test',400.00,1,'2026-01-19 15:49:49'),(25,1,'General Consultation','consultation',500.00,1,'2026-01-19 15:50:02'),(26,1,'Pediatric Consultation','consultation',600.00,1,'2026-01-19 15:50:02'),(27,1,'Follow-up Visit','consultation',300.00,1,'2026-01-19 15:50:02'),(28,1,'Complete Blood Count (CBC)','lab_test',250.00,1,'2026-01-19 15:50:02'),(29,1,'Urinalysis','lab_test',150.00,1,'2026-01-19 15:50:02'),(30,1,'Blood Chemistry','lab_test',400.00,1,'2026-01-19 15:50:02');
/*!40000 ALTER TABLE `service_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `service_type` enum('consultation','procedure','laboratory') DEFAULT 'consultation',
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_name_clinic` (`clinic_id`,`name`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_logs`
--

DROP TABLE IF EXISTS `sms_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sms_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `recipient` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `status` enum('sent','delivered','failed') DEFAULT 'sent',
  `provider_message_id` varchar(255) DEFAULT NULL,
  `sent_by` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sent_by` (`sent_by`),
  KEY `idx_sms_clinic_status` (`clinic_id`,`status`),
  CONSTRAINT `sms_logs_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `sms_logs_ibfk_2` FOREIGN KEY (`sent_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_logs`
--

LOCK TABLES `sms_logs` WRITE;
/*!40000 ALTER TABLE `sms_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_role` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`),
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (42,1,1,'2026-01-19 23:50:02');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_attachments`
--

DROP TABLE IF EXISTS `visit_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `visit_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `uploaded_by` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `clinic_id` (`clinic_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_visit_attachment` (`visit_id`),
  CONSTRAINT `visit_attachments_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`),
  CONSTRAINT `visit_attachments_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `visit_attachments_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_attachments`
--

LOCK TABLES `visit_attachments` WRITE;
/*!40000 ALTER TABLE `visit_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_diagnoses`
--

DROP TABLE IF EXISTS `visit_diagnoses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_diagnoses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `visit_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `diagnosis_type` enum('primary','secondary') DEFAULT 'primary',
  `diagnosis_code` varchar(50) DEFAULT NULL,
  `diagnosis_name` varchar(255) NOT NULL,
  `clinical_notes` text,
  `diagnosed_by` bigint NOT NULL,
  `diagnosed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `visit_id` (`visit_id`),
  KEY `clinic_id` (`clinic_id`),
  KEY `diagnosed_by` (`diagnosed_by`),
  KEY `idx_visit_diagnosis_code` (`diagnosis_code`),
  CONSTRAINT `visit_diagnoses_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`),
  CONSTRAINT `visit_diagnoses_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `visit_diagnoses_ibfk_3` FOREIGN KEY (`diagnosed_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_diagnoses`
--

LOCK TABLES `visit_diagnoses` WRITE;
/*!40000 ALTER TABLE `visit_diagnoses` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit_diagnoses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_notes`
--

DROP TABLE IF EXISTS `visit_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_notes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `visit_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `note_type` enum('complaint','diagnosis','treatment','remarks') DEFAULT NULL,
  `content` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `clinic_id` (`clinic_id`),
  KEY `idx_visit_notes` (`visit_id`),
  CONSTRAINT `visit_notes_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`),
  CONSTRAINT `visit_notes_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_notes`
--

LOCK TABLES `visit_notes` WRITE;
/*!40000 ALTER TABLE `visit_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_vital_signs`
--

DROP TABLE IF EXISTS `visit_vital_signs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_vital_signs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `visit_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `blood_pressure_systolic` int DEFAULT NULL,
  `blood_pressure_diastolic` int DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `respiratory_rate` int DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `bmi` decimal(4,2) DEFAULT NULL,
  `oxygen_saturation` int DEFAULT NULL,
  `recorded_by` bigint NOT NULL,
  `recorded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `clinic_id` (`clinic_id`),
  KEY `recorded_by` (`recorded_by`),
  KEY `idx_visit_vitals` (`visit_id`),
  CONSTRAINT `visit_vital_signs_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`),
  CONSTRAINT `visit_vital_signs_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `visit_vital_signs_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_vital_signs`
--

LOCK TABLES `visit_vital_signs` WRITE;
/*!40000 ALTER TABLE `visit_vital_signs` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit_vital_signs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visits`
--

DROP TABLE IF EXISTS `visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visits` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `appointment_id` bigint DEFAULT NULL,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint NOT NULL,
  `visit_date` datetime NOT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `idx_visit_clinic_date` (`clinic_id`,`visit_date`),
  CONSTRAINT `visits_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `visits_ibfk_3` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `visits_ibfk_4` FOREIGN KEY (`doctor_id`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
/*!40000 ALTER TABLE `visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'clinic_saas'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-19 23:54:55
