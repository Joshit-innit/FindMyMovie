CREATE TABLE IF NOT EXISTS movies (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    movie_id BIGINT NOT NULL,
    title VARCHAR(255),
    rating DECIMAL(4, 2),
    runtime INT,
    poster TEXT,
    genres TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY movies_movie_id_unique (movie_id)
);

CREATE TABLE IF NOT EXISTS availability (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    movie_id BIGINT NOT NULL,
    platform_name VARCHAR(100),
    availability_type VARCHAR(30),
    region VARCHAR(10),
    price DECIMAL(10, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY availability_movie_id_index (movie_id)
);
