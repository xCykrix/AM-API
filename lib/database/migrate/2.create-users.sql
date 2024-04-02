-- TRANSACT CREATE USERS TABLE
CREATE TABLE `rbx_users` (
  `gid` varchar(36) NOT NULL,
  `eid` varchar(45) NOT NULL,
  `password` varchar(128) NOT NULL,
  `tid` varchar(128) NOT NULL,
  `access` varchar(16) NOT NULL,
  PRIMARY KEY (`gid`),
  UNIQUE KEY `gid_UNIQUE` (`gid`),
  UNIQUE KEY `eid_UNIQUE` (`eid`),
  UNIQUE KEY `tid_UNIQUE` (`tid`)
);

-- TRANSACT CREATE JWT TABLE
CREATE TABLE `rbx_users_jwt` (
  `id` int NOT NULL AUTO_INCREMENT,
  `users_tid` varchar(128) NOT NULL,
  `token` varchar(255) NOT NULL,
  `status` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `tid_idx` (`users_tid`),
  CONSTRAINT `tid` FOREIGN KEY (`users_tid`) REFERENCES `rbx_users` (`tid`)
);
