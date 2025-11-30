from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app.core.database import get_db

app = FastAPI(title="Driving Quiz API")


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health endpoint that validates DB connectivity."""
    db.execute("SELECT 1")
    return {"status": "ok"}
