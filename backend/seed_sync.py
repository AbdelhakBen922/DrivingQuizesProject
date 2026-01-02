"""
Synchronous version of seed_data script using psycopg2
"""
import psycopg2
from psycopg2.extras import DictCursor
from datetime import timedelta
from decimal import Decimal
import sys
from pathlib import Path

DATABASE_URL = "postgresql://yrfucuvudcdbyjbwfylu:sgmsvriqkevomojytkkwkdqwxwgzzq@9qasp5v56q8ckkf5dc.leapcellpool.com:6438/rxshfspyojbbignklypk?sslmode=require"

def seed_database():
    """Seed the database with initial data"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=DictCursor)
    
    try:
        # Set search path to myschema
        cur.execute("SET search_path TO myschema, public")
        conn.commit()
        
        print("🌱 Starting database seeding...")
        
        # 1. Create Plans
        print("\n📋 Creating plans...")
        plans_data = [
            ('Basic', 'BASIC', Decimal('0.00'), 30, 100, 5, 10),
            ('Premium', 'PREMIUM', Decimal('29.99'), 90, 1000, 50, 100),
            ('Enterprise', 'ENTERPRISE', Decimal('99.99'), 365, 10000, 500, 1000)
        ]
        
        for name, tier, price, valid_days, max_students, max_rooms, max_staff in plans_data:
            cur.execute("""
                INSERT INTO plan (name, tier, price, valid_days, max_students_per_school, max_rooms_per_school, max_staff_per_school)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (name, tier, price, valid_days, max_students, max_rooms, max_staff))
        conn.commit()
        print(f"✅ Created plans")
        
        # 2. Create Schools
        print("\n🏫 Creating schools...")
        schools_data = [
            ('Elite Driving Academy', 'elite@example.com', '+1234567890', '123 Main St, City, State'),
            ('City Driving School', 'city@example.com', '+1234567891', '456 Oak Ave, City, State'),
            ('Highway Masters', 'highway@example.com', '+1234567892', '789 Elm St, City, State')
        ]
        
        cur.execute("SELECT id FROM plan WHERE tier = 'BASIC' LIMIT 1")
        basic_plan_id = cur.fetchone()['id']
        
        school_ids = []
        for name, email, phone, address in schools_data:
            cur.execute("""
                INSERT INTO school (name, email, phone_number, address, active_plan_id)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (name, email, phone, address, basic_plan_id))
            result = cur.fetchone()
            if result:
                school_ids.append(result['id'])
        conn.commit()
        print(f"✅ Created {len(school_ids)} schools")
        
        # 3. Create Staff Users
        print("\n👥 Creating staff users...")
        staff_data = [
            ('Admin User', 'admin@example.com', 'admin123', 'ADMIN'),
            ('John Teacher', 'john@example.com', 'john123', 'TEACHER'),
            ('Sarah Manager', 'sarah@example.com', 'sarah123', 'MANAGER')
        ]
        
        staff_ids = []
        for i, (full_name, email, password, role) in enumerate(staff_data):
            school_id = school_ids[i % len(school_ids)]
            cur.execute("""
                INSERT INTO staff_user (full_name, email, hashed_password, role, school_id)
                VALUES (%s, %s, crypt(%s, gen_salt('bf')), %s, %s)
                ON CONFLICT (email) DO NOTHING
                RETURNING id
            """, (full_name, email, password, role, school_id))
            result = cur.fetchone()
            if result:
                staff_ids.append(result['id'])
        conn.commit()
        print(f"✅ Created {len(staff_ids)} staff users")
        
        # 4. Create Students
        print("\n👨‍🎓 Creating students...")
        students_data = [
            ('S1001', 'Alice Johnson', 'alice@example.com', '+1111111111', 'student123'),
            ('S1002', 'Bob Smith', 'bob@example.com', '+2222222222', 'student123')
        ]
        
        student_ids = []
        for student_id, full_name, email, phone, password in students_data:
            school_id = school_ids[0]
            cur.execute("""
                INSERT INTO students (student_id, full_name, email, phone_number, hashed_password, school_id)
                VALUES (%s, %s, %s, %s, crypt(%s, gen_salt('bf')), %s)
                ON CONFLICT (student_id) DO NOTHING
                RETURNING id
            """, (student_id, full_name, email, phone, password, school_id))
            result = cur.fetchone()
            if result:
                student_ids.append(result['id'])
        conn.commit()
        print(f"✅ Created {len(student_ids)} students")
        
        # 5. Create Rooms
        print("\n🚪 Creating rooms...")
        rooms_data = [
            ('Beginner Class A', 'PRACTICE', 'Intro to driving basics'),
            ('Advanced Highway', 'EXAM', 'Highway driving skills'),
            ('Mixed Practice', 'MIXED', 'General practice room')
        ]
        
        room_ids = []
        for i, (name, room_type, description) in enumerate(rooms_data):
            school_id = school_ids[i % len(school_ids)]
            staff_id = staff_ids[i % len(staff_ids)]
            cur.execute("""
                INSERT INTO rooms (name, room_type, description, school_id, creator_staff_id)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (name, room_type, description, school_id, staff_id))
            result = cur.fetchone()
            if result:
                room_ids.append(result['id'])
        conn.commit()
        print(f"✅ Created {len(room_ids)} rooms")
        
        # 6. Add students to rooms
        print("\n🔗 Adding students to rooms...")
        if room_ids and student_ids:
            for student_id in student_ids:
                for room_id in room_ids[:2]:  # Add to first 2 rooms
                    cur.execute("""
                        INSERT INTO room_members (room_id, student_id, status)
                        VALUES (%s, %s, 'ACTIVE')
                        ON CONFLICT DO NOTHING
                    """, (room_id, student_id))
            conn.commit()
            print(f"✅ Added students to rooms")
        
        # 7. Create Quiz Templates
        print("\n📝 Creating quiz templates...")
        templates_data = [
            ('Basic Theory Test', 'Basic driving theory questions', 20, 15, 'BASIC', 'CAR'),
            ('Advanced Practice', 'Advanced driving scenarios', 30, 20, 'ADVANCED', 'CAR'),
            ('Mock Exam', 'Full mock driving exam', 40, 30, 'INTERMEDIATE', 'CAR')
        ]
        
        template_ids = []
        for i, (name, description, questions, time_limit, difficulty, vehicle) in enumerate(templates_data):
            school_id = school_ids[i % len(school_ids)]
            staff_id = staff_ids[i % len(staff_ids)]
            cur.execute("""
                INSERT INTO quiz_templates (name, description, total_questions, time_limit_minutes, difficulty, vehicle_type, school_id, created_by_staff_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (name, description, questions, time_limit, difficulty, vehicle, school_id, staff_id))
            result = cur.fetchone()
            if result:
                template_ids.append(result['id'])
        conn.commit()
        print(f"✅ Created {len(template_ids)} quiz templates")
        
        # 8. Create Learning Modules
        print("\n📚 Creating learning modules...")
        modules_data = [
            ('Traffic Signs Basics', 'Learn about basic traffic signs', 1, 'CAR', 'BASIC'),
            ('Road Rules', 'Understand road rules and regulations', 2, 'CAR', 'INTERMEDIATE'),
            ('Advanced Maneuvers', 'Master advanced driving techniques', 3, 'CAR', 'ADVANCED')
        ]
        
        module_ids = []
        for i, (title, description, order, vehicle, difficulty) in enumerate(modules_data):
            school_id = school_ids[i % len(school_ids)]
            cur.execute("""
                INSERT INTO learning_modules (title, description, module_order, vehicle_type, difficulty, school_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (title, description, order, vehicle, difficulty, school_id))
            result = cur.fetchone()
            if result:
                module_ids.append(result['id'])
        conn.commit()
        print(f"✅ Created {len(module_ids)} learning modules")
        
        print("\n✅ Database seeding completed successfully!")
        print(f"\n📊 Summary:")
        print(f"   - Schools: {len(school_ids)}")
        print(f"   - Staff Users: {len(staff_ids)}")
        print(f"   - Students: {len(student_ids)}")
        print(f"   - Rooms: {len(room_ids)}")
        print(f"   - Quiz Templates: {len(template_ids)}")
        print(f"   - Learning Modules: {len(module_ids)}")
        
        return {
            'school_ids': school_ids,
            'staff_ids': staff_ids,
            'student_ids': student_ids,
            'room_ids': room_ids
        }
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()
