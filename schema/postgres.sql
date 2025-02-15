DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;



CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    email VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(180) NOT NULL,
    role VARCHAR(10) NOT NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT '0',
    is_deleted BOOLEAN DEFAULT '0'
);



CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
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
    FOREIGN KEY (parent_id) REFERENCES pages (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);



CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES users (id)
);



CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES users (id)
);



CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  obj_type VARCHAR(10),
  obj_id INTEGER,
  ip VARCHAR(255),
  browser VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP NULL,
  level VARCHAR(10),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
