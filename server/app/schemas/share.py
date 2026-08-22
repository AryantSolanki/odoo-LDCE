from pydantic import BaseModel


class ShareResponse(BaseModel):
    trip_id: int
    public_id: str
    share_url: str
    is_public: bool
