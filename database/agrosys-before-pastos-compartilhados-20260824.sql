-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: agrosys
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `animais`
--

DROP TABLE IF EXISTS `animais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `animais` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `brinco` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `raca` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sexo` enum('M','F') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_nascimento` date DEFAULT NULL,
  `data_compra` date DEFAULT NULL,
  `valor_compra` decimal(12,2) DEFAULT NULL,
  `fornecedor` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_nota_fiscal` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso` decimal(10,2) DEFAULT NULL,
  `status` enum('ATIVO','VENDIDO','MORTO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ATIVO',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pasto_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_animais_brinco` (`brinco`),
  KEY `idx_animais_nome` (`nome`),
  KEY `idx_animais_status` (`status`),
  KEY `fk_animais_pasto` (`pasto_id`),
  CONSTRAINT `fk_animais_pasto` FOREIGN KEY (`pasto_id`) REFERENCES `pastos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=343 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animais`
--

LOCK TABLES `animais` WRITE;
/*!40000 ALTER TABLE `animais` DISABLE KEYS */;
INSERT INTO `animais` VALUES (175,'1607G-001',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 20:40:07',6),(176,'1607G-002',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 18:03:21',6),(177,'1607G-003',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 20:40:07',6),(178,'1607G-004',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 20:40:07',6),(179,'1607G-005',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 20:40:07',6),(180,'1607G-006',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 20:40:07',6),(181,'1607G-007',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 20:40:07',6),(182,'1607G-008',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 20:40:07',6),(183,'1607G-009',NULL,'Bovino','Nelore','M','2025-01-01','2026-07-16',2136.60,'GABRIEL MARTINS RIOS','052.492.746',167.00,'VENDIDO',NULL,'2026-08-14 18:20:27','2026-08-19 20:40:18',6),(185,'1607n-001',NULL,'Bovino','Nelore','M','2025-08-16','2026-07-16',2670.00,'WEDER JOSE GOULART','052.492.913',167.00,'VENDIDO',NULL,'2026-08-14 18:22:30','2026-08-19 20:40:18',6),(186,'1607n-002',NULL,'Bovino','Nelore','M','2025-08-16','2026-07-16',2670.00,'WEDER JOSE GOULART','052.492.913',167.00,'VENDIDO',NULL,'2026-08-14 18:22:30','2026-08-19 20:40:18',6),(187,'1607n-003',NULL,'Bovino','Nelore','M','2025-08-16','2026-07-16',2670.00,'WEDER JOSE GOULART','052.492.913',167.00,'VENDIDO',NULL,'2026-08-14 18:22:30','2026-08-19 20:40:18',6),(188,'1607n-004',NULL,'Bovino','Nelore','M','2025-08-16','2026-07-16',2670.00,'WEDER JOSE GOULART','052.492.913',167.00,'ATIVO',NULL,'2026-08-14 18:22:30','2026-08-19 20:40:06',6),(193,'1607m-001',NULL,'Bovino','Nelorado','M','2025-06-16','2026-07-16',2670.00,'GILVAN APARECIDO MAXIMINO FERREIRA e outro(s)','052.493.292',177.00,'VENDIDO',NULL,'2026-08-14 18:24:09','2026-08-19 20:40:18',6),(195,'1607p-001',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'VENDIDO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:18',6),(196,'1607p-002',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'ATIVO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:17',6),(197,'1607p-003',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'ATIVO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:17',6),(198,'1607p-004',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'ATIVO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:17',6),(199,'1607p-005',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'ATIVO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:17',6),(200,'1607p-006',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'ATIVO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:17',6),(201,'1607p-007',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'ATIVO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:17',6),(202,'1607p-008',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'ATIVO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:17',6),(203,'1607p-009',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ALESSANDRO VILELA AZAMBUJA MARQUES','052.493.078',177.00,'VENDIDO',NULL,'2026-08-14 18:25:09','2026-08-19 20:40:18',6),(204,'1607t-001',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(205,'1607t-002',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(206,'1607t-003',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(207,'1607t-004',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(208,'1607t-005',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(209,'1607t-006',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(210,'1607t-007',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(211,'1607t-008',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(212,'1607t-009',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(213,'1607t-010',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(214,'1607t-011',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(215,'1607t-012',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(216,'1607t-013',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(217,'1607t-014',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(218,'1607t-015',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(219,'1607t-016',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(220,'1607t-017',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(221,'1607t-018',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(222,'1607t-019',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(223,'1607t-020',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(224,'1607t-021',NULL,'Bovino','Nelore','M','2026-01-16','2026-07-16',2630.00,'ITAMAR JOSE RESENDE','052.492.959',177.00,'ATIVO',NULL,'2026-08-14 18:26:09','2026-08-14 18:26:09',6),(225,'0608G-001',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(226,'0608G-002',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(227,'0608G-003',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(228,'0608G-004',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(229,'0608G-005',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(230,'0608G-006',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(231,'0608G-007',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(232,'0608G-008',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(233,'0608G-009',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(234,'0608G-010',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(235,'0608G-011',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(236,'0608G-012',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(237,'0608G-013',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(238,'0608G-014',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(239,'0608G-015',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(240,'0608G-016',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(241,'0608G-017',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(242,'0608G-018',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(243,'0608G-019',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(244,'0608G-020',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(245,'0608G-021',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(246,'0608G-022',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(247,'0608G-023',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(248,'0608G-024',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(249,'0608G-025',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(250,'0608G-026',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(251,'0608G-027',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(252,'0608G-028',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(253,'0608G-029',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(254,'0608G-030',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(255,'0608G-031',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(256,'0608G-032',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(257,'0608G-033',NULL,'Bovino','Nelorado','M','2025-08-06','2026-08-06',2940.90,'ITAMAR JOSE RESENDE','052.732.806',197.00,'ATIVO',NULL,'2026-08-14 18:31:41','2026-08-14 18:31:41',4),(258,'0907G-001',NULL,'Bovino','Nelorado','M','2025-10-09','2026-07-09',1900.00,'RAFAEL CUSTODIO PAULINO','052.419.467',160.00,'ATIVO',NULL,'2026-08-14 18:35:24','2026-08-14 18:35:24',6),(259,'3004G-001',NULL,'Bovino','Nelorada','M','2025-07-30','2026-04-30',2750.00,'LUCILENE GOMES RODRIGUES','051.613.543',220.00,'ATIVO',NULL,'2026-08-14 18:41:20','2026-08-14 18:44:50',5),(260,'3004G-002',NULL,'Bovino','Nelorada','M','2025-07-30','2026-04-30',2750.00,'LUCILENE GOMES RODRIGUES','051.613.543',220.00,'ATIVO',NULL,'2026-08-14 18:41:20','2026-08-14 18:45:14',5),(261,'3004G-003',NULL,'Bovino','Nelorada','M','2025-07-30','2026-04-30',2750.00,'LUCILENE GOMES RODRIGUES','051.613.543',220.00,'ATIVO',NULL,'2026-08-14 18:41:20','2026-08-14 18:46:01',5),(262,'3103G-001',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(263,'3103G-002',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(264,'3103G-003',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(265,'3103G-004',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(266,'3103G-005',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(267,'3103G-006',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(268,'3103G-007',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(269,'3103G-008',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(270,'3103G-009',NULL,'Bovino','Nelore','M','2025-07-31','2026-03-31',3111.11,'DIVINO MARIANO DE OLIVEIRA','051.244.347',250.00,'ATIVO',NULL,'2026-08-14 18:42:03','2026-08-14 18:42:03',4),(271,'2804G-001',NULL,'Bovino','Nelorada','F','2022-07-28','2026-04-28',2475.00,'MARIA APARECIDA ALVES DA SILVA e outro(s)','051.575.973',350.00,'ATIVO',NULL,'2026-08-19 16:49:51','2026-08-19 16:49:51',4),(272,'2804G-002',NULL,'Bovino','Nelorada','F','2022-07-28','2026-04-28',2475.00,'MARIA APARECIDA ALVES DA SILVA e outro(s)','051.575.973',350.00,'ATIVO',NULL,'2026-08-19 16:49:51','2026-08-19 16:49:51',4),(273,'2804G-003',NULL,'Bovino','Nelorada','F','2022-07-28','2026-04-28',2475.00,'MARIA APARECIDA ALVES DA SILVA e outro(s)','051.575.973',350.00,'ATIVO',NULL,'2026-08-19 16:49:51','2026-08-19 16:49:51',4),(274,'2804G-004',NULL,'Bovino','Nelorada','F','2022-07-28','2026-04-28',2475.00,'MARIA APARECIDA ALVES DA SILVA e outro(s)','051.575.973',350.00,'ATIVO',NULL,'2026-08-19 16:49:51','2026-08-19 16:49:51',4),(275,'2804G-005',NULL,'Bovino','Nelorada','F','2022-07-28','2026-04-28',2475.00,'MARIA APARECIDA ALVES DA SILVA e outro(s)','051.575.973',350.00,'ATIVO',NULL,'2026-08-19 16:49:51','2026-08-19 16:49:51',4),(276,'2804G-006',NULL,'Bovino','Nelorada','F','2022-07-28','2026-04-28',2475.00,'MARIA APARECIDA ALVES DA SILVA e outro(s)','051.575.973',350.00,'ATIVO',NULL,'2026-08-19 16:49:51','2026-08-19 16:49:51',4),(308,'122025-001','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(309,'122025-002','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:06',1),(310,'122025-003','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:06',1),(311,'122025-004','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:06',1),(312,'122025-005','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:06',1),(313,'122025-006','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(314,'122025-007','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(315,'122025-008','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(316,'122025-009','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(317,'122025-010','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(318,'122025-011','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(319,'122025-012','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(320,'122025-013','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(321,'122025-014','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 18:04:35',1),(322,'122025-015','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(323,'122025-016','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(324,'122025-017','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(325,'122025-018','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(326,'122025-019','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(327,'122025-020','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(328,'122025-021','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(329,'122025-022','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(330,'122025-023','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(331,'122025-024','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(332,'122025-025','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'VENDIDO',NULL,'2026-08-19 17:41:36','2026-08-19 20:24:08',1),(333,'122025-026','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(334,'122025-027','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(335,'122025-028','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(336,'122025-029','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(337,'122025-030','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(338,'122025-031','diversos','Bovino','Nelore','F','2025-06-18','2025-12-31',3000.00,'diversos','123',280.00,'ATIVO',NULL,'2026-08-19 17:41:36','2026-08-24 12:06:24',3),(339,'1908f-001',NULL,'Bovino','Nelore','M','2025-11-19','2026-08-19',1700.00,'FABIANA CANDIDA TEIXEIRA DE SOUSA e outro(s)','052.897.421',165.00,'ATIVO',NULL,'2026-08-20 17:00:50','2026-08-20 17:00:50',11),(340,'1908f-002',NULL,'Bovino','Nelore','M','2025-11-19','2026-08-19',1700.00,'FABIANA CANDIDA TEIXEIRA DE SOUSA e outro(s)','052.897.421',165.00,'ATIVO',NULL,'2026-08-20 17:00:50','2026-08-20 17:00:50',11),(341,'1908G-I2-001',NULL,'Bovino','Nelorada','F','2025-11-19','2026-08-19',1200.00,'MARIA APARECIDA ALVES DA SILVA e outro(s)','052.896.984',160.00,'ATIVO',NULL,'2026-08-20 17:52:15','2026-08-20 17:52:15',4),(342,'1908G-I1-001',NULL,'Bovino','Nelorado','M','2025-11-19','2026-08-19',1900.00,'MARIA APARECIDA ALVES DA SILVA e outro(s)','052.896.984',180.00,'ATIVO',NULL,'2026-08-20 17:52:49','2026-08-20 17:52:49',4);
/*!40000 ALTER TABLE `animais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `inscricao` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inscricao` (`inscricao`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES (1,'Idelfonso','A','2026-08-05 13:04:26'),(2,'Robson','B','2026-08-05 13:04:40'),(3,'Tereza','C','2026-08-12 18:58:57');
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_despesa`
--

DROP TABLE IF EXISTS `categorias_despesa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_despesa` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_despesa`
--

LOCK TABLES `categorias_despesa` WRITE;
/*!40000 ALTER TABLE `categorias_despesa` DISABLE KEYS */;
INSERT INTO `categorias_despesa` VALUES (1,'Vacina','2026-08-13 19:18:29'),(2,'Aquisi├º├úo de animais','2026-08-13 19:18:29'),(3,'Poste','2026-08-13 19:18:29'),(4,'Aluguel','2026-08-13 19:24:56'),(5,'Arrendamento Sirley','2026-08-20 15:16:01'),(6,'Arrendamento Onesio','2026-08-20 15:20:46');
/*!40000 ALTER TABLE `categorias_despesa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contas_bancarias`
--

DROP TABLE IF EXISTS `contas_bancarias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contas_bancarias` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `banco` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `agencia` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conta` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `saldo_inicial` decimal(14,2) NOT NULL DEFAULT '0.00',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contas_bancarias`
--

LOCK TABLES `contas_bancarias` WRITE;
/*!40000 ALTER TABLE `contas_bancarias` DISABLE KEYS */;
INSERT INTO `contas_bancarias` VALUES (1,'001','inter','001','0001',150.00,'2026-08-05 11:18:22');
/*!40000 ALTER TABLE `contas_bancarias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos_agenda`
--

DROP TABLE IF EXISTS `eventos_agenda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_agenda` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_evento` datetime NOT NULL,
  `prioridade` enum('BAIXA','MEDIA','ALTA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIA',
  `recorrencia` enum('NENHUMA','DIARIA','SEMANAL','MENSAL','ANUAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NENHUMA',
  `antecedencia_minutos` int unsigned NOT NULL DEFAULT '1440',
  `status` enum('PENDENTE','CONCLUIDO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_agenda_data_status` (`status`,`data_evento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos_agenda`
--

LOCK TABLES `eventos_agenda` WRITE;
/*!40000 ALTER TABLE `eventos_agenda` DISABLE KEYS */;
INSERT INTO `eventos_agenda` VALUES (1,'Vacinação e Vermifugação','o veterinário Jose irá fazer o procedimento','2026-08-31 14:25:00','MEDIA','NENHUMA',1440,'PENDENTE','2026-08-20 14:26:25'),(2,'Manutenção em cercas','fazer verificação geral das certas','2027-01-10 09:00:00','MEDIA','NENHUMA',1440,'PENDENTE','2026-08-20 14:38:51');
/*!40000 ALTER TABLE `eventos_agenda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_pastos`
--

DROP TABLE IF EXISTS `historico_pastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_pastos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `animal_id` int unsigned NOT NULL,
  `pasto_origem_id` int unsigned DEFAULT NULL,
  `pasto_destino_id` int unsigned DEFAULT NULL,
  `movimentado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observacao` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_historico_origem` (`pasto_origem_id`),
  KEY `fk_historico_destino` (`pasto_destino_id`),
  KEY `idx_historico_data` (`movimentado_em`),
  KEY `idx_historico_animal` (`animal_id`),
  CONSTRAINT `fk_historico_animal` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_historico_destino` FOREIGN KEY (`pasto_destino_id`) REFERENCES `pastos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_historico_origem` FOREIGN KEY (`pasto_origem_id`) REFERENCES `pastos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=365 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_pastos`
--

LOCK TABLES `historico_pastos` WRITE;
/*!40000 ALTER TABLE `historico_pastos` DISABLE KEYS */;
INSERT INTO `historico_pastos` VALUES (189,175,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(190,176,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(191,177,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(192,178,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(193,179,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(194,180,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(195,181,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(196,182,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(197,183,NULL,6,'2026-08-14 15:20:27','Entrada por aquisição em lote'),(198,185,NULL,6,'2026-08-14 15:22:30','Entrada por aquisição em lote'),(199,186,NULL,6,'2026-08-14 15:22:30','Entrada por aquisição em lote'),(200,187,NULL,6,'2026-08-14 15:22:30','Entrada por aquisição em lote'),(201,188,NULL,6,'2026-08-14 15:22:30','Entrada por aquisição em lote'),(202,193,NULL,6,'2026-08-14 15:24:09','Entrada por aquisição em lote'),(203,195,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(204,196,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(205,197,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(206,198,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(207,199,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(208,200,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(209,201,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(210,202,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(211,203,NULL,6,'2026-08-14 15:25:09','Entrada por aquisição em lote'),(212,204,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(213,205,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(214,206,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(215,207,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(216,208,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(217,209,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(218,210,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(219,211,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(220,212,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(221,213,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(222,214,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(223,215,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(224,216,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(225,217,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(226,218,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(227,219,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(228,220,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(229,221,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(230,222,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(231,223,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(232,224,NULL,6,'2026-08-14 15:26:09','Entrada por aquisição em lote'),(233,225,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(234,226,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(235,227,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(236,228,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(237,229,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(238,230,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(239,231,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(240,232,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(241,233,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(242,234,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(243,235,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(244,236,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(245,237,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(246,238,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(247,239,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(248,240,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(249,241,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(250,242,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(251,243,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(252,244,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(253,245,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(254,246,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(255,247,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(256,248,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(257,249,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(258,250,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(259,251,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(260,252,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(261,253,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(262,254,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(263,255,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(264,256,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(265,257,NULL,4,'2026-08-14 15:31:41','Entrada por aquisição em lote'),(266,258,NULL,6,'2026-08-14 15:35:24','Entrada por aquisição em lote'),(267,259,NULL,5,'2026-08-14 15:41:20','Entrada por aquisição em lote'),(268,260,NULL,5,'2026-08-14 15:41:20','Entrada por aquisição em lote'),(269,261,NULL,5,'2026-08-14 15:41:20','Entrada por aquisição em lote'),(270,262,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(271,263,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(272,264,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(273,265,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(274,266,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(275,267,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(276,268,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(277,269,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(278,270,NULL,4,'2026-08-14 15:42:03','Entrada por aquisição em lote'),(279,271,NULL,4,'2026-08-19 13:49:51','Entrada por aquisição em lote'),(280,272,NULL,4,'2026-08-19 13:49:51','Entrada por aquisição em lote'),(281,273,NULL,4,'2026-08-19 13:49:51','Entrada por aquisição em lote'),(282,274,NULL,4,'2026-08-19 13:49:51','Entrada por aquisição em lote'),(283,275,NULL,4,'2026-08-19 13:49:51','Entrada por aquisição em lote'),(284,276,NULL,4,'2026-08-19 13:49:51','Entrada por aquisição em lote'),(316,308,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(317,309,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(318,310,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(319,311,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(320,312,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(321,313,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(322,314,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(323,315,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(324,316,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(325,317,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(326,318,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(327,319,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(328,320,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(329,321,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(330,322,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(331,323,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(332,324,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(333,325,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(334,326,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(335,327,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(336,328,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(337,329,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(338,330,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(339,331,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(340,332,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(341,333,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(342,334,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(343,335,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(344,336,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(345,337,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(346,338,NULL,1,'2026-08-19 14:41:36','Entrada por aquisição em lote'),(347,339,NULL,11,'2026-08-20 14:00:50','Entrada por aquisição em lote'),(348,340,NULL,11,'2026-08-20 14:00:50','Entrada por aquisição em lote'),(349,341,NULL,4,'2026-08-20 14:52:15','Entrada por aquisição em lote'),(350,342,NULL,4,'2026-08-20 14:52:49','Entrada por aquisição em lote'),(351,313,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(352,314,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(353,315,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(354,316,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(355,317,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(356,318,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(357,319,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(358,320,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(359,333,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(360,334,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(361,335,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(362,336,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(363,337,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto'),(364,338,1,3,'2026-08-24 09:06:24','Transferência coletiva de pasto');
/*!40000 ALTER TABLE `historico_pastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_status`
--

DROP TABLE IF EXISTS `historico_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_status` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `animal_id` int unsigned NOT NULL,
  `status_origem` enum('ATIVO','VENDIDO','MORTO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_destino` enum('ATIVO','VENDIDO','MORTO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alterado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_historico_status_animal` (`animal_id`),
  KEY `idx_historico_status_data` (`status_destino`,`alterado_em`),
  CONSTRAINT `fk_historico_status_animal` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_status`
--

LOCK TABLES `historico_status` WRITE;
/*!40000 ALTER TABLE `historico_status` DISABLE KEYS */;
INSERT INTO `historico_status` VALUES (5,175,'ATIVO','VENDIDO','2026-08-19 11:25:23'),(6,176,'ATIVO','VENDIDO','2026-08-19 12:08:12'),(7,177,'ATIVO','VENDIDO','2026-08-19 12:08:12'),(8,178,'ATIVO','VENDIDO','2026-08-19 12:08:12'),(9,179,'ATIVO','VENDIDO','2026-08-19 12:08:12'),(10,180,'ATIVO','VENDIDO','2026-08-19 12:08:12'),(11,181,'ATIVO','VENDIDO','2026-08-19 12:08:12'),(12,182,'ATIVO','VENDIDO','2026-08-19 12:08:12'),(13,308,'ATIVO','VENDIDO','2026-08-19 14:42:41'),(14,309,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(15,310,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(16,311,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(17,312,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(18,313,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(19,314,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(20,315,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(21,316,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(22,317,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(23,318,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(24,319,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(25,320,'ATIVO','VENDIDO','2026-08-19 14:43:10'),(26,183,'ATIVO','VENDIDO','2026-08-19 14:43:50'),(27,185,'ATIVO','VENDIDO','2026-08-19 14:43:50'),(28,186,'ATIVO','VENDIDO','2026-08-19 14:43:50'),(29,187,'ATIVO','VENDIDO','2026-08-19 14:43:50'),(30,188,'ATIVO','VENDIDO','2026-08-19 14:43:50'),(31,193,'ATIVO','VENDIDO','2026-08-19 14:43:50'),(32,195,'ATIVO','VENDIDO','2026-08-19 14:43:50'),(33,196,'ATIVO','VENDIDO','2026-08-19 14:58:53'),(34,197,'ATIVO','VENDIDO','2026-08-19 14:58:53'),(35,198,'ATIVO','VENDIDO','2026-08-19 14:58:53'),(36,199,'ATIVO','VENDIDO','2026-08-19 14:58:53'),(37,200,'ATIVO','VENDIDO','2026-08-19 14:58:53'),(38,201,'ATIVO','VENDIDO','2026-08-19 14:58:53'),(39,202,'ATIVO','VENDIDO','2026-08-19 14:58:53'),(40,176,'ATIVO','VENDIDO','2026-08-19 15:03:17'),(41,321,'ATIVO','VENDIDO','2026-08-19 15:04:33'),(42,193,'VENDIDO','ATIVO','2026-08-19 15:36:35'),(43,308,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(44,322,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(45,323,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(46,324,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(47,325,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(48,326,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(49,327,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(50,328,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(51,329,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(52,330,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(53,331,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(54,332,'ATIVO','VENDIDO','2026-08-19 17:24:06'),(55,175,'ATIVO','VENDIDO','2026-08-19 17:40:06'),(56,177,'ATIVO','VENDIDO','2026-08-19 17:40:06'),(57,178,'ATIVO','VENDIDO','2026-08-19 17:40:06'),(58,179,'ATIVO','VENDIDO','2026-08-19 17:40:06'),(59,180,'ATIVO','VENDIDO','2026-08-19 17:40:06'),(60,181,'ATIVO','VENDIDO','2026-08-19 17:40:06'),(61,182,'ATIVO','VENDIDO','2026-08-19 17:40:06'),(62,183,'ATIVO','VENDIDO','2026-08-19 17:40:17'),(63,185,'ATIVO','VENDIDO','2026-08-19 17:40:17'),(64,186,'ATIVO','VENDIDO','2026-08-19 17:40:17'),(65,187,'ATIVO','VENDIDO','2026-08-19 17:40:17'),(66,193,'ATIVO','VENDIDO','2026-08-19 17:40:17'),(67,195,'ATIVO','VENDIDO','2026-08-19 17:40:17'),(68,203,'ATIVO','VENDIDO','2026-08-19 17:40:17');
/*!40000 ALTER TABLE `historico_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lancamentos_financeiros`
--

DROP TABLE IF EXISTS `lancamentos_financeiros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lancamentos_financeiros` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conta_bancaria_id` int unsigned DEFAULT NULL,
  `animal_id` int unsigned DEFAULT NULL,
  `venda_id` bigint unsigned DEFAULT NULL,
  `area_id` int unsigned DEFAULT NULL,
  `pasto_id` int unsigned DEFAULT NULL,
  `tipo` enum('ENTRADA','SAIDA','COMPRA_GADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fornecedor_cliente` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valor` decimal(14,2) NOT NULL,
  `data_vencimento` date DEFAULT NULL,
  `data_efetivacao` date DEFAULT NULL,
  `data_lancamento` date NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_venda_animal` (`animal_id`,`categoria`),
  KEY `fk_lancamento_conta` (`conta_bancaria_id`),
  KEY `fk_lancamento_area` (`area_id`),
  KEY `fk_lancamento_pasto` (`pasto_id`),
  KEY `idx_lancamento_data` (`data_lancamento`),
  KEY `idx_lancamento_venda` (`venda_id`),
  CONSTRAINT `fk_lancamento_animal` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lancamento_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lancamento_conta` FOREIGN KEY (`conta_bancaria_id`) REFERENCES `contas_bancarias` (`id`),
  CONSTRAINT `fk_lancamento_pasto` FOREIGN KEY (`pasto_id`) REFERENCES `pastos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lancamento_venda` FOREIGN KEY (`venda_id`) REFERENCES `vendas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lancamentos_financeiros`
--

LOCK TABLES `lancamentos_financeiros` WRITE;
/*!40000 ALTER TABLE `lancamentos_financeiros` DISABLE KEYS */;
INSERT INTO `lancamentos_financeiros` VALUES (14,1,NULL,NULL,2,6,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 1607G - 9 animais','GABRIEL MARTINS RIOS',19229.40,'2026-07-16','2026-07-16','2026-07-16','2026-08-14 15:20:27'),(15,1,NULL,NULL,2,6,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 1607n - 4 animais','WEDER JOSE GOULART',10680.00,'2026-07-16','2026-07-16','2026-07-16','2026-08-14 15:22:30'),(16,1,NULL,NULL,2,6,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 1607m - 1 animal','GILVAN APARECIDO MAXIMINO FERREIRA e outro(s)',2670.00,'2026-07-16','2026-07-16','2026-07-16','2026-08-14 15:24:09'),(17,1,NULL,NULL,2,6,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 1607p - 9 animais','ALESSANDRO VILELA AZAMBUJA MARQUES',23670.00,'2026-07-16','2026-07-16','2026-07-16','2026-08-14 15:25:09'),(18,1,NULL,NULL,2,6,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 1607t - 21 animais','ITAMAR JOSE RESENDE',55230.00,'2026-07-16','2026-07-16','2026-07-16','2026-08-14 15:26:09'),(19,1,NULL,NULL,2,4,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 0608G - 33 animais','ITAMAR JOSE RESENDE',97049.70,'2026-08-06','2026-08-06','2026-08-06','2026-08-14 15:31:41'),(20,1,NULL,NULL,2,6,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 0907G - 1 animal','RAFAEL CUSTODIO PAULINO',1900.00,'2026-07-09','2026-07-09','2026-07-09','2026-08-14 15:35:24'),(21,1,NULL,NULL,2,5,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 3004G - 3 animais','LUCILENE GOMES RODRIGUES',8250.00,'2026-04-30','2026-04-30','2026-04-30','2026-08-14 15:41:20'),(22,1,NULL,NULL,2,4,'COMPRA_GADO','Bezerra','Aquisição em lote - 3103G - 9 animais','DIVINO MARIANO DE OLIVEIRA',28000.00,'2026-03-31','2026-03-31','2026-03-31','2026-08-14 15:42:03'),(25,1,NULL,NULL,2,4,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 2804G - 6 animais','MARIA APARECIDA ALVES DA SILVA e outro(s)',14850.00,'2026-04-28','2026-04-28','2026-04-28','2026-08-19 13:49:51'),(26,1,NULL,1,2,NULL,'ENTRADA','Venda de animais','Venda NF 052.635.597 (1/1) - 1 animal','NOME / NOME EMPRESARIAL',5350.00,'2026-08-19','2026-08-19','2026-08-19','2026-08-19 15:03:21'),(28,1,NULL,3,2,4,'ENTRADA','Bezerra','Venda NF 052.714.797 (1/1) - 1 animal','NOME / NOME EMPRESARIAL',3700.00,'2026-08-19','2026-08-19','2026-08-19','2026-08-19 15:08:02'),(34,1,NULL,4,1,NULL,'ENTRADA','Venda de animais','Venda NF 052.712.272 (1/1) - 12 animais','NOME / NOME EMPRESARIAL',48840.00,'2026-08-19','2026-08-19','2026-08-19','2026-08-19 17:24:08'),(35,1,NULL,5,2,NULL,'ENTRADA','Venda de animais','Venda NF 052.630.967 (1/1) - 7 animais','NOME / NOME EMPRESARIAL',24290.00,'2026-08-19','2026-08-19','2026-08-19','2026-08-19 17:40:07'),(36,1,NULL,2,2,NULL,'ENTRADA','Venda de animais','Venda NF 052.720.735 (1/1) - 7 animais','NOME / NOME EMPRESARIAL',31150.00,'2026-08-19','2026-08-19','2026-08-19','2026-08-19 17:40:18'),(37,1,NULL,NULL,3,11,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 1908f - 2 animais','FABIANA CANDIDA TEIXEIRA DE SOUSA e outro(s)',3400.00,'2026-08-19','2026-08-19','2026-08-19','2026-08-20 14:00:50'),(38,1,NULL,NULL,2,4,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 1908G-I2 - 1 animal','MARIA APARECIDA ALVES DA SILVA e outro(s)',1200.00,'2026-08-19','2026-08-19','2026-08-19','2026-08-20 14:52:15'),(39,1,NULL,NULL,2,4,'COMPRA_GADO','Aquisição de animais','Aquisição em lote - 1908G-I1 - 1 animal','MARIA APARECIDA ALVES DA SILVA e outro(s)',1900.00,'2026-08-19','2026-08-19','2026-08-19','2026-08-20 14:52:49'),(40,1,NULL,NULL,2,6,'SAIDA','Arrendamento Sirley','Arrendamento','Sirley',750.00,'2026-08-16','2026-08-16','2026-01-01','2026-08-20 15:18:49'),(41,1,NULL,NULL,2,8,'SAIDA','Arrendamento Onesio','Arrendamento (1/5)','Onésio Borges Filho',700.00,'2026-08-03','2026-08-03','2026-08-03','2026-08-20 15:20:48'),(42,1,NULL,NULL,2,8,'SAIDA','Arrendamento Onesio','Arrendamento (2/5)','Onésio Borges Filho',700.00,'2026-09-03',NULL,'2026-08-03','2026-08-20 15:20:48'),(43,1,NULL,NULL,2,8,'SAIDA','Arrendamento Onesio','Arrendamento (3/5)','Onésio Borges Filho',700.00,'2026-10-03',NULL,'2026-08-03','2026-08-20 15:20:48'),(44,1,NULL,NULL,2,8,'SAIDA','Arrendamento Onesio','Arrendamento (4/5)','Onésio Borges Filho',700.00,'2026-11-03',NULL,'2026-08-03','2026-08-20 15:20:48'),(45,1,NULL,NULL,2,8,'SAIDA','Arrendamento Onesio','Arrendamento (5/5)','Onésio Borges Filho',700.00,'2026-12-03','2026-12-03','2026-08-03','2026-08-20 15:20:48');
/*!40000 ALTER TABLE `lancamentos_financeiros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pastos`
--

DROP TABLE IF EXISTS `pastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pastos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `area_id` int unsigned NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidade` int unsigned DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pasto_area` (`area_id`,`nome`),
  CONSTRAINT `fk_pastos_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pastos`
--

LOCK TABLES `pastos` WRITE;
/*!40000 ALTER TABLE `pastos` DISABLE KEYS */;
INSERT INTO `pastos` VALUES (1,1,'Idel',NULL,'2026-08-05 13:10:23'),(2,1,'maur',NULL,'2026-08-05 13:10:35'),(3,1,'Sir',NULL,'2026-08-05 13:10:46'),(4,2,'Idelfonso',NULL,'2026-08-05 13:11:00'),(5,2,'Mauricio',NULL,'2026-08-05 13:11:07'),(6,2,'Sirley',NULL,'2026-08-05 13:11:13'),(7,2,'Silvio',NULL,'2026-08-05 13:11:18'),(8,2,'Onesio',NULL,'2026-08-05 13:11:28'),(9,2,'Valter',NULL,'2026-08-05 13:11:35'),(10,2,'valtinho',NULL,'2026-08-05 13:11:40'),(11,3,'Piquete 01',20,'2026-08-12 18:59:42'),(12,3,'Piquete 02',NULL,'2026-08-12 19:00:02'),(13,3,'Piquete 03',25,'2026-08-12 19:00:31');
/*!40000 ALTER TABLE `pastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtor_usuarios`
--

DROP TABLE IF EXISTS `produtor_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtor_usuarios` (
  `produtor_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `perfil` enum('ADMIN','USUARIO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USUARIO',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`produtor_id`,`usuario_id`),
  KEY `fk_produtor_usuario_usuario` (`usuario_id`),
  CONSTRAINT `fk_produtor_usuario_produtor` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_produtor_usuario_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtor_usuarios`
--

LOCK TABLES `produtor_usuarios` WRITE;
/*!40000 ALTER TABLE `produtor_usuarios` DISABLE KEYS */;
INSERT INTO `produtor_usuarios` VALUES (1,1,'ADMIN','2026-08-19 17:51:54');
/*!40000 ALTER TABLE `produtor_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtores`
--

DROP TABLE IF EXISTS `produtores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtores` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtores`
--

LOCK TABLES `produtores` WRITE;
/*!40000 ALTER TABLE `produtores` DISABLE KEYS */;
INSERT INTO `produtores` VALUES (1,'Robson',1,'2026-08-19 17:51:54');
/*!40000 ALTER TABLE `produtores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessoes`
--

DROP TABLE IF EXISTS `sessoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessoes` (
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `produtor_id` int unsigned NOT NULL,
  `expira_em` datetime NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_hash`),
  KEY `fk_sessao_usuario` (`usuario_id`),
  KEY `fk_sessao_produtor` (`produtor_id`),
  KEY `idx_sessao_expira` (`expira_em`),
  CONSTRAINT `fk_sessao_produtor` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sessao_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessoes`
--

LOCK TABLES `sessoes` WRITE;
/*!40000 ALTER TABLE `sessoes` DISABLE KEYS */;
INSERT INTO `sessoes` VALUES ('026a4ff972f9c7d7f81989daae063276f9b09ddde4e2441424304647dc857263',1,1,'2026-08-21 01:39:11','2026-08-20 13:39:11'),('12027cbcbefe6116010b726a65c93f265d54a4ae0acadea9f222637ef7d4f6af',1,1,'2026-08-24 20:56:55','2026-08-24 08:56:55'),('123dd334d68d9d50b7604529d83c424886514f063e6fc3de0b49f610650399e5',1,1,'2026-08-20 06:32:18','2026-08-19 18:32:18'),('241a99181b73280bebef79e301162473ec466fe300ad6c726972c0e047dcd3ee',1,1,'2026-08-20 06:10:03','2026-08-19 18:10:03'),('2a9ec3ca422041b9423b339f65251d78b77c9a7361328ce1762b751ba57a2fc1',1,1,'2026-08-20 06:32:32','2026-08-19 18:32:32'),('dcb5b8a91bb1b92567ab3792b70a444dafc5bde8e99d452d023f78b089647df7',1,1,'2026-08-20 06:32:09','2026-08-19 18:32:09'),('e0b26396555ba7c521b753120b504f76eb1e98ffab5e024617e7d470c0528396',1,1,'2026-08-20 06:32:44','2026-08-19 18:32:44'),('e7a0d63add85af0516527c20fd11fb278bde982e91d34c12ac0f7cd3b8fde811',1,1,'2026-08-20 06:32:25','2026-08-19 18:32:25'),('f1f7858f8a42f0d079e93ea33df25038eee52029830f77bee6eb34b652fb63b2',1,1,'2026-08-20 05:54:26','2026-08-19 17:54:26'),('fb3c2937f7de99aed50cd7ec4555d630db6191158d1c9336dbef8a339823d3fb',1,1,'2026-08-20 05:55:17','2026-08-19 17:55:17');
/*!40000 ALTER TABLE `sessoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `titulos_financeiros`
--

DROP TABLE IF EXISTS `titulos_financeiros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `titulos_financeiros` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('RECEBER','PAGAR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fornecedor` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_vencimento` date NOT NULL,
  `valor` decimal(14,2) NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_titulos_vencimento` (`data_vencimento`,`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `titulos_financeiros`
--

LOCK TABLES `titulos_financeiros` WRITE;
/*!40000 ALTER TABLE `titulos_financeiros` DISABLE KEYS */;
/*!40000 ALTER TABLE `titulos_financeiros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `travas_financeiras`
--

DROP TABLE IF EXISTS `travas_financeiras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `travas_financeiras` (
  `produtor_id` int unsigned NOT NULL,
  `data_trava` date NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`produtor_id`),
  KEY `fk_trava_usuario` (`usuario_id`),
  CONSTRAINT `fk_trava_produtor` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trava_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `travas_financeiras`
--

LOCK TABLES `travas_financeiras` WRITE;
/*!40000 ALTER TABLE `travas_financeiras` DISABLE KEYS */;
/*!40000 ALTER TABLE `travas_financeiras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Robson','robson','255534407479454600a0a3280f5c47b2:82bb23fc74692ef35551ff3878fe03522ac74abeb7df4ab93c40b7e861ea5893f3de2aaf425191aafd74a78ac643a46e4318177f76978c4c51f441f64711b4ce',1,'2026-08-19 17:51:54');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venda_animais`
--

DROP TABLE IF EXISTS `venda_animais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venda_animais` (
  `venda_id` bigint unsigned NOT NULL,
  `animal_id` int unsigned NOT NULL,
  PRIMARY KEY (`venda_id`,`animal_id`),
  UNIQUE KEY `uq_animal_vendido` (`animal_id`),
  CONSTRAINT `fk_venda_animal_animal` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`),
  CONSTRAINT `fk_venda_animal_venda` FOREIGN KEY (`venda_id`) REFERENCES `vendas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venda_animais`
--

LOCK TABLES `venda_animais` WRITE;
/*!40000 ALTER TABLE `venda_animais` DISABLE KEYS */;
INSERT INTO `venda_animais` VALUES (5,175),(1,176),(5,177),(5,178),(5,179),(5,180),(5,181),(5,182),(2,183),(2,185),(2,186),(2,187),(2,193),(2,195),(2,203),(4,308),(3,321),(4,322),(4,323),(4,324),(4,325),(4,326),(4,327),(4,328),(4,329),(4,330),(4,331),(4,332);
/*!40000 ALTER TABLE `venda_animais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendas`
--

DROP TABLE IF EXISTS `vendas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `area_id` int unsigned NOT NULL,
  `numero_nota_fiscal` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comprador_nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comprador_documento` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comprador_telefone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comprador_endereco` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_emissao` date NOT NULL,
  `valor_total` decimal(14,2) DEFAULT NULL,
  `data_primeiro_vencimento` date DEFAULT NULL,
  `quantidade_parcelas` smallint unsigned DEFAULT NULL,
  `conta_bancaria_id` int unsigned DEFAULT NULL,
  `observacoes` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('RASCUNHO','CONCLUIDA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RASCUNHO',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_venda_nota_inscricao` (`area_id`,`numero_nota_fiscal`),
  KEY `fk_venda_conta` (`conta_bancaria_id`),
  CONSTRAINT `fk_venda_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`),
  CONSTRAINT `fk_venda_conta` FOREIGN KEY (`conta_bancaria_id`) REFERENCES `contas_bancarias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendas`
--

LOCK TABLES `vendas` WRITE;
/*!40000 ALTER TABLE `vendas` DISABLE KEYS */;
INSERT INTO `vendas` VALUES (1,2,'052.635.597','NOME / NOME EMPRESARIAL','135.821.886-20','34984025156',NULL,'2026-08-19',5350.00,'2026-08-19',1,1,NULL,'CONCLUIDA','2026-08-19 11:25:23','2026-08-19 15:03:21'),(2,2,'052.720.735','NOME / NOME EMPRESARIAL','724.688.151-49','34984025156',NULL,'2026-08-19',31150.00,'2026-08-19',1,NULL,NULL,'CONCLUIDA','2026-08-19 12:08:12','2026-08-19 17:40:18'),(3,1,'052.714.797','NOME / NOME EMPRESARIAL','182.723.046-00','34984025156',NULL,'2026-08-19',3700.00,'2026-08-19',1,NULL,NULL,'CONCLUIDA','2026-08-19 14:42:41','2026-08-19 15:04:35'),(4,1,'052.712.272','NOME / NOME EMPRESARIAL','421.243.178-57','34984025156',NULL,'2026-08-19',48840.00,'2026-08-19',1,NULL,NULL,'CONCLUIDA','2026-08-19 14:43:10','2026-08-19 17:24:08'),(5,2,'052.630.967','NOME / NOME EMPRESARIAL','302.044.886-72','34984025156',NULL,'2026-08-19',24290.00,'2026-08-19',1,NULL,NULL,'CONCLUIDA','2026-08-19 14:43:50','2026-08-19 17:40:07');
/*!40000 ALTER TABLE `vendas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'agrosys'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-24  9:24:11
