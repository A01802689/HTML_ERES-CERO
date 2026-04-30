DROP DATABASE IF EXISTS EresCero;

CREATE DATABASE EresCero;
USE EresCero;

-- drops
DROP PROCEDURE IF EXISTS RegistrarUsuario;
DROP TRIGGER IF EXISTS validar_alias_jugador;
DROP TRIGGER IF EXISTS validar_correo_jugador;
DROP TRIGGER IF EXISTS validar_nip_jugador;
DROP TRIGGER IF EXISTS validar_anioNacimiento_jugador;
DROP FUNCTION IF EXISTS IniciarSesion;
DROP TRIGGER IF EXISTS validar_idJugador_partida;
DROP TRIGGER IF EXISTS validar_fechaHora_partida;
DROP TRIGGER IF EXISTS validar_puntaje_partida;
DROP TRIGGER IF EXISTS validar_tiempo_partida;
DROP TRIGGER IF EXISTS validar_idJugador_JL;
DROP TRIGGER IF EXISTS validar_idLogro_JL;
DROP TRIGGER IF EXISTS validar_fecha_JL;
DROP TRIGGER IF EXISTS validar_idJugador_JA;
DROP TRIGGER IF EXISTS validar_idAspecto_JA;
DROP TRIGGER IF EXISTS validar_fecha_JA;
DROP PROCEDURE IF EXISTS CalcularRankingHistorico;
DROP PROCEDURE IF EXISTS CalcularRankingSemanal;
DROP PROCEDURE IF EXISTS DatosJugador;

DROP TABLE IF EXISTS JUGADOR_ASPECTO;
DROP TABLE IF EXISTS JUGADOR_LOGRO;
DROP TABLE IF EXISTS ASPECTO;
DROP TABLE IF EXISTS LOGRO;
DROP TABLE IF EXISTS PARTIDA;
DROP TABLE IF EXISTS JUGADOR;

CREATE TABLE JUGADOR(
  idJugador MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  alias VARCHAR(50) NOT NULL,
  correo VARCHAR(320) UNIQUE NOT NULL,
  nip SMALLINT(4) UNSIGNED NOT NULL,
  anioNacimiento YEAR NOT NULL,
  nivelAlcanzado SMALLINT NOT NULL
);

CREATE TABLE PARTIDA(
  idJugador MEDIUMINT UNSIGNED NOT NULL,
  fechaHora TIMESTAMP NOT NULL,
  PRIMARY KEY(idJugador, fechaHora),
  puntaje MEDIUMINT UNSIGNED NOT NULL,
  dificultad ENUM('facil', 'medio', 'dificil') NOT NULL,
  tiempo DEC(10, 2) NOT NULL,
  -- en segundos
  FOREIGN KEY (idJugador) REFERENCES JUGADOR(idJugador)
  ON DELETE CASCADE
);

CREATE TABLE LOGRO(
  idLogro SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  puntajeRequerido MEDIUMINT UNSIGNED NOT NULL
);

CREATE TABLE ASPECTO(
  idAspecto SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  puntajeRequerido MEDIUMINT UNSIGNED NOT NULL
);

CREATE TABLE JUGADOR_LOGRO(
  idJugador MEDIUMINT UNSIGNED NOT NULL,
  idLogro SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY(idJugador, idLogro),
  fechaDesbloqueo DATE,
  FOREIGN KEY (idJugador) REFERENCES JUGADOR(idJugador)
  ON DELETE CASCADE,
  FOREIGN KEY (idLogro) REFERENCES LOGRO(idLogro)
  ON DELETE CASCADE
);

CREATE TABLE JUGADOR_ASPECTO(
  idJugador MEDIUMINT UNSIGNED NOT NULL,
  idAspecto SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY(idJugador, idAspecto),
  desbloqueado BOOL NOT NULL DEFAULT 0,
  seleccionado BOOL NOT NULL DEFAULT 0,
  fechaDesbloqueo DATE,
  FOREIGN KEY (idJugador) REFERENCES JUGADOR(idJugador)
  ON DELETE CASCADE,
  FOREIGN KEY (idAspecto) REFERENCES ASPECTO(idAspecto)
  ON DELETE CASCADE
);


-- Triggers, Functions, Procedures
DELIMITER $$
CREATE TRIGGER validar_alias_jugador
	BEFORE INSERT ON JUGADOR
	FOR EACH ROW
	BEGIN
		
		IF NEW.alias = "" THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Alias inválido (no puede estar vacío).";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_correo_jugador
	BEFORE INSERT ON JUGADOR
	FOR EACH ROW
	BEGIN
		-- para comprobar posible registro con mismo correo
		DECLARE v_correo VARCHAR(320);
		
		-- IF NEW.correo NOT LIKE '%@%.%' OR
		IF NEW.correo NOT REGEXP '^[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9._+-]@[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]\\.[a-zA-Z]{2,63}$'
		THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Dirección de correo electrónico inválida.";
		END IF;
		
		SELECT correo INTO v_correo FROM JUGADOR WHERE correo=NEW.correo;

		IF v_correo IS NOT NULL THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Ya se ha registrado un usuario con este correo.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_nip_jugador
	BEFORE INSERT ON JUGADOR
	FOR EACH ROW
	BEGIN
		
		IF NEW.nip < 0 OR NEW.nip > 9999 THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="NIP inválido (deben ser cuatro digitos).";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_anioNacimiento_jugador
	BEFORE INSERT ON JUGADOR
	FOR EACH ROW
	BEGIN
		
		IF NEW.anioNacimiento > YEAR(CURRENT_DATE()) THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Año de nacimiento inválido.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_idJugador_partida
	BEFORE INSERT ON PARTIDA
	FOR EACH ROW
	BEGIN
	    DECLARE v_idJugador MEDIUMINT;
	    
	    SELECT idJugador INTO v_idJugador FROM JUGADOR
	    WHERE idJugador=NEW.idJugador;
		
		IF v_idJugador IS NULL THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="No hay un jugador con este ID.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_fechaHora_partida
	BEFORE INSERT ON PARTIDA
	FOR EACH ROW
	BEGIN
		
		IF NEW.fechaHora > CURRENT_TIMESTAMP() THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Partida no válida en el momento actual.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_puntaje_partida
	BEFORE INSERT ON PARTIDA
	FOR EACH ROW
	BEGIN
		
		IF NEW.puntaje < 0 THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="El puntaje no puede ser negativo.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_tiempo_partida
	BEFORE INSERT ON PARTIDA
	FOR EACH ROW
	BEGIN
		
		IF NEW.tiempo < 0 THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="El tiempo no puede ser negativo.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_idJugador_JL
	BEFORE INSERT ON JUGADOR_LOGRO
	FOR EACH ROW
	BEGIN
	    DECLARE v_idJugador MEDIUMINT;
	    
	    SELECT idJugador INTO v_idJugador FROM JUGADOR
	    WHERE idJugador=NEW.idJugador;
		
		IF v_idJugador IS NULL THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="No hay un jugador con este ID.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_idLogro_JL
	BEFORE INSERT ON JUGADOR_LOGRO
	FOR EACH ROW
	BEGIN
	    DECLARE v_idLogro SMALLINT;
	    
	    SELECT idLogro INTO v_idLogro FROM LOGRO
	    WHERE idLogro=NEW.idLogro;
		
		IF v_idLogro IS NULL THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="No hay un logro con este ID.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_fecha_JL
	BEFORE INSERT ON JUGADOR_LOGRO
	FOR EACH ROW
	BEGIN

		IF NEW.fechaDesbloqueo > CURRENT_DATE() THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Fecha de desbloqueo inválida.";
		END IF;

	END $$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_idJugador_JA
	BEFORE INSERT ON JUGADOR_ASPECTO
	FOR EACH ROW
	BEGIN
	    DECLARE v_idJugador MEDIUMINT;
	    
	    SELECT idJugador INTO v_idJugador FROM JUGADOR
	    WHERE idJugador=NEW.idJugador;
		
		IF v_idJugador IS NULL THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="No hay un jugador con este ID.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_idAspecto_JA
	BEFORE INSERT ON JUGADOR_ASPECTO
	FOR EACH ROW
	BEGIN
	    DECLARE v_idAspecto SMALLINT;
	    
	    SELECT idAspecto INTO v_idAspecto FROM ASPECTO
	    WHERE idAspecto=NEW.idAspecto;

		IF v_idAspecto IS NULL THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="No hay un aspecto con este ID.";
		END IF;

	END $$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER validar_fecha_JA
	BEFORE INSERT ON JUGADOR_ASPECTO
	FOR EACH ROW
	BEGIN

		IF NEW.fechaDesbloqueo > CURRENT_DATE() THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Fecha de desbloqueo inválida.";
		END IF;

	END $$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE RegistrarUsuario(
	IN p_alias VARCHAR(50),
	IN p_correo VARCHAR(320),
	IN p_nip SMALLINT(4) UNSIGNED,
	IN p_anioNacimiento YEAR)
	
	BEGIN
	
	DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
			ROLLBACK;
			RESIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Error al registrar nuevo(a) usuario(a)";
		END;
		
	SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
	START TRANSACTION;
	
	INSERT INTO JUGADOR(alias,correo,nip,anioNacimiento,nivelAlcanzado)
	VALUES(p_alias,p_correo,p_nip,p_anioNacimiento,0);
	
	COMMIT;
	
	SELECT LAST_INSERT_ID();

	END $$

DELIMITER ;

DELIMITER $$
CREATE FUNCTION IniciarSesion(p_alias VARCHAR(50), p_nip SMALLINT(4) UNSIGNED)
RETURNS MEDIUMINT
DETERMINISTIC
	
	BEGIN

	DECLARE v_idJugador MEDIUMINT;

	SELECT idJugador INTO v_idJugador FROM JUGADOR
	WHERE alias=p_alias AND nip=p_nip;
	
    RETURN v_idJugador;

	END $$

DELIMITER ;

-- DELIMITER $$
-- CREATE PROCEDURE CalcularRankingHistorico()
	
-- 	BEGIN

-- 	DECLARE EXIT HANDLER FOR SQLEXCEPTION 
-- 		BEGIN
-- 			ROLLBACK;
-- 			RESIGNAL SQLSTATE '45000'
-- 			SET MESSAGE_TEXT="Error al calcular RANKING_HISTORICO";
-- 		END;
		
-- 	SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- 	START TRANSACTION;
	
-- 	DELETE FROM RANKING_HISTORICO;

--     INSERT INTO RANKING_HISTORICO
--     SELECT idJugador,
--     ROW_NUMBER() OVER (ORDER BY puntaje DESC) as posicion,
--     MAX(puntaje) as puntaje
--     FROM PARTIDA GROUP BY idJugador;
    
--     COMMIT;
    
--     SELECT * FROM RANKING_HISTORICO ORDER BY posicion;

-- 	END $$

-- DELIMITER ;

-- DELIMITER $$
-- CREATE PROCEDURE CalcularRankingSemanal()

-- 	BEGIN

-- 	DECLARE EXIT HANDLER FOR SQLEXCEPTION 
-- 		BEGIN
-- 			ROLLBACK;
-- 			RESIGNAL SQLSTATE '45000'
-- 			SET MESSAGE_TEXT="Error al calcular RANKING_SEMANAL";
-- 		END;
		
-- 	SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- 	START TRANSACTION;
	
-- 	DELETE FROM RANKING_SEMANAL;

--     INSERT INTO RANKING_SEMANAL
--     SELECT idJugador,
--     ROW_NUMBER() OVER (ORDER BY puntaje DESC) as posicion,
--     MAX(puntaje) as puntaje
--     FROM PARTIDA
--     WHERE DATE(fechaHora) > DATE_ADD(CURRENT_DATE(), INTERVAL(2-DAYOFWEEK(CURRENT_DATE())) DAY)
--     GROUP BY idJugador;

--     COMMIT;
    
--     SELECT * FROM RANKING_SEMANAL ORDER BY posicion;

-- 	END $$

-- DELIMITER ;

DELIMITER $$
CREATE PROCEDURE CalcularRankingHistorico()
	
	BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
			RESIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Error al calcular RANKING_HISTORICO";
		END;

    SELECT ROW_NUMBER() OVER (ORDER BY rht.puntaje DESC) as posicion,
    j.alias as alias, rht.puntaje as puntaje, j.correo as correo
    FROM (
        SELECT idJugador,
        MAX(puntaje) as puntaje
        FROM PARTIDA GROUP BY idJugador
    ) rht
    JOIN JUGADOR j ON rht.idJugador = j.idJugador
    ORDER BY posicion;

	END $$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE CalcularRankingSemanal()
	
	BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
			RESIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT="Error al calcular RANKING_HISTORICO";
		END;
    
    SELECT ROW_NUMBER() OVER (ORDER BY rst.puntaje DESC) as posicion,
    j.alias as alias, rst.puntaje as puntaje, j.correo as correo
    FROM (
        SELECT idJugador,
        MAX(puntaje) as puntaje
        FROM PARTIDA
        WHERE DATE(fechaHora) >= DATE_ADD(CURRENT_DATE(), INTERVAL(2-DAYOFWEEK(CURRENT_DATE())) DAY)
        GROUP BY idJugador
    ) rst
    JOIN JUGADOR j ON rst.idJugador = j.idJugador
    ORDER BY posicion;

	END $$

DELIMITER ;

-- DELIMITER $$
-- CREATE FUNCTION DatosJugador(p_idJugador MEDIUMINT)
-- RETURNS @res_tabla TABLE
-- (
--     idJugador MEDIUMINT NOT NULL,
--     alias VARCHAR(50) NOT NULL,
--     anioNacimiento YEAR NOT NULL,
--     nivelAlcanzado SMALLINT NOT NULL,
--     puntajeAcumulado INT NOT NULL,
--     totalPartidas INT NOT NULL
-- )
-- AS
	
-- 	BEGIN

--     INSERT INTO @res_tabla
--     SELECT j.idJugador, j.alias, j.anioNacimiento, j.nivelAlcanzado,
--     COALESCE(SUM(p.puntaje), 0) as puntajeAcumulado,
--     COUNT(p.idJugador) as totalPartidas
--     FROM JUGADOR j                
--     JOIN PARTIDA p ON j.idJugador = p.idJugador
--     WHERE j.idJugador = 90;
	
--     RETURN;

-- 	END $$

-- DELIMITER ;

DELIMITER $$
CREATE PROCEDURE DatosJugador(IN p_idJugador MEDIUMINT)
    BEGIN
    DECLARE v_idJugador MEDIUMINT;

    SELECT idJugador INTO v_idJugador
    FROM JUGADOR          
    WHERE idJugador = p_idJugador;
    
    IF v_idJugador IS NULL THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT="No se ha encontrado un jugador con este ID.";
	END IF;

    SELECT j.idJugador, j.alias, j.anioNacimiento,
        j.nivelAlcanzado, t.puntajeAcumulado, t.totalPartidas
    FROM JUGADOR j
    JOIN (
        SELECT COALESCE(SUM(puntaje), 0) as puntajeAcumulado,
        COUNT(idJugador) as totalPartidas
        FROM PARTIDA
        WHERE idJugador = p_idJugador
    ) t
    WHERE j.idJugador = p_idJugador;
    

	END $$

DELIMITER ;

-- Inserts
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 1',       0);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 2',    5000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 3',   10000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 4',   15000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 5',   20000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 6',   25000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 7',   30000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 8',   35000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 9',   40000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 10',  45000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 11',  50000);
INSERT INTO `ASPECTO` (`nombre`, `puntajeRequerido`) VALUES ('Skin 12', 100000);

INSERT INTO `LOGRO` (`nombre`, `descripcion`, `puntajeRequerido`) VALUES ('Travesia infinita',  'Dura 10 minutos en una sola partida',                     0);
INSERT INTO `LOGRO` (`nombre`, `descripcion`, `puntajeRequerido`) VALUES ('Hardcore protocol',  'Atraviesa 20 puertas en dificultad dificil en una partida', 0);
INSERT INTO `LOGRO` (`nombre`, `descripcion`, `puntajeRequerido`) VALUES ('Ambicion creciente', 'Alcanza 10000 puntos en una sola partida',             10000);
INSERT INTO `LOGRO` (`nombre`, `descripcion`, `puntajeRequerido`) VALUES ('Identidad completa', 'Desbloquea todos los aspectos',                            0);
INSERT INTO `LOGRO` (`nombre`, `descripcion`, `puntajeRequerido`) VALUES ('Dominio absoluto',   'Consigue el top 1 en el ranking historico',                0);
INSERT INTO `LOGRO` (`nombre`, `descripcion`, `puntajeRequerido`) VALUES ('Overflow',           'Supera 1,000,000 puntos acumulados',               1000000);
