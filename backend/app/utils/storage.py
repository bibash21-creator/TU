import json
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from filelock import FileLock
import threading

# Database setup
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Thread-safe lock for database operations
_db_lock = threading.Lock()

# SQLAlchemy Models
class ResultTable(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True, index=True)
    campus = Column(String, default="TU")
    semester = Column(String)
    faculty = Column(String)
    year = Column(String)
    status = Column(String, default="Passed")
    reason = Column(String, nullable=True)
    roll_numbers_json = Column(Text)  # List of rolls
    details_json = Column(Text, nullable=True) # Map of roll: {marks, etc.}

class SubscriptionTable(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String, index=True)
    campus = Column(String)
    email = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)

# Create tables with resilient error handling
try:
    Base.metadata.create_all(bind=engine)
    print("✦ Database Oracle initialized successfully.")
except Exception as e:
    print(f"✧ Database Nexus Error: {e}")
    # We don't raise here so the app can at least start and show logs

def load_results():
    try:
        db = SessionLocal()
        try:
            db_results = db.query(ResultTable).all()
            results = []
            for r in db_results:
                results.append({
                    "campus": r.campus,
                    "semester": r.semester,
                    "faculty": r.faculty,
                    "year": r.year,
                    "status": r.status,
                    "reason": r.reason,
                    "roll_numbers": json.loads(r.roll_numbers_json) if r.roll_numbers_json and r.roll_numbers_json != "null" else [],
                    "details": json.loads(r.details_json) if r.details_json and r.details_json != "null" else {}
                })
            return results
        finally:
            db.close()
    except Exception as e:
        print(f"✧ DB Load Error: {e}")
        return []

def save_results(results):
    # Use thread lock to prevent race conditions
    with _db_lock:
        try:
            db = SessionLocal()
            try:
                # Use transaction for atomic operation
                db.query(ResultTable).delete()
                for r in results:
                    new_entry = ResultTable(
                        campus=r.get("campus", "TU"),
                        semester=r.get("semester"),
                        faculty=r.get("faculty"),
                        year=r.get("year"),
                        status=r.get("status", "Passed"),
                        reason=r.get("reason"),
                        roll_numbers_json=json.dumps(r.get("roll_numbers", [])),
                        details_json=json.dumps(r.get("details", {}))
                    )
                    db.add(new_entry)
                db.commit()
            except Exception as e:
                db.rollback()
                raise e
            finally:
                db.close()
        except Exception as e:
            print(f"✧ DB Save Error: {e}")
            raise ValueError(f"Database save error: {str(e)}")

def subscribe_user(roll_number, campus, email=None, whatsapp=None):
    db = SessionLocal()
    try:
        sub = SubscriptionTable(
            roll_number=roll_number,
            campus=campus,
            email=email,
            whatsapp=whatsapp
        )
        db.add(sub)
        db.commit()
        return True
    finally:
        db.close()
