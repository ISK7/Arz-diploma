import pymysql

conn = pymysql.connect(
    host="localhost",
    user="root",
    password="root",
    database="visitors",
)

id = 2
login = "admin"
password = "supersecret"
rights = "01"

with conn.cursor() as cursor:
    cursor.execute(
        "INSERT INTO Users (id, login, password, rights) VALUES (%s, %s, %s, %s)",
        (id, login, password, rights)
    )

conn.commit()
conn.close()
