DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255),
    email VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(180) NOT NULL,
    role VARCHAR(10) NOT NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT '0',
    is_deleted BOOLEAN DEFAULT '0',
    CHECK (is_active IN (0, 1)),
    CHECK (is_deleted IN (0, 1))
);



CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    created_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL
);



CREATE TABLE sessions (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id INTEGER,
    atime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
);



CREATE TABLE pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path VARCHAR(255) UNIQUE,
    params INTEGER DEFAULT '0',
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
    description TEXT,
    description_cached TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    is_system BOOLEAN DEFAULT '0',
    is_navigatable BOOLEAN DEFAULT '0',
    is_published BOOLEAN DEFAULT '0',
    is_deleted BOOLEAN DEFAULT '0',
    FOREIGN KEY(parent_id) REFERENCES pages (id),
    FOREIGN KEY(user_id) REFERENCES users (id),
    CHECK (is_system IN (0, 1)),
    CHECK (is_navigatable IN (0, 1)),
    CHECK (is_published IN (0, 1)),
    CHECK (is_deleted IN (0, 1))
);



CREATE TABLE blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER,
    parent_id INTEGER,
    user_id INTEGER,
    ids TEXT,
    level INTEGER,
    name VARCHAR(20) UNIQUE,
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
    deleted_at TIMESTAMP NULL,
    is_published BOOLEAN DEFAULT '0',
    is_system BOOLEAN DEFAULT '0',
    is_deleted BOOLEAN DEFAULT '0',
    FOREIGN KEY (page_id) REFERENCES pages (id),
    FOREIGN KEY (parent_id) REFERENCES blocks (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    CHECK (is_published IN (0, 1)),
    CHECK (is_system IN (0, 1)),
    CHECK (is_deleted IN (0, 1))
);



CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    user_id INTEGER,
    ids TEXT,
    level INTEGER,
    position INTEGER,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    type VARCHAR(512) NOT NULL,
    filename VARCHAR(512),
    extension VARCHAR(5),
    mimetype VARCHAR(512),
    filesize INTEGER,
    sizes VARCHAR(512),
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    is_navigatable BOOLEAN DEFAULT '0',
    is_published BOOLEAN DEFAULT '0',
    is_system BOOLEAN DEFAULT '0',
    is_deleted BOOLEAN DEFAULT '0',
    FOREIGN KEY (parent_id) REFERENCES documents (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    CHECK (is_navigatable IN (0, 1)),
    CHECK (is_published IN (0, 1)),
    CHECK (is_system IN (0, 1)),
    CHECK (is_deleted IN (0, 1))
);



CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT NULL,
  obj_type VARCHAR(10) DEFAULT NULL,
  obj_id INTEGER DEFAULT NULL,
  ip VARCHAR(255) DEFAULT NULL,
  browser VARCHAR(255) DEFAULT NULL,
  message TEXT,
  created_at TIMESTAMP NULL DEFAULT NULL,
  level VARCHAR(10) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
