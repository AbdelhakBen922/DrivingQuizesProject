import psycopg2
from psycopg2.extras import DictCursor

DATABASE_URL = "postgresql://yrfucuvudcdbyjbwfylu:sgmsvriqkevomojytkkwkdqwxwgzzq@9qasp5v56q8ckkf5dc.leapcellpool.com:6438/rxshfspyojbbignklypk?sslmode=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor(cursor_factory=DictCursor)

# List all tables
cur.execute("""
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_type = 'BASE TABLE'
    AND table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
""")

tables = cur.fetchall()
print(f"Found {len(tables)} tables:\n")
for table in tables:
    print(f"  {table['table_schema']}.{table['table_name']}")

# Check alembic version
cur.execute("""
    SELECT version_num FROM alembic_version
""")
version = cur.fetchone()
if version:
    print(f"\nCurrent Alembic version: {version['version_num']}")

cur.close()
conn.close()
