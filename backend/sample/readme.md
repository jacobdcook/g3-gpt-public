# Using SQLite and Python for sample database

## SQLite

### Installation

In a terminal, run `sqlite3` to check if it's installed. If not, you can dowload it [here](https://www.sqlite.org/download.html)

```bash
sqlite3 example.db
# provides and interactive interface for working with the specified db
# it will also create the file when it needs to
```

### SQLite Command Line Tool

In interactive mode:

```
# You can enter SQL commands here to operate on the db
sqlite> CREATE TABLE example_table (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL);

# view current database
sqlite> .database
main: C:\Users\user\example.db

# execute command in outer shell
sqlite> .shell <cmd>
# e.g. '.shell ls' will list the current directory, '.shell clear', etc.

# view all available commands
sqlite> .help

# exit
sqlite> .exit
```

Here are the commands used to create the document and user tables that now exist on the db:

```
sqlite> CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    name TEXT,
    username TEXT NOT NULL UNIQUE,
    admin INTEGER
);

sqlite> CREATE TABLE doc (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    uploaded_by INTEGER,
    requires_admin INTEGER,
    FOREIGN KEY(uploaded_by) REFERENCES user(id)
);
```

## Python API

In python we can use the sqlite3 module to interact with the db file:

```py
import sqlite3 as sql

def main():
    with sql.connect("example.db") as db:
        cursor = db.cursor()

        name = "example"

        # execute the command
        # NOTE: this ? syntax is to avoid SQL injection vulnerability
        # https://docs.python.org/3/library/sqlite3.html#tutorial
        cursor.execute("INSERT INTO example_table (name) VALUES (?)", name)

        query = "SELECT * FROM example_table WHERE name = 'example'"

        res = cursor.execute(query)     # cursor object (holds the result)
        data = res.fetchall()           # query result

        # NOTE: 'fetch' methods can only be used once per command, so it's best to
        # store the value and operate from there

        print(data) # => [(1, 'example')]

        db.commit() # call to save changes (or don't to cancel changes)

if __name__ == '__main__':
    main()
```

## Running the CLI

From a terminal:

```bash
G3-GPT/backend/sample $ python3 cli.py
```
