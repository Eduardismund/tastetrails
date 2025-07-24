from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import qloo_routes, claude_routes, google_maps_routes
app = FastAPI(title="TasteTrails AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"]
)

app.include_router(qloo_routes.router, prefix="/api", tags=["qloo"])
app.include_router(claude_routes.router, prefix="/api", tags=["claude"])
app.include_router(google_maps_routes.router,prefix="/api", tags=["google maps"])

@app.get("/")
def health_check():
    return {"service": "TasteTrails AI", "status": "running"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)