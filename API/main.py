import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn


app = FastAPI(title="AI-FINVEST-ADVISOR")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Transaction(BaseModel):
    amount: int
    category: str
    type: str
    note: str = ""


DB_NAME = "finance.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount INTEGER NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()


@app.get("/")
def home():
    return {"message": "API Running"}


@app.post("/api/transactions")
async def add_transaction(item: Transaction):
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        clean_type = "Chi" if "Chi" in item.type else "Thu"
        cursor.execute(
            "INSERT INTO transactions (amount, category, type, note) VALUES (?, ?, ?, ?)",
            (item.amount, item.category, clean_type, item.note)
        )
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Giao dịch đã được ghi vào sổ sách."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Thêm endpoint DELETE
@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int):
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM transactions WHERE id = ?", (transaction_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch")
        cursor.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))
        conn.commit()
        conn.close()
        return {"status": "success", "message": f"Đã xóa giao dịch #{transaction_id}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard")
async def get_dashboard_data():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT category, SUM(amount)
            FROM transactions
            WHERE type = 'Chi'
            GROUP BY category
        """)
        chart_rows = cursor.fetchall()
        chart_data = {
            "labels": [row[0] for row in chart_rows],
            "values": [row[1] for row in chart_rows]
        }

        cursor.execute("SELECT type, SUM(amount) FROM transactions GROUP BY type")
        summary_rows = dict(cursor.fetchall())
        summary = {
            "total_income": summary_rows.get("Thu", 0),
            "total_expense": summary_rows.get("Chi", 0)
        }

        # ✅ Thêm id vào history để nút xóa hoạt động
        cursor.execute("""
            SELECT id, amount, category, type, note, created_at
            FROM transactions
            ORDER BY id DESC
            LIMIT 20
        """)
        history_rows = cursor.fetchall()
        history = [
            {
                "id":       r[0],
                "amount":   r[1],
                "category": r[2],
                "type":     r[3],
                "note":     r[4],
                "date":     r[5]
            }
            for r in history_rows
        ]

        conn.close()
        return {
            "chart": chart_data,
            "summary": summary,
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)