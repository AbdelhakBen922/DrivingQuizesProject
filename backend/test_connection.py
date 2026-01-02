import asyncio
import asyncpg

async def test_connection():
    """Test connection to the database"""
    conn = await asyncpg.connect(
        user='yrfucuvudcdbyjbwfylu',
        password='sgmsvriqkevomojytkkwkdqwxwgzzq',
        database='rxshfspyojbbignklypk',
        host='9qasp5v56q8ckkf5dc.leapcellpool.com',
        port=6438,
        ssl='require'
    )
    
    # Test query
    version = await conn.fetchval('SELECT version()')
    print(f"Connected! PostgreSQL version: {version}")
    
    # Check tables
    tables = await conn.fetch("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    
    print(f"\nTables in database: {len(tables)}")
    for table in tables:
        print(f"  - {table['table_name']}")
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(test_connection())
