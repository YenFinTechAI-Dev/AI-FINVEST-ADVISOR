import sqlite3
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="AI-FINVEST-ADVISOR")

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# MODEL
# =========================
class Transaction(BaseModel):
    amount: int
    category: str
    type: str      # MuaVao | BanRa
    note: str = ""

# =========================
# DATABASE
# =========================
DB_NAME = "finance.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount INTEGER NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

init_db()

# =========================
# HOME
# =========================
@app.get("/")
def home():
    return {
        "message": "AI-FINVEST API Running"
    }

# =========================
# ADD TRANSACTION
# =========================
@app.post("/api/transactions")
async def add_transaction(item: Transaction):

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        # Chuẩn hóa type
        tx_type = str(item.type).strip()

        # Chỉ cho phép 2 loại
        if tx_type not in ["MuaVao", "BanRa"]:
            raise HTTPException(
                status_code=400,
                detail="type phải là MuaVao hoặc BanRa"
            )

        cursor.execute("""
            INSERT INTO transactions (
                amount,
                category,
                type,
                note
            )
            VALUES (?, ?, ?, ?)
        """, (
            item.amount,
            item.category,
            tx_type,
            item.note
        ))

        conn.commit()
        conn.close()

        return {
            "status": "success",
            "message": "Đã thêm giao dịch"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =========================
# DELETE TRANSACTION
# =========================
@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int):

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM transactions WHERE id = ?",
            (transaction_id,)
        )

        row = cursor.fetchone()

        if not row:
            conn.close()

            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy giao dịch"
            )

        cursor.execute(
            "DELETE FROM transactions WHERE id = ?",
            (transaction_id,)
        )

        conn.commit()
        conn.close()

        return {
            "status": "success",
            "message": f"Đã xóa giao dịch #{transaction_id}"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =========================
# DASHBOARD
# =========================
@app.get("/api/dashboard")
async def get_dashboard_data():

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        # =====================
        # CHART DATA
        # =====================
        cursor.execute("""
            SELECT category, SUM(amount)
            FROM transactions
            WHERE type = 'MuaVao'
            GROUP BY category
        """)

        chart_rows = cursor.fetchall()

        chart_data = {
            "labels": [r[0] for r in chart_rows],
            "values": [r[1] for r in chart_rows]
        }

        # =====================
        # SUMMARY
        # =====================
        cursor.execute("""
            SELECT type, SUM(amount)
            FROM transactions
            GROUP BY type
        """)

        rows = cursor.fetchall()

        summary_map = {
            row[0]: row[1]
            for row in rows
        }

        summary = {
            "total_income": summary_map.get("MuaVao", 0),
            "total_expense": summary_map.get("BanRa", 0)
        }

        # =====================
        # HISTORY
        # =====================
        cursor.execute("""
            SELECT
                id,
                amount,
                category,
                type,
                note,
                created_at
            FROM transactions
            ORDER BY id DESC
            LIMIT 20
        """)

        rows = cursor.fetchall()

        history = []

        for r in rows:
            history.append({
                "id": r[0],
                "amount": r[1],
                "category": r[2],
                "type": r[3],
                "note": r[4],
                "date": r[5]
            })

        conn.close()

        return {
            "chart": chart_data,
            "summary": summary,
            "history": history
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
    app,
    host="0.0.0.0",
    port=port,
    reload=False
)
    