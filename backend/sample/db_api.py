import sqlite3 as sql

## BASIC SCHEMA
#
# TABLE user (
#         id INTEGER PRIMARY KEY,
#         name TEXT,
#         username TEXT NOT NULL UNIQUE,
#         password TEXT NOT NULL,
#         admin INTEGER
# );
#
# TABLE doc (
#         id INTEGER PRIMARY KEY,
#         title TEXT NOT NULL,
#         body TEXT,
#         uploaded_by INTEGER,
#         requires_admin INTEGER,
#         FOREIGN KEY(uploaded_by) REFERENCES user(id)
# );


def del_user(username: str):
    with sql.connect("sample.db") as db:
        cur = db.cursor()
        cur.execute("DELETE FROM user WHERE username = ?", (username,))
        db.commit()


def del_doc(title: str):
    with sql.connect("sample.db") as db:
        cur = db.cursor()
        cur.execute("DELETE FROM doc WHERE title = ?", (title,))
        db.commit()


def put_user(name: str, username: str, password: str, admin: bool):
    with sql.connect("sample.db") as db:
        cur = db.cursor()
        cur.execute(
            "INSERT INTO user(name, username, password, admin) VALUES (?, ?, ?, ?)",
            (name, username, password, admin),
        )
        db.commit()


def put_doc(title: str, body: str, uploader_id: int, requires_admin: bool):
    with sql.connect("sample.db") as db:
        cur = db.cursor()
        cur.execute(
            "INSERT INTO doc(title, body, uploaded_by, requires_admin) VALUES (?, ?, ?, ?)",
            (title, body, uploader_id, 1 if requires_admin else 0),
        )
        db.commit()


def get_id_by_username(username: str):
    with sql.connect("sample.db") as db:
        cur = db.cursor()
        cur.execute("SELECT id FROM user WHERE username = ?", (username,))
        res = cur.fetchone()
        return res[0] if res is not None else None
