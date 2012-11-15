DROP TABLE `blocks`;
DROP TABLE `pages`;
DROP TABLE `messages`;
DROP TABLE `sessions`;
DROP TABLE `documents`;
DROP TABLE `users`;



CREATE TABLE users (
    id INTEGER NOT NULL AUTO_INCREMENT,
    title VARCHAR(255),
    email VARCHAR(64) NOT NULL,
    password VARCHAR(180) NOT NULL,
    role VARCHAR(10) NOT NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    is_active BOOL DEFAULT '0',
    is_deleted BOOL DEFAULT '0',
    PRIMARY KEY (id),
    UNIQUE (email),
    CHECK (is_active IN (0, 1)),
    CHECK (is_deleted IN (0, 1))
);



CREATE TABLE messages (
	id INTEGER NOT NULL AUTO_INCREMENT,
	message TEXT,
	created_at TIMESTAMP NULL,
	sent_at TIMESTAMP NULL,
	PRIMARY KEY (id)
);



CREATE TABLE sessions (
	session_id VARCHAR(128) NOT NULL,
	user_id INTEGER,
	atime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	data TEXT,
	PRIMARY KEY (session_id),
	FOREIGN KEY(user_id) REFERENCES users (id)
);



CREATE TABLE pages (
	id INTEGER NOT NULL AUTO_INCREMENT,
	path VARCHAR(255),
	slug VARCHAR(255),
	parent_id INTEGER,
	user_id INTEGER,
	level INTEGER,
	ids TEXT,
	type VARCHAR(255),
	position INTEGER,
	size INTEGER,
	name VARCHAR(255) NOT NULL,
	title VARCHAR(255) NOT NULL,
	js_code TEXT,
	css_code TEXT,
	meta_description TEXT,
	meta_keywords TEXT,
	created_at TIMESTAMP NULL,
	updated_at TIMESTAMP NULL,
	published_at TIMESTAMP NULL,
	deleted_at TIMESTAMP NULL,
	is_system BOOL DEFAULT '0',
	is_navigatable BOOL DEFAULT '0',
	is_published BOOL DEFAULT '0',
	is_deleted BOOL DEFAULT '0',
	PRIMARY KEY (id),
	UNIQUE (path),
	FOREIGN KEY(parent_id) REFERENCES pages (id),
	FOREIGN KEY(user_id) REFERENCES users (id),
	CHECK (is_system IN (0, 1)),
	CHECK (is_navigatable IN (0, 1)),
	CHECK (is_published IN (0, 1)),
	CHECK (is_deleted IN (0, 1))
);



CREATE TABLE blocks (
	id INTEGER NOT NULL AUTO_INCREMENT,
	page_id INTEGER,
	parent_id INTEGER,
	user_id INTEGER,
	ids TEXT,
	level INTEGER,
	name VARCHAR(20) NULL,
	position INTEGER,
	template VARCHAR(255),
	type VARCHAR(255),
	size INTEGER,
	content TEXT,
	content_cached TEXT,
	css_class TEXT,
	created_at TIMESTAMP NULL,
	updated_at TIMESTAMP NULL,
	published_at TIMESTAMP NULL,
	is_published BOOL DEFAULT '0',
	is_deleted BOOL DEFAULT '0',
	PRIMARY KEY (id),
	UNIQUE (name),
	FOREIGN KEY(page_id) REFERENCES pages (id),
	FOREIGN KEY(parent_id) REFERENCES blocks (id),
	FOREIGN KEY(user_id) REFERENCES users (id),
	CHECK (is_published IN (0, 1)),
	CHECK (is_deleted IN (0, 1))
);



CREATE TABLE documents (
	id INTEGER NOT NULL AUTO_INCREMENT,
	parent_id INTEGER,
	user_id INTEGER,
	ids TEXT,
	level INTEGER,
	position INTEGER,
	title VARCHAR(512) NOT NULL,
	content TEXT,
	type VARCHAR(512) NOT NULL,
	filename VARCHAR(512),
	extension VARCHAR(4),
	mimetype VARCHAR(512),
	filesize INTEGER,
	sizes VARCHAR(512),
	content_cached TEXT,
	created_at TIMESTAMP NULL,
	updated_at TIMESTAMP NULL,
	is_navigatable BOOL DEFAULT '0',
	is_published BOOL DEFAULT '0',
	is_system BOOL DEFAULT '0',
	is_deleted BOOL DEFAULT '0',
	PRIMARY KEY (id),
	FOREIGN KEY(parent_id) REFERENCES documents (id),
	FOREIGN KEY(user_id) REFERENCES users (id),
	CHECK (is_navigatable IN (0, 1)),
	CHECK (is_published IN (0, 1)),
	CHECK (is_system IN (0, 1)),
	CHECK (is_deleted IN (0, 1))
);
