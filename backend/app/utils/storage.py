import json
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Database setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Model
class ResultTable(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True, index=True)
    campus = Column(String, default="TU")
    semester = Column(String)
    faculty = Column(String)
    year = Column(String)
    status = Column(String, default="Passed")
    reason = Column(String, nullable=True)
    roll_numbers_json = Column(Text)  # Store list as JSON string for compatibility

# Create tables
Base.metadata.create_all(bind=engine)

def load_results():
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
                "roll_numbers": json.loads(r.roll_numbers_json)
            })
        return results
    finally:
        db.close()

def save_results(results):
    db = SessionLocal()
    try:
        # For simplicity, this clear-and-save approach matches the file behavior
        # In a real app, we'd use proper INSERT/UPDATE
        db.query(ResultTable).delete()
        for r in results:
            new_entry = ResultTable(
                campus=r.get("campus", "TU"),
                semester=r.get("semester"),
                faculty=r.get("faculty"),
                year=r.get("year"),
                status=r.get("status", "Passed"),
                reason=r.get("reason"),
                roll_numbers_json=json.dumps(r.get("roll_numbers", []))
            )
            db.add(new_entry)
        db.commit()
    finally:
        db.close()
