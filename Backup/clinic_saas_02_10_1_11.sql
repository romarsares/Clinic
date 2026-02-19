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
-- Table structure for table `appointment_types`
--

DROP TABLE IF EXISTS `appointment_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_types` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `duration_minutes` int DEFAULT '30',
  `color` varchar(7) DEFAULT '#007bff',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_appointment_type_name_clinic` (`clinic_id`,`name`),
  KEY `idx_appointment_type_clinic` (`clinic_id`),
  CONSTRAINT `appointment_types_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_types`
--

LOCK TABLES `appointment_types` WRITE;
/*!40000 ALTER TABLE `appointment_types` DISABLE KEYS */;
INSERT INTO `appointment_types` VALUES (1,1,'Consultation','General medical consultation',30,'#007bff',1,'2026-01-21 16:08:45','2026-01-21 16:08:45'),(2,1,'Follow-up','Follow-up visit for existing condition',20,'#28a745',1,'2026-01-21 16:08:45','2026-01-21 16:08:45'),(3,1,'Check-up','Routine health check-up',45,'#17a2b8',1,'2026-01-21 16:08:45','2026-01-21 16:08:45'),(4,1,'Vaccination','Immunization appointment',15,'#ffc107',1,'2026-01-21 16:08:45','2026-01-21 16:08:45'),(5,1,'Emergency','Urgent medical consultation',60,'#dc3545',1,'2026-01-21 16:08:45','2026-01-21 16:08:45');
/*!40000 ALTER TABLE `appointment_types` ENABLE KEYS */;
UNLOCK TABLES;

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
  `appointment_type_id` bigint DEFAULT NULL,
  `appointment_date` date NOT NULL,
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
  KEY `appointment_type_id` (`appointment_type_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`doctor_id`) REFERENCES `auth_users` (`id`),
  CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`appointment_type_id`) REFERENCES `appointment_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,1,1,1,NULL,'2026-01-20','2026-01-20','09:00:00','scheduled',NULL,'2026-01-20 01:41:47','2026-01-20 01:41:47',NULL);
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
  `user_id` bigint DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` bigint DEFAULT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `method` varchar(10) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `request_body` json DEFAULT NULL,
  `response_data` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_audit_clinic_user` (`clinic_id`,`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=419 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,1,'LOGIN','auth_users',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-20 01:41:47'),(2,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 01:42:22'),(3,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 01:42:25'),(4,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 01:42:35'),(5,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:49:59'),(6,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:50:03'),(7,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:50:49'),(8,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:51:29'),(9,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:51:51'),(10,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:51:57'),(11,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:52:06'),(12,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:52:10'),(13,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:52:54'),(14,1,NULL,'auth_login_failed',NULL,NULL,'user',NULL,NULL,'{\"email\": \"admin@clinic.com\", \"reason\": \"Invalid password\", \"success\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','POST','/api/v1/auth/login',401,NULL,NULL,'2026-01-20 12:53:03'),(15,1,1,'view',NULL,NULL,'clinic_stats',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',500,'{}','{\"error\": \"clinicController.getStats is not a function\", \"timestamp\": \"2026-01-20T05:40:55.313Z\"}','2026-01-20 13:40:55'),(16,1,1,'view',NULL,NULL,'clinic_stats',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',500,'{}','{\"error\": \"clinicController.getStats is not a function\", \"timestamp\": \"2026-01-20T05:40:57.894Z\"}','2026-01-20 13:40:57'),(17,1,1,'view',NULL,NULL,'clinic_stats',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',500,'{}','{\"error\": \"clinicController.getStats is not a function\", \"timestamp\": \"2026-01-20T05:42:35.052Z\"}','2026-01-20 13:42:35'),(18,1,1,'view',NULL,NULL,'clinic_stats',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',500,'{}','{\"error\": \"clinicController.getStats is not a function\", \"timestamp\": \"2026-01-20T05:51:40.944Z\"}','2026-01-20 13:51:40'),(19,1,1,'view',NULL,NULL,'clinic_stats',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',500,'{}','{\"error\": \"clinicController.getStats is not a function\", \"timestamp\": \"2026-01-20T05:51:46.737Z\"}','2026-01-20 13:51:46'),(20,1,1,'view',NULL,NULL,'clinic_stats',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',500,'{}','{\"error\": \"clinicController.getStats is not a function\", \"timestamp\": \"2026-01-20T05:53:41.753Z\"}','2026-01-20 13:53:41'),(21,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',200,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:54:11'),(22,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:54:41'),(23,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:55:11'),(24,1,1,'list',NULL,NULL,'user',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/users',500,'{}','{\"error\": \"userController.listUsers is not a function\", \"timestamp\": \"2026-01-20T05:55:21.073Z\"}','2026-01-20 13:55:21'),(25,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:55:26'),(26,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:55:29'),(27,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:55:32'),(28,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:55:37'),(29,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:55:39'),(30,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:56:06'),(31,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:56:36'),(32,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:56:49'),(33,1,1,'list',NULL,NULL,'user',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/users',500,'{}','{\"error\": \"userController.listUsers is not a function\", \"timestamp\": \"2026-01-20T05:56:50.171Z\"}','2026-01-20 13:56:50'),(34,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:56:59'),(35,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:59:56'),(36,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 13:59:57'),(37,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:00:19'),(38,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:00:22'),(39,1,1,'list',NULL,NULL,'user',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/users',500,'{}','{\"error\": \"userController.listUsers is not a function\", \"timestamp\": \"2026-01-20T06:00:24.010Z\"}','2026-01-20 14:00:24'),(40,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:00:31'),(41,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:00:55'),(42,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:21:27'),(43,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:21:51'),(44,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:22:01'),(45,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:22:11'),(46,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:22:21'),(47,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:22:31'),(48,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:22:41'),(49,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:23:18'),(50,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:24:18'),(51,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:25:18'),(52,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:26:18'),(53,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:27:18'),(54,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:28:03'),(55,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:28:11'),(56,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:28:21'),(57,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:28:31'),(58,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:28:41'),(59,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:28:51'),(60,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:29:01'),(61,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:29:18'),(62,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:30:18'),(63,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:31:18'),(64,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:32:18'),(65,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:33:18'),(66,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:34:18'),(67,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:35:18'),(68,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:36:18'),(69,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:37:18'),(70,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:38:18'),(71,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:39:18'),(72,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:40:18'),(73,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:40:22'),(74,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:40:31'),(75,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:40:41'),(76,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:40:51'),(77,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:41:01'),(78,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:41:11'),(79,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:41:21'),(80,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:42:18'),(81,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:43:18'),(82,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:44:18'),(83,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:45:18'),(84,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:46:18'),(85,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:47:18'),(86,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:47:36'),(87,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:47:41'),(88,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:47:51'),(89,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:48:01'),(90,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:48:11'),(91,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:48:21'),(92,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:48:31'),(93,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:48:41'),(94,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:49:18'),(95,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:50:18'),(96,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:51:18'),(97,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:52:18'),(98,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:53:18'),(99,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:53:40'),(100,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:53:42'),(101,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:53:56'),(102,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:54:01'),(103,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 14:54:11'),(104,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:02:42'),(105,1,1,'list',NULL,NULL,'user',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/users',500,'{}','{\"error\": \"userController.listUsers is not a function\", \"timestamp\": \"2026-01-20T07:02:51.723Z\"}','2026-01-20 15:02:51'),(106,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:03:00'),(107,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:06:43'),(108,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:06:50'),(109,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:00'),(110,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:04'),(111,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:05'),(112,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:05'),(113,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:05'),(114,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:06'),(115,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:06'),(116,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:06'),(117,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:07:07'),(118,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:11:38'),(119,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:11:41'),(120,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:11:50'),(121,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:12:20'),(122,1,1,'list',NULL,NULL,'user',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/users',500,'{}','{\"error\": \"userController.listUsers is not a function\", \"timestamp\": \"2026-01-20T07:12:32.306Z\"}','2026-01-20 15:12:32'),(123,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:12:50'),(124,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:13:20'),(125,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:13:50'),(126,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:14:20'),(127,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:14:50'),(128,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:15:20'),(129,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:15:50'),(130,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:16:21'),(131,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:16:51'),(132,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:17:20'),(133,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:17:22'),(134,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:17:33'),(135,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:17:35'),(136,1,1,'list',NULL,NULL,'user',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/users',500,'{}','{\"error\": \"userController.listUsers is not a function\", \"timestamp\": \"2026-01-20T07:17:45.434Z\"}','2026-01-20 15:17:45'),(137,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:17:49'),(138,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:18:20'),(139,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:18:50'),(140,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:19:20'),(141,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:19:50'),(142,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 15:20:20'),(143,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',200,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:19:53'),(144,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:19:56'),(145,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:19:57'),(146,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:20:27'),(147,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:20:58'),(148,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:21:28'),(149,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:21:58'),(150,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:22:28'),(151,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:22:57'),(152,1,1,'list',NULL,NULL,'user',NULL,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/users',500,'{}','{\"error\": \"userController.listUsers is not a function\", \"timestamp\": \"2026-01-20T08:24:41.513Z\"}','2026-01-20 16:24:41'),(153,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:24:44'),(154,1,1,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 1, \"activeUsers\": 1, \"todayVisits\": 1, \"todayRevenue\": \"1500.00\", \"totalPatients\": 1, \"todayAppointments\": 1}}','2026-01-20 16:26:02'),(155,1,2,'user_register',NULL,NULL,'user',2,NULL,'{\"email\": \"test.owner@clinic.com\", \"clinic_id\": 1, \"full_name\": \"Test Owner\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/auth/register',NULL,NULL,NULL,'2026-01-21 12:49:39'),(156,1,3,'user_register',NULL,NULL,'user',3,NULL,'{\"email\": \"test.doctor@clinic.com\", \"clinic_id\": 1, \"full_name\": \"Test Doctor\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/auth/register',NULL,NULL,NULL,'2026-01-21 12:49:39'),(157,1,4,'user_register',NULL,NULL,'user',4,NULL,'{\"email\": \"test.staff@clinic.com\", \"clinic_id\": 1, \"full_name\": \"Test Staff\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/auth/register',NULL,NULL,NULL,'2026-01-21 12:49:39'),(158,1,5,'user_register',NULL,NULL,'user',5,NULL,'{\"email\": \"test.labtech@clinic.com\", \"clinic_id\": 1, \"full_name\": \"Test Lab Tech\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/auth/register',NULL,NULL,NULL,'2026-01-21 12:49:39'),(159,1,6,'user_register',NULL,NULL,'user',6,NULL,'{\"email\": \"test.roleuser@clinic.com\", \"clinic_id\": 1, \"full_name\": \"Test Role User\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/auth/register',NULL,NULL,NULL,'2026-01-21 12:54:24'),(160,1,1,'user_roles_update',NULL,NULL,'user_roles',6,'{\"role_ids\": []}','{\"role_ids\": [3]}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/6/roles',NULL,NULL,NULL,'2026-01-21 12:54:24'),(161,1,1,'user_roles_update',NULL,NULL,'user_roles',6,'{\"role_ids\": [3]}','{\"role_ids\": [4]}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/6/roles',NULL,NULL,NULL,'2026-01-21 12:54:24'),(162,1,1,'user_roles_update',NULL,NULL,'user_roles',6,'{\"role_ids\": [4]}','{\"role_ids\": []}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/6/roles',NULL,NULL,NULL,'2026-01-21 12:54:24'),(163,1,1,'user_status_change',NULL,NULL,'user',6,NULL,'{\"status\": \"suspended\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/6/status',NULL,NULL,NULL,'2026-01-21 12:54:24'),(164,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\", \"dashboard_refresh_interval\": \"60\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-21 13:28:52'),(165,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\", \"dashboard_refresh_interval\": \"60\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-21 13:29:10'),(166,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\", \"dashboard_refresh_interval\": \"60\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-21 13:29:54'),(167,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\", \"dashboard_refresh_interval\": \"60\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-21 13:44:06'),(168,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1768977275082.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-21 14:34:35'),(169,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1768977275082.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-21 14:34:35'),(170,1,1,'user_create',NULL,NULL,'user',7,NULL,'{\"email\": \"testuser@clinic.com\", \"role_ids\": [2], \"full_name\": \"Test User\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users',NULL,NULL,NULL,'2026-01-21 14:49:56'),(171,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-01-21 14:49:56'),(172,1,1,'user_roles_update',NULL,NULL,'user_roles',7,'{\"role_ids\": [2]}','{\"role_ids\": [3]}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/7/roles',NULL,NULL,NULL,'2026-01-21 14:49:56'),(173,1,1,'user_status_change',NULL,NULL,'user',7,NULL,'{\"status\": \"suspended\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/7/status',NULL,NULL,NULL,'2026-01-21 14:49:56'),(174,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-21 14:49:57'),(175,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-21 14:49:58'),(176,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-21 14:49:58'),(177,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1768978198390.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-21 14:49:58'),(178,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1768978198390.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-21 14:49:58'),(179,1,1,'user_delete',NULL,NULL,'user',7,NULL,NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/7',NULL,NULL,NULL,'2026-01-21 14:49:59'),(180,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-01-21 14:52:12'),(181,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-21 14:52:13'),(182,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-21 14:52:13'),(183,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-21 14:52:14'),(184,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1768978334171.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-21 14:52:14'),(185,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1768978334171.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-21 14:52:14'),(186,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-01-22 13:04:28'),(187,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-22 13:04:29'),(188,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-22 13:04:29'),(189,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-22 13:04:30'),(190,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1769058270088.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-22 13:04:30'),(191,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1769058270088.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-22 13:04:30'),(192,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-01-24 21:44:59'),(193,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-24 21:45:00'),(194,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-24 21:45:01'),(195,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-24 21:45:01'),(196,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1769262301741.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-24 21:45:01'),(197,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1769262301741.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-24 21:45:01'),(198,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-01-24 21:52:11'),(199,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-24 21:52:12'),(200,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-24 21:52:13'),(201,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-24 21:52:13'),(202,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1769262733371.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-24 21:52:13'),(203,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1769262733371.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-24 21:52:13'),(204,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-01-24 22:06:58'),(205,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-24 22:06:59'),(206,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-01-24 22:06:59'),(207,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-01-24 22:06:59'),(208,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1769263619785.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-24 22:06:59'),(209,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1769263619785.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-01-24 22:06:59'),(210,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-02-07 23:48:25'),(211,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-07 23:48:26'),(212,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-07 23:48:27'),(213,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-02-07 23:48:27'),(214,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770479307303.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-07 23:48:27'),(215,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770479307303.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-07 23:48:27'),(216,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-02-08 00:08:06'),(217,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-08 00:08:06'),(218,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-08 00:08:07'),(219,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-02-08 00:08:07'),(220,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770480487569.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-08 00:08:07'),(221,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770480487569.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-08 00:08:07'),(222,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-02-08 00:15:35'),(223,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-08 00:15:35'),(224,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-08 00:15:36'),(225,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-02-08 00:15:36'),(226,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770480936638.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-08 00:15:36'),(227,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770480936638.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-08 00:15:36'),(228,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-02-08 00:20:47'),(229,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-08 00:20:47'),(230,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-08 00:20:48'),(231,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-02-08 00:20:48'),(232,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770481248407.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-08 00:20:48'),(233,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770481248407.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-08 00:20:48'),(234,1,1,'user_update',NULL,NULL,'user',1,NULL,'{\"email\": \"updated@clinic.com\", \"last_name\": \"Name\", \"first_name\": \"Updated\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1',NULL,NULL,NULL,'2026-02-09 17:48:23'),(235,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-09 17:48:23'),(236,1,1,'password_change',NULL,NULL,'user',1,NULL,NULL,'::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/password',NULL,NULL,NULL,'2026-02-09 17:48:24'),(237,1,1,'user_preferences_update',NULL,NULL,'user_preferences',1,NULL,'{\"theme\": \"dark\", \"language\": \"en\", \"notifications_enabled\": \"true\"}','::ffff:127.0.0.1',NULL,'PUT','/api/v1/users/1/preferences',NULL,NULL,NULL,'2026-02-09 17:48:24'),(238,1,1,'avatar_upload',NULL,NULL,'user',1,NULL,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770630504607.jpg\"}','::ffff:127.0.0.1',NULL,'POST','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-09 17:48:24'),(239,1,1,'avatar_delete',NULL,NULL,'user',1,'{\"avatar_url\": \"/uploads/avatars/avatar-1-1770630504607.jpg\"}',NULL,'::ffff:127.0.0.1',NULL,'DELETE','/api/v1/users/1/avatar',NULL,NULL,NULL,'2026-02-09 17:48:24'),(240,999,1036,'view',NULL,NULL,'clinic_stats',999,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/999/stats',200,'{}','{\"data\": {\"totalUsers\": 6, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 0, \"todayAppointments\": 0}}','2026-02-09 17:59:22'),(241,999,1036,'view',NULL,NULL,'clinic_stats',999,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/999/stats',304,'{}','{\"data\": {\"totalUsers\": 6, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 0, \"todayAppointments\": 0}}','2026-02-09 17:59:31'),(242,999,1036,'view',NULL,NULL,'clinic_stats',999,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/999/stats',304,'{}','{\"data\": {\"totalUsers\": 6, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 0, \"todayAppointments\": 0}}','2026-02-09 17:59:38'),(243,999,1036,'view',NULL,NULL,'clinic_stats',999,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/999/stats',304,'{}','{\"data\": {\"totalUsers\": 6, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 0, \"todayAppointments\": 0}}','2026-02-09 18:02:24'),(244,999,1036,'view',NULL,NULL,'clinic_stats',999,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/999/stats',304,'{}','{\"data\": {\"totalUsers\": 6, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 0, \"todayAppointments\": 0}}','2026-02-09 18:02:47'),(245,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',200,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 22:55:01'),(246,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:29:30'),(247,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:29:52'),(248,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:29:59'),(249,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:30:29'),(250,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:30:59'),(251,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:31:29'),(252,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:31:59'),(253,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:32:29'),(254,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:32:59'),(255,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:34:03'),(256,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:34:29'),(257,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:34:59'),(258,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:36:03'),(259,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:37:03'),(260,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:38:03'),(261,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:39:03'),(262,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:40:03'),(263,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:41:03'),(264,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:42:03'),(265,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:43:03'),(266,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:44:03'),(267,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:45:03'),(268,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:46:03'),(269,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:47:03'),(270,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:48:03'),(271,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:48:47'),(272,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:48:48'),(273,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:48:58'),(274,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:49:06'),(275,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:54:51'),(276,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:54:55'),(277,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:54:58'),(278,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:55:08'),(279,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:55:18'),(280,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:55:28'),(281,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:55:38'),(282,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:55:48'),(283,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:55:59'),(284,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:56:09'),(285,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:56:12'),(286,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:56:15'),(287,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:57:52'),(288,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:58:31'),(289,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:58:35'),(290,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:58:45'),(291,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:58:55'),(292,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:59:05'),(293,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:59:15'),(294,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:59:25'),(295,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',200,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-09 23:59:40'),(296,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:00:10'),(297,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:00:40'),(298,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:01:10'),(299,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:01:40'),(300,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:01:46'),(301,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:02:16'),(302,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:02:28'),(303,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:02:29'),(304,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:02:30'),(305,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:02:30'),(306,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:03:00'),(307,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:03:10'),(308,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:03:30'),(309,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:04:00'),(310,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:04:15'),(311,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:04:37'),(312,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:04:42'),(313,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:05:00'),(314,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:05:30'),(315,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:05:42'),(316,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:05:49'),(317,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:06:13'),(318,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:08:29'),(319,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:08:36'),(320,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:09:06'),(321,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:09:26'),(322,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:09:56'),(323,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:10:09'),(324,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:10:12'),(325,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:10:16'),(326,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:10:46'),(327,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:10:58'),(328,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:11:28'),(329,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:11:58'),(330,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:12:28'),(331,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:12:58'),(332,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:13:28'),(333,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:13:58'),(334,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:14:28'),(335,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:14:58'),(336,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:15:28'),(337,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:15:58'),(338,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:16:28'),(339,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:16:58'),(340,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:17:28'),(341,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:17:58'),(342,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:18:27'),(343,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:26:15'),(344,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:26:30'),(345,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:27:00'),(346,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:27:30'),(347,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:28:00'),(348,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:28:30'),(349,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:29:00'),(350,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:29:24'),(351,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:35:26'),(352,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:35:28'),(353,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:35:37'),(354,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:36:07'),(355,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:36:37'),(356,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:37:00'),(357,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:37:30'),(358,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:37:43'),(359,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:38:13'),(360,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:38:37'),(361,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:39:07'),(362,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:39:36'),(363,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:41:35'),(364,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:41:39'),(365,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:42:04'),(366,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:42:04'),(367,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:42:05'),(368,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:42:44'),(369,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:42:50'),(370,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:43:51'),(371,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:43:57'),(372,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:46:00'),(373,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:46:56'),(374,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:47:26'),(375,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:47:39'),(376,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:47:44'),(377,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:47:50'),(378,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:47:54'),(379,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:48:24'),(380,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:48:54'),(381,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:49:12'),(382,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:49:23'),(383,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:49:57'),(384,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:50:05'),(385,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:50:35'),(386,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:51:05'),(387,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:51:35'),(388,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:51:59'),(389,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:53:03'),(390,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:53:34'),(391,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:53:37'),(392,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:54:07'),(393,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:54:37'),(394,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:54:40'),(395,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:55:00'),(396,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:55:05'),(397,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:55:35'),(398,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:56:00'),(399,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:56:30'),(400,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:00'),(401,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:08'),(402,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:09'),(403,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:10'),(404,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:11'),(405,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:15'),(406,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:16'),(407,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:46'),(408,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:57:59'),(409,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:58:04'),(410,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 00:58:13'),(411,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 01:01:05'),(412,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 01:01:24'),(413,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 01:01:42'),(414,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 01:01:47'),(415,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 01:01:51'),(416,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 01:02:06'),(417,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 01:03:03'),(418,1,8,'view',NULL,NULL,'clinic_stats',1,NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','GET','/api/v1/clinics/1/stats',304,'{}','{\"data\": {\"totalUsers\": 8, \"activeUsers\": 6, \"todayVisits\": 0, \"todayRevenue\": \"0.00\", \"totalPatients\": 13, \"todayAppointments\": 0}}','2026-02-10 01:04:29');
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
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `status` enum('active','suspended') DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email_clinic` (`clinic_id`,`email`),
  KEY `idx_user_clinic` (`clinic_id`),
  KEY `idx_auth_users_avatar` (`avatar_url`),
  CONSTRAINT `auth_users_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1042 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_users`
--

LOCK TABLES `auth_users` WRITE;
/*!40000 ALTER TABLE `auth_users` DISABLE KEYS */;
INSERT INTO `auth_users` VALUES (1,1,'updated@clinic.com','$2a$12$DczZJ9GiQLfUV6KYxnyRredyJjxzWrr2WrXB51l9Enfv8AepvDpgq','Updated','Name','Updated Name',NULL,'active',NULL,'2026-01-20 01:41:47','2026-02-09 17:48:24',NULL),(2,1,'test.owner@clinic.com','$2a$12$wvBZygxvVSFsRBEdrwOt5ewnRThRtWBFMmJxOsGNnsmIxG5SgFmuS','','','Test Owner',NULL,'active',NULL,'2026-01-21 12:49:39','2026-01-21 12:49:39',NULL),(3,1,'test.doctor@clinic.com','$2a$12$nlwEO0WT1uSXexRY.eupWO9cEDmzfe.f2csMsHE2sTl/3mrm/i8hC','','','Test Doctor',NULL,'active',NULL,'2026-01-21 12:49:39','2026-01-21 12:49:39',NULL),(4,1,'test.staff@clinic.com','$2a$12$fBaOluWgoNmviosExPHDcu2/TxqRKfoi8COlek2qI9BKPeu6/XFye','','','Test Staff',NULL,'active',NULL,'2026-01-21 12:49:39','2026-01-21 12:49:39',NULL),(5,1,'test.labtech@clinic.com','$2a$12$4Fla5tmwOanUUSZtCT4OiuwBjlrw2HaI8roeeKK/BKFnJ2aYwbT7W','','','Test Lab Tech',NULL,'active',NULL,'2026-01-21 12:49:39','2026-01-21 12:49:39',NULL),(6,1,'test.roleuser@clinic.com','$2a$12$rm6QH6Av/2k5Zo5Z/9bg6OxP3naUEDaCkjT389OHDpuNo0Y7ywOqu','','','Test Role User',NULL,'suspended',NULL,'2026-01-21 12:54:24','2026-01-21 12:54:24',NULL),(7,1,'testuser@clinic.com','$2a$12$mG4JVvX.Bfm5hACWOaySTOm5kNo6XT0daH3hRvYkqCt2gbjQtF.tq','Test','User','Test User',NULL,'suspended',NULL,'2026-01-21 14:49:56','2026-01-21 14:49:59','2026-01-21 14:49:59'),(8,1,'admin@clinic.com','$2b$10$Qsjb4fc68hqCZYhkpWO9Kuj1EV6wIa0KkREX45M9y/I5KnN4KXhBO','','','System Administrator',NULL,'active',NULL,'2026-01-21 18:04:10','2026-01-21 18:04:10',NULL),(1036,999,'owner@test.com','$2b$12$lj9jzGRseqa9pXbKarChVe7BHLq/mHnuqbuMY1I/JQiHdAADIYrh6','','','Test Owner',NULL,'active',NULL,'2026-02-09 17:51:33','2026-02-09 17:51:33',NULL),(1037,999,'doctor@test.com','$2b$12$lj9jzGRseqa9pXbKarChVe7BHLq/mHnuqbuMY1I/JQiHdAADIYrh6','','','Test Doctor',NULL,'active',NULL,'2026-02-09 17:51:33','2026-02-09 17:51:33',NULL),(1038,999,'staff@test.com','$2b$12$lj9jzGRseqa9pXbKarChVe7BHLq/mHnuqbuMY1I/JQiHdAADIYrh6','','','Test Staff',NULL,'active',NULL,'2026-02-09 17:51:33','2026-02-09 17:51:33',NULL),(1039,999,'labtech@test.com','$2b$12$lj9jzGRseqa9pXbKarChVe7BHLq/mHnuqbuMY1I/JQiHdAADIYrh6','','','Test Lab Tech',NULL,'active',NULL,'2026-02-09 17:51:33','2026-02-09 17:51:33',NULL),(1040,999,'admin@test.com','$2b$12$lj9jzGRseqa9pXbKarChVe7BHLq/mHnuqbuMY1I/JQiHdAADIYrh6','','','Test Admin',NULL,'active',NULL,'2026-02-09 17:51:33','2026-02-09 17:51:33',NULL),(1041,999,'parent@test.com','$2b$12$lj9jzGRseqa9pXbKarChVe7BHLq/mHnuqbuMY1I/JQiHdAADIYrh6','','','Test Parent',NULL,'active',NULL,'2026-02-09 17:51:33','2026-02-09 17:51:33',NULL);
/*!40000 ALTER TABLE `auth_users` ENABLE KEYS */;
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
  CONSTRAINT `billing_items_ibfk_1` FOREIGN KEY (`billing_id`) REFERENCES `bills` (`id`),
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
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bills` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  `visit_id` bigint DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
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
  CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `bills_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `bills_ibfk_3` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
INSERT INTO `bills` VALUES (1,1,1,1,1500.00,1500.00,0.00,1500.00,'unpaid','2026-01-20 01:41:47','2026-01-20 01:41:47');
/*!40000 ALTER TABLE `bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinic_features`
--

DROP TABLE IF EXISTS `clinic_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinic_features` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `feature_name` varchar(100) NOT NULL,
  `is_enabled` tinyint(1) DEFAULT '1',
  `enabled_by` bigint DEFAULT NULL,
  `enabled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `disabled_by` bigint DEFAULT NULL,
  `disabled_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clinic_feature` (`clinic_id`,`feature_name`),
  KEY `enabled_by` (`enabled_by`),
  KEY `disabled_by` (`disabled_by`),
  KEY `idx_clinic_feature_enabled` (`clinic_id`,`feature_name`,`is_enabled`),
  CONSTRAINT `clinic_features_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `clinic_features_ibfk_2` FOREIGN KEY (`enabled_by`) REFERENCES `auth_users` (`id`),
  CONSTRAINT `clinic_features_ibfk_3` FOREIGN KEY (`disabled_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinic_features`
--

LOCK TABLES `clinic_features` WRITE;
/*!40000 ALTER TABLE `clinic_features` DISABLE KEYS */;
INSERT INTO `clinic_features` VALUES (1,1,'appointments',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(2,1,'laboratory',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(3,1,'billing',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(4,1,'parent_portal',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(5,1,'sms_notifications',0,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(6,1,'pediatric_features',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(7,1,'advanced_analytics',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(8,1,'clinical_templates',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(9,1,'vaccine_management',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29'),(10,1,'growth_tracking',1,1,'2026-01-20 13:40:29',NULL,NULL,'2026-01-20 13:40:29','2026-01-20 13:40:29');
/*!40000 ALTER TABLE `clinic_features` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=1030 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinics`
--

LOCK TABLES `clinics` WRITE;
/*!40000 ALTER TABLE `clinics` DISABLE KEYS */;
INSERT INTO `clinics` VALUES (1,'Demo Clinic',NULL,NULL,'demo@clinic.com',NULL,'active',NULL,NULL,'2026-01-20 01:41:47','2026-01-20 01:41:47'),(2,'Happy Kids Medical Center','456 Health Ave, Quezon City','+63-2-987-6543','contact@happykids.com',NULL,'trial',NULL,NULL,'2026-01-21 17:59:14','2026-01-21 17:59:14'),(999,'Test Clinic','Test Address','1234567890','test@clinic.com','Asia/Manila','active',NULL,NULL,'2026-02-09 17:51:32','2026-02-09 17:51:32'),(1000,'System Clinic','System','000','admin@system.com','UTC','trial',NULL,NULL,'2026-01-22 13:04:24','2026-01-22 13:04:24'),(1026,'System','System','000','system@clinic.com','UTC','trial',NULL,NULL,'2026-02-08 00:12:53','2026-02-08 00:12:53'),(1029,'System','System','000','system-admin@clinic.com','UTC','trial',NULL,NULL,'2026-02-08 00:13:34','2026-02-08 00:13:34');
/*!40000 ALTER TABLE `clinics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_access_logs`
--

DROP TABLE IF EXISTS `failed_access_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_access_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `url` varchar(500) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `attempted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_failed_access_ip` (`ip_address`),
  KEY `idx_failed_access_time` (`attempted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_access_logs`
--

LOCK TABLES `failed_access_logs` WRITE;
/*!40000 ALTER TABLE `failed_access_logs` DISABLE KEYS */;
INSERT INTO `failed_access_logs` VALUES (1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','/api/v1/auth/login','POST',401,'2026-01-20 01:42:22'),(2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','/api/v1/auth/login','POST',401,'2026-01-20 01:42:25'),(3,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','/api/v1/auth/login','POST',401,'2026-01-20 01:42:35'),(4,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','/api/v1/auth/login','POST',401,'2026-01-20 12:49:59'),(5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','/api/v1/auth/login','POST',401,'2026-01-20 12:50:03'),(6,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','/api/v1/auth/login','POST',401,'2026-01-20 12:50:49'),(7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','/api/v1/auth/login','POST',401,'2026-01-20 12:51:29');
/*!40000 ALTER TABLE `failed_access_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feature_definitions`
--

DROP TABLE IF EXISTS `feature_definitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feature_definitions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `feature_name` varchar(100) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT NULL,
  `is_core` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feature_name` (`feature_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feature_definitions`
--

LOCK TABLES `feature_definitions` WRITE;
/*!40000 ALTER TABLE `feature_definitions` DISABLE KEYS */;
INSERT INTO `feature_definitions` VALUES (1,'appointments','Appointment Management','Schedule and manage patient appointments','Core Operations',0,'2026-01-20 13:40:29'),(2,'laboratory','Laboratory Management','Lab requests, results, and analytics','Clinical',0,'2026-01-20 13:40:29'),(3,'billing','Billing & Payments','Invoice generation and payment processing','Financial',0,'2026-01-20 13:40:29'),(4,'parent_portal','Parent Portal','Limited access portal for patient guardians','Patient Access',0,'2026-01-20 13:40:29'),(5,'sms_notifications','SMS Notifications','Automated SMS reminders and alerts','Communication',0,'2026-01-20 13:40:29'),(6,'pediatric_features','Pediatric Features','Growth charts, milestones, vaccine tracking','Clinical',0,'2026-01-20 13:40:29'),(7,'advanced_analytics','Advanced Analytics','Clinical reports and data insights','Analytics',0,'2026-01-20 13:40:29'),(8,'clinical_templates','Clinical Templates','Standardized clinical note templates','Clinical',0,'2026-01-20 13:40:29'),(9,'vaccine_management','Vaccine Management','Immunization tracking and compliance','Clinical',0,'2026-01-20 13:40:29'),(10,'growth_tracking','Growth Tracking','WHO growth charts and development milestones','Pediatric',0,'2026-01-20 13:40:29');
/*!40000 ALTER TABLE `feature_definitions` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_request_items`
--

LOCK TABLES `lab_request_items` WRITE;
/*!40000 ALTER TABLE `lab_request_items` DISABLE KEYS */;
INSERT INTO `lab_request_items` VALUES (1,1,1,'completed','2026-01-21 21:31:28'),(2,2,2,'completed','2026-01-21 21:31:28'),(3,3,5,'completed','2026-01-21 21:31:28'),(4,4,4,'completed','2026-01-21 21:31:28'),(5,5,3,'completed','2026-01-21 21:31:28'),(6,6,1,'completed','2026-01-21 21:31:28'),(7,7,2,'completed','2026-01-21 21:31:28'),(8,8,5,'completed','2026-01-21 21:31:28'),(9,9,4,'completed','2026-01-21 21:31:28'),(10,10,3,'completed','2026-01-21 21:31:28'),(11,11,1,'completed','2026-01-21 21:31:28'),(12,12,2,'completed','2026-01-21 21:31:28'),(13,13,5,'completed','2026-01-21 21:31:28'),(14,14,4,'completed','2026-01-21 21:31:28'),(15,15,3,'completed','2026-01-21 21:31:28');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_requests`
--

LOCK TABLES `lab_requests` WRITE;
/*!40000 ALTER TABLE `lab_requests` DISABLE KEYS */;
INSERT INTO `lab_requests` VALUES (1,1,1,2,'LAB288284',8,'2026-01-21 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(2,1,2,3,'LAB288312',8,'2026-01-20 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(3,1,3,4,'LAB288332',8,'2026-01-19 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(4,1,7,5,'LAB288419',8,'2026-01-18 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(5,1,8,6,'LAB288444',8,'2026-01-17 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(6,1,9,7,'LAB288459',8,'2026-01-16 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(7,1,10,8,'LAB288475',8,'2026-01-15 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(8,1,11,9,'LAB288493',8,'2026-01-14 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(9,1,12,10,'LAB288515',8,'2026-01-13 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(10,1,13,11,'LAB288535',8,'2026-01-12 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(11,1,1,12,'LAB288561',8,'2026-01-11 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(12,1,2,13,'LAB288581',8,'2026-01-10 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(13,1,3,14,'LAB288598',8,'2026-01-09 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(14,1,7,15,'LAB288616',8,'2026-01-08 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(15,1,8,16,'LAB288633',8,'2026-01-07 21:31:28','completed','routine',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_result_details`
--

LOCK TABLES `lab_result_details` WRITE;
/*!40000 ALTER TABLE `lab_result_details` DISABLE KEYS */;
INSERT INTO `lab_result_details` VALUES (1,1,1,'Test Parameter','85','mg/dL','70-100',1,'2026-01-21 21:31:28'),(2,2,2,'Test Parameter','90','mg/dL','70-100',0,'2026-01-21 21:31:28'),(3,3,5,'Test Parameter','95','mg/dL','70-100',0,'2026-01-21 21:31:28'),(4,4,4,'Test Parameter','100','mg/dL','70-100',0,'2026-01-21 21:31:28'),(5,5,3,'Test Parameter','105','mg/dL','70-100',1,'2026-01-21 21:31:28'),(6,6,1,'Test Parameter','110','mg/dL','70-100',0,'2026-01-21 21:31:28'),(7,7,2,'Test Parameter','115','mg/dL','70-100',0,'2026-01-21 21:31:28'),(8,8,5,'Test Parameter','120','mg/dL','70-100',0,'2026-01-21 21:31:28'),(9,9,4,'Test Parameter','125','mg/dL','70-100',1,'2026-01-21 21:31:28'),(10,10,3,'Test Parameter','130','mg/dL','70-100',0,'2026-01-21 21:31:28'),(11,11,1,'Test Parameter','135','mg/dL','70-100',0,'2026-01-21 21:31:28'),(12,12,2,'Test Parameter','140','mg/dL','70-100',0,'2026-01-21 21:31:28'),(13,13,5,'Test Parameter','145','mg/dL','70-100',1,'2026-01-21 21:31:28'),(14,14,4,'Test Parameter','150','mg/dL','70-100',0,'2026-01-21 21:31:28'),(15,15,3,'Test Parameter','155','mg/dL','70-100',0,'2026-01-21 21:31:28');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_results`
--

LOCK TABLES `lab_results` WRITE;
/*!40000 ALTER TABLE `lab_results` DISABLE KEYS */;
INSERT INTO `lab_results` VALUES (1,1,1,'2026-01-22 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(2,2,1,'2026-01-21 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(3,3,1,'2026-01-20 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(4,4,1,'2026-01-19 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(5,5,1,'2026-01-18 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(6,6,1,'2026-01-17 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(7,7,1,'2026-01-16 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(8,8,1,'2026-01-15 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(9,9,1,'2026-01-14 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(10,10,1,'2026-01-13 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(11,11,1,'2026-01-12 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(12,12,1,'2026-01-11 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(13,13,1,'2026-01-10 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(14,14,1,'2026-01-09 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(15,15,1,'2026-01-08 21:31:28',8,NULL,'normal',NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
INSERT INTO `lab_tests` VALUES (1,1,'CBC','Complete Blood Count','hematology',NULL,150.00,1,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(2,1,'FBS','Fasting Blood Sugar','chemistry',NULL,80.00,1,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(3,1,'URIN','Urinalysis','urinalysis',NULL,60.00,1,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(4,1,'LIPID','Lipid Profile','chemistry',NULL,200.00,1,'2026-01-21 21:31:28','2026-01-21 21:31:28'),(5,1,'HBA1C','Hemoglobin A1c','chemistry',NULL,300.00,1,'2026-01-21 21:31:28','2026-01-21 21:31:28');
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
-- Table structure for table `patient_milestones`
--

DROP TABLE IF EXISTS `patient_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_milestones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  `milestone_description` varchar(255) NOT NULL,
  `milestone_category` varchar(100) DEFAULT NULL,
  `milestone_type` varchar(100) DEFAULT NULL,
  `expected_age_months` int DEFAULT NULL,
  `achieved_date` date DEFAULT NULL,
  `achieved_age_months` int DEFAULT NULL,
  `notes` text,
  `recorded_by` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `recorded_by` (`recorded_by`),
  KEY `idx_patient_milestones_patient` (`patient_id`),
  KEY `idx_patient_milestones_clinic` (`clinic_id`),
  CONSTRAINT `patient_milestones_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `patient_milestones_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `patient_milestones_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_milestones`
--

LOCK TABLES `patient_milestones` WRITE;
/*!40000 ALTER TABLE `patient_milestones` DISABLE KEYS */;
INSERT INTO `patient_milestones` VALUES (1,1,2,'Lifts head when on tummy','motor','gross_motor',2,'2025-07-05',2,NULL,8,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(2,1,2,'Smiles at people','social','social_emotional',3,'2025-07-25',3,NULL,8,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(3,1,3,'Lifts head when on tummy','motor','gross_motor',2,'2025-07-05',2,NULL,8,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(4,1,3,'Smiles at people','social','social_emotional',3,'2025-07-25',3,NULL,8,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(5,1,14,'Lifts head when on tummy','motor','gross_motor',2,'2025-07-05',2,NULL,8,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(6,1,14,'Smiles at people','social','social_emotional',3,'2025-07-25',3,NULL,8,'2026-01-21 22:33:03','2026-01-21 22:33:03');
/*!40000 ALTER TABLE `patient_milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_vaccines`
--

DROP TABLE IF EXISTS `patient_vaccines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_vaccines` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `clinic_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  `vaccine_name` varchar(255) NOT NULL,
  `vaccine_type` varchar(100) DEFAULT NULL,
  `administered_date` date NOT NULL,
  `dose_number` int DEFAULT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `site_administered` varchar(100) DEFAULT NULL,
  `administered_by` bigint DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `administered_by` (`administered_by`),
  KEY `idx_patient_vaccines_patient` (`patient_id`),
  KEY `idx_patient_vaccines_clinic` (`clinic_id`),
  KEY `idx_patient_vaccines_date` (`administered_date`),
  CONSTRAINT `patient_vaccines_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `patient_vaccines_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `patient_vaccines_ibfk_3` FOREIGN KEY (`administered_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_vaccines`
--

LOCK TABLES `patient_vaccines` WRITE;
/*!40000 ALTER TABLE `patient_vaccines` DISABLE KEYS */;
INSERT INTO `patient_vaccines` VALUES (1,1,2,'BCG',NULL,'2025-03-27',1,NULL,NULL,NULL,8,NULL,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(2,1,2,'DPT',NULL,'2025-05-16',1,NULL,NULL,NULL,8,NULL,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(3,1,3,'BCG',NULL,'2025-03-27',1,NULL,NULL,NULL,8,NULL,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(4,1,3,'DPT',NULL,'2025-05-16',1,NULL,NULL,NULL,8,NULL,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(5,1,14,'BCG',NULL,'2025-03-27',1,NULL,NULL,NULL,8,NULL,'2026-01-21 22:33:03','2026-01-21 22:33:03'),(6,1,14,'DPT',NULL,'2025-05-16',1,NULL,NULL,NULL,8,NULL,'2026-01-21 22:33:03','2026-01-21 22:33:03');
/*!40000 ALTER TABLE `patient_vaccines` ENABLE KEYS */;
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
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,1,'P001','John Doe','John','Doe','1990-01-01','male',NULL,NULL,NULL,NULL,'2026-01-20 01:41:47','2026-01-20 01:41:47',NULL),(2,1,'P002','Maria Garcia','Maria','Garcia','2020-03-22','female','+63-917-123-4567','parent2@email.com',NULL,'New patient','2026-01-21 18:00:06','2026-01-21 18:00:06',NULL),(3,1,'P003','Pedro Santos','Pedro','Santos','2019-08-10','male','+63-918-987-6543','parent3@email.com',NULL,'Follow-up patient','2026-01-21 18:00:06','2026-01-21 18:00:06',NULL),(7,1,'P004','Test Patient 4','','','1994-05-14','male','09000000004',NULL,NULL,NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28',NULL),(8,1,'P005','Test Patient 5','','','1995-06-15','female','09000000005',NULL,NULL,NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28',NULL),(9,1,'P006','Test Patient 6','','','1996-07-16','male','09000000006',NULL,NULL,NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28',NULL),(10,1,'P007','Test Patient 7','','','1997-08-17','female','09000000007',NULL,NULL,NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28',NULL),(11,1,'P008','Test Patient 8','','','1998-09-18','male','09000000008',NULL,NULL,NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28',NULL),(12,1,'P009','Test Patient 9','','','1999-10-19','female','09000000009',NULL,NULL,NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28',NULL),(13,1,'P010','Test Patient 10','','','1990-11-20','male','09000000010',NULL,NULL,NULL,'2026-01-21 21:31:28','2026-01-21 21:31:28',NULL),(14,1,'PED001','Baby Emma','','','2023-06-15','female',NULL,NULL,NULL,NULL,'2026-01-21 22:30:34','2026-01-21 22:30:34',NULL),(15,1,'PED002','Toddler Max','','','2022-03-10','male',NULL,NULL,NULL,NULL,'2026-01-21 22:30:34','2026-01-21 22:30:34',NULL),(16,1,'PED003','Child Sofia','','','2019-08-20','female',NULL,NULL,NULL,NULL,'2026-01-21 22:30:34','2026-01-21 22:30:34',NULL);
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
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`billing_id`) REFERENCES `bills` (`id`),
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permission_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'patients.view','View Patients','Can view patient demographic data and lists.','Patient'),(2,'patients.create','Create Patients','Can create new patient profiles.','Patient'),(3,'appointments.view','View Appointments','Can view the clinic appointment schedule.','Appointment'),(4,'appointments.create','Create Appointments','Can schedule new appointments for patients.','Appointment'),(5,'clinical.diagnoses.create','Create Diagnoses','Can add a clinical diagnosis to a patient visit.','Clinical'),(6,'clinical.vitals.create','Record Vital Signs','Can record patient vital signs.','Clinical'),(7,'labs.requests.create','Create Lab Requests','Can order new laboratory tests for a patient.','Laboratory'),(8,'labs.results.enter','Enter Lab Results','Can enter the results for a completed lab test.','Laboratory'),(9,'billing.invoices.view','View Invoices','Can view patient invoices and billing history.','Billing'),(10,'admin.users.manage','Manage Users','Can create, edit, and suspend users within the clinic.','Admin');
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
) ENGINE=InnoDB AUTO_INCREMENT=1046 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,1,'Super User','System administrator with full access across all clinics','2026-01-20 01:41:47','2026-01-20 01:41:47'),(2,1,'Owner','Clinic owner with full access','2026-01-20 01:41:47','2026-01-20 01:41:47'),(3,1,'Doctor','Medical doctor with clinical privileges','2026-01-20 01:41:47','2026-01-20 01:41:47'),(4,1,'Staff','Administrative staff','2026-01-20 01:41:47','2026-01-20 01:41:47'),(5,1,'Lab Technician','Laboratory technician','2026-01-20 01:41:47','2026-01-20 01:41:47'),(1041,999,'Owner','Test Owner role','2026-02-09 17:51:32','2026-02-09 17:51:32'),(1042,999,'Doctor','Test Doctor role','2026-02-09 17:51:32','2026-02-09 17:51:32'),(1043,999,'Staff','Test Staff role','2026-02-09 17:51:32','2026-02-09 17:51:32'),(1044,999,'Lab Technician','Test Lab Technician role','2026-02-09 17:51:32','2026-02-09 17:51:32'),(1045,999,'Admin','Test Admin role','2026-02-09 17:51:32','2026-02-09 17:51:32');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
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
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `clinic_id` bigint NOT NULL,
  `preference_key` varchar(100) NOT NULL,
  `preference_value` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_preference` (`user_id`,`preference_key`),
  KEY `clinic_id` (`clinic_id`),
  KEY `idx_user_preferences` (`user_id`,`clinic_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`),
  CONSTRAINT `user_preferences_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preferences`
--

LOCK TABLES `user_preferences` WRITE;
/*!40000 ALTER TABLE `user_preferences` DISABLE KEYS */;
INSERT INTO `user_preferences` VALUES (1,1,1,'theme','dark','2026-01-21 13:26:59','2026-02-09 17:48:24'),(2,1,1,'language','en','2026-01-21 13:26:59','2026-02-09 17:48:24'),(3,1,1,'timezone','Asia/Manila','2026-01-21 13:26:59','2026-01-21 13:44:06'),(4,1,1,'dashboard_refresh_interval','60','2026-01-21 13:26:59','2026-01-21 13:44:06'),(5,1,1,'notifications_enabled','true','2026-01-21 13:26:59','2026-02-09 17:48:24'),(6,1,1,'date_format','MM/DD/YYYY','2026-01-21 13:26:59','2026-01-21 13:26:59'),(7,1,1,'time_format','12h','2026-01-21 13:26:59','2026-01-21 13:26:59');
/*!40000 ALTER TABLE `user_preferences` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=358 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,1,'2026-01-20 01:41:47'),(39,1,5,'2026-01-21 17:59:14'),(40,2,2,'2026-01-21 17:59:14'),(41,3,3,'2026-01-21 17:59:14'),(42,4,4,'2026-01-21 17:59:14'),(54,8,1,'2026-01-21 18:04:10'),(353,1036,1041,'2026-02-09 17:51:33'),(354,1037,1042,'2026-02-09 17:51:33'),(355,1038,1043,'2026-02-09 17:51:33'),(356,1039,1044,'2026-02-09 17:51:33'),(357,1040,1041,'2026-02-09 17:51:33');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_diagnoses`
--

LOCK TABLES `visit_diagnoses` WRITE;
/*!40000 ALTER TABLE `visit_diagnoses` DISABLE KEYS */;
INSERT INTO `visit_diagnoses` VALUES (1,2,1,'primary','I10','Hypertension',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(2,2,1,'secondary','E11.9','Type 2 Diabetes Mellitus',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(3,3,1,'primary','E11.9','Type 2 Diabetes Mellitus',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(4,4,1,'primary','J06.9','Upper Respiratory Tract Infection',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(5,5,1,'primary','K59.1','Gastroenteritis',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(6,5,1,'secondary','R51','Headache',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(7,6,1,'primary','R51','Headache',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(8,7,1,'primary','M54.9','Back Pain',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(9,8,1,'primary','J30.9','Allergic Rhinitis',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(10,8,1,'secondary','N39.0','Urinary Tract Infection',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(11,9,1,'primary','N39.0','Urinary Tract Infection',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(12,10,1,'primary','F41.9','Anxiety Disorder',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(13,11,1,'primary','J45.9','Asthma',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(14,11,1,'secondary','I10','Hypertension',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(15,12,1,'primary','I10','Hypertension',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(16,13,1,'primary','E11.9','Type 2 Diabetes Mellitus',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(17,14,1,'primary','J06.9','Upper Respiratory Tract Infection',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(18,14,1,'secondary','K59.1','Gastroenteritis',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(19,15,1,'primary','K59.1','Gastroenteritis',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(20,16,1,'primary','R51','Headache',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(21,17,1,'primary','M54.9','Back Pain',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(22,17,1,'secondary','J30.9','Allergic Rhinitis',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(23,18,1,'primary','J30.9','Allergic Rhinitis',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(24,19,1,'primary','N39.0','Urinary Tract Infection',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(25,20,1,'primary','F41.9','Anxiety Disorder',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(26,20,1,'secondary','J45.9','Asthma',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28'),(27,21,1,'primary','J45.9','Asthma',NULL,8,'2026-01-21 21:31:28','2026-01-21 21:31:28','2026-01-21 21:31:28');
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
  PRIMARY KEY (`id`),
  KEY `clinic_id` (`clinic_id`),
  KEY `recorded_by` (`recorded_by`),
  KEY `idx_visit_vitals` (`visit_id`),
  CONSTRAINT `visit_vital_signs_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`),
  CONSTRAINT `visit_vital_signs_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`),
  CONSTRAINT `visit_vital_signs_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `auth_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_vital_signs`
--

LOCK TABLES `visit_vital_signs` WRITE;
/*!40000 ALTER TABLE `visit_vital_signs` DISABLE KEYS */;
INSERT INTO `visit_vital_signs` VALUES (1,1,1,38.3,145,74,93,NULL,74.00,158.00,29.60,NULL,8,'2026-01-21 21:45:21'),(2,2,1,37.1,134,86,84,NULL,61.00,174.00,20.10,NULL,8,'2026-01-21 21:45:21'),(3,3,1,38.0,127,80,72,NULL,83.00,173.00,27.70,NULL,8,'2026-01-21 21:45:21'),(4,4,1,38.4,138,71,83,NULL,86.00,159.00,34.00,NULL,8,'2026-01-21 21:45:21'),(5,5,1,38.3,137,80,82,NULL,79.00,171.00,27.00,NULL,8,'2026-01-21 21:45:22'),(6,6,1,36.9,140,79,64,NULL,65.00,165.00,23.90,NULL,8,'2026-01-21 21:45:22'),(7,7,1,38.0,123,75,97,NULL,86.00,166.00,31.20,NULL,8,'2026-01-21 21:45:22'),(8,8,1,38.5,134,76,81,NULL,92.00,152.00,39.80,NULL,8,'2026-01-21 21:45:22'),(9,9,1,38.5,140,70,62,NULL,60.00,170.00,20.80,NULL,8,'2026-01-21 21:45:22'),(10,10,1,37.0,115,72,94,NULL,73.00,178.00,23.00,NULL,8,'2026-01-21 21:45:22'),(11,11,1,37.3,125,89,69,NULL,66.00,171.00,22.60,NULL,8,'2026-01-21 21:45:22'),(12,12,1,38.1,140,89,97,NULL,72.00,176.00,23.20,NULL,8,'2026-01-21 21:45:22'),(13,13,1,36.5,116,78,80,NULL,53.00,179.00,16.50,NULL,8,'2026-01-21 21:45:22'),(14,14,1,38.0,149,89,70,NULL,92.00,159.00,36.40,NULL,8,'2026-01-21 21:45:22'),(15,15,1,38.4,139,82,83,NULL,95.00,161.00,36.60,NULL,8,'2026-01-21 21:45:22');
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
INSERT INTO `visits` VALUES (1,1,NULL,1,1,'2026-01-20 01:41:47','open','2026-01-20 01:41:47','2026-01-20 01:41:47'),(2,1,NULL,1,8,'2026-01-21 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(3,1,NULL,2,8,'2026-01-14 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(4,1,NULL,3,8,'2026-01-07 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(5,1,NULL,7,8,'2025-12-31 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(6,1,NULL,8,8,'2025-12-24 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(7,1,NULL,9,8,'2025-12-17 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(8,1,NULL,10,8,'2025-12-10 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(9,1,NULL,11,8,'2025-12-03 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(10,1,NULL,12,8,'2025-11-26 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(11,1,NULL,13,8,'2025-11-19 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(12,1,NULL,1,8,'2025-11-12 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(13,1,NULL,2,8,'2025-11-05 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(14,1,NULL,3,8,'2025-10-29 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(15,1,NULL,7,8,'2025-10-22 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(16,1,NULL,8,8,'2025-10-15 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(17,1,NULL,9,8,'2025-10-08 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(18,1,NULL,10,8,'2025-10-01 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(19,1,NULL,11,8,'2025-09-24 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(20,1,NULL,12,8,'2025-09-17 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(21,1,NULL,13,8,'2025-09-10 00:00:00','closed','2026-01-21 21:31:28','2026-01-21 21:31:28'),(22,1,NULL,14,8,'2026-01-21 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34'),(23,1,NULL,14,8,'2025-12-22 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34'),(24,1,NULL,14,8,'2025-11-22 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34'),(25,1,NULL,15,8,'2026-01-21 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34'),(26,1,NULL,15,8,'2025-12-22 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34'),(27,1,NULL,15,8,'2025-11-22 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34'),(28,1,NULL,16,8,'2026-01-21 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34'),(29,1,NULL,16,8,'2025-12-22 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34'),(30,1,NULL,16,8,'2025-11-22 00:00:00','closed','2026-01-21 22:30:34','2026-01-21 22:30:34');
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

-- Dump completed on 2026-02-10  1:11:40
